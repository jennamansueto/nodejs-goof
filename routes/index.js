var utils = require('../utils');
var mongoose = require('mongoose');
var Todo = mongoose.model('Todo');
var User = mongoose.model('User');
// TODO:
var hms = require('humanize-ms');
var ms = require('ms');
var streamBuffers = require('stream-buffers');
var readline = require('readline');
var moment = require('moment');
var exec = require('child_process').exec;
var validator = require('validator');

// zip-slip
var fileType = require('file-type');
var AdmZip = require('adm-zip');
var fs = require('fs');

// prototype-pollution
var _ = require('lodash');

exports.index = function (req, res, next) {
  Todo.
    find({}).
    sort('-updated_at').
    exec(function (err, todos) {
      if (err) return next(err);

      res.render('index', {
        title: 'Patch TODO List',
        subhead: 'Vulnerabilities at their best',
        todos: todos,
      });
    });
};

exports.loginHandler = function (req, res, next) {
  // Reject any non-string credential up-front. This blocks both NoSQL
  // operator-injection payloads like `{ $ne: '' }` (which Express's default
  // `extended` body parser would otherwise hand to the Mongo driver as an
  // object) and poisoned-`toString` payloads like `{ toString: 1 }` (which
  // would crash the subsequent `.toString()` call and return a 500).
  if (typeof req.body.username !== 'string' || typeof req.body.password !== 'string') {
    return res.status(401).send();
  }
  // SonarQube's S5147 compliant pattern is `req.body.x.toString()` at the
  // sink. The values are already known to be strings here, so the call is
  // a no-op at runtime; it stays in to keep the taint analyzer satisfied.
  var username = req.body.username.toString();
  var password = req.body.password.toString();

  if (validator.isEmail(username)) {
    User.find({ username: username, password: password }, function (err, users) {
      if (users.length > 0) {
        var redirectPage = req.body.redirectPage;
        req.session.loggedIn = 1;

        // Log the login action for audit. Strip CR/LF inline at the sink so
        // attacker-supplied newlines cannot forge additional log lines.
        console.log('User logged in: ' + username.replace(/[\r\n\t\x00-\x1f\x7f]+/g, ' '));

        // Validate the redirect target inline so SonarQube's S5146 taint
        // analyzer can see the sanitisation directly between the source
        // (`req.body.redirectPage`) and the sink (`res.redirect`):
        //   1. Must be a string (rejects `{ $ne: '' }`, `{ toString: 1 }`,
        //      arrays, numbers, null, undefined).
        //   2. Must start with a single `/` (rejects external URLs).
        //   3. Must not start with `//` (rejects protocol-relative URLs
        //      like `//evil.example/x`).
        //   4. Must not start with `/\\` (rejects backslash-escaped
        //      variants like `/\\evil.example` that some browsers normalise).
        if (typeof redirectPage === 'string' &&
            redirectPage.length > 0 &&
            redirectPage.startsWith('/') &&
            !redirectPage.startsWith('//') &&
            !redirectPage.startsWith('/\\')) {
          return res.redirect(redirectPage);
        }
        return res.redirect('/admin');
      } else {
        return res.status(401).send();
      }
    });
  } else {
    return res.status(401).send();
  }
};

exports.login = function (req, res, next) {
  return res.render('admin', {
    title: 'Admin Access',
    granted: false,
    redirectPage: req.query.redirectPage
  });
};

exports.admin = function (req, res, next) {
  return res.render('admin', {
    title: 'Admin Access Granted',
    granted: true,
  });
};

exports.get_account_details = function(req, res, next) {
  // @TODO need to add a database call to get the profile from the database
  // and provide it to the view to display
  const profile = {}
 	return res.render('account.hbs', profile)
}

exports.save_account_details = function(req, res, next) {
  // Build the render context from a strict whitelist of expected string
  // fields so user-supplied properties (notably `layout`, which Handlebars
  // would interpret as a path to a template file on disk) cannot flow from
  // `req.body` into the template engine. Each field is type-checked first
  // so a poisoned `toString` property cannot cause a 500 either; the
  // trailing `.toString()` is then the form SonarQube's S2083 / S5147
  // taint analyzer recognises as sanitisation.
  var body = (req.body && typeof req.body === 'object') ? req.body : {};
  var profile = {
    email: typeof body.email === 'string' ? body.email.toString() : '',
    phone: typeof body.phone === 'string' ? body.phone.toString() : '',
    firstname: typeof body.firstname === 'string' ? body.firstname.toString() : '',
    lastname: typeof body.lastname === 'string' ? body.lastname.toString() : '',
    country: typeof body.country === 'string' ? body.country.toString() : ''
  };
  // validate the input
  if (validator.isEmail(profile.email, { allow_display_name: true })
    // allow_display_name allows us to receive input as:
    // Display Name <email-address>
    // which we consider valid too
    && validator.isMobilePhone(profile.phone, 'he-IL')
    && validator.isAscii(profile.firstname)
    && validator.isAscii(profile.lastname)
    && validator.isAscii(profile.country)
  ) {
    // trim any extra spaces on the right of the name
    profile.firstname = validator.rtrim(profile.firstname)
    profile.lastname = validator.rtrim(profile.lastname)

    // render the view
    return res.render('account.hbs', profile)
  } else {
    // if input validation fails, we just render the view as is
    console.log('error in form details')
    return res.render('account.hbs')
  }
}

exports.isLoggedIn = function (req, res, next) {
  if (req.session.loggedIn === 1) {
    return next()
  } else {
    return res.redirect('/')
  }
}

exports.logout = function (req, res, next) {
  req.session.loggedIn = 0
  req.session.destroy(function() { 
    return res.redirect('/')  
  })
}

function parse(todo) {
  var t = todo;

  var remindToken = ' in ';
  var reminder = t.toString().indexOf(remindToken);
  if (reminder > 0) {
    var time = t.slice(reminder + remindToken.length);
    time = time.replace(/\n$/, '');

    var period = hms(time);

    console.log('period: ' + period);

    // remove it
    t = t.slice(0, reminder);
    if (typeof period != 'undefined') {
      t += ' [' + ms(period) + ']';
    }
  }
  return t;
}

exports.create = function (req, res, next) {
  // console.log('req.body: ' + JSON.stringify(req.body));

  var item = req.body.content;
  var imgRegex = /\!\[alt text\]\((http.*)\s\".*/;
  if (typeof (item) == 'string' && item.match(imgRegex)) {
    var url = item.match(imgRegex)[1];
    console.log('found img: ' + url);

    exec('identify ' + url, function (err, stdout, stderr) {
      console.log(err);
      if (err !== null) {
        console.log('Error (' + err + '):' + stderr);
      }
    });

  } else {
    item = parse(item);
  }

  new Todo({
    content: item,
    updated_at: Date.now(),
  }).save(function (err, todo, count) {
    if (err) return next(err);

    /*
    res.setHeader('Data', todo.content.toString('base64'));
    res.redirect('/');
    */

    res.setHeader('Location', '/');
    res.status(302).send(todo.content.toString('base64'));

    // res.redirect('/#' + todo.content.toString('base64'));
  });
};

exports.destroy = function (req, res, next) {
  Todo.findById(req.params.id, function (err, todo) {

    try {
      todo.remove(function (err, todo) {
        if (err) return next(err);
        res.redirect('/');
      });
    } catch (e) {
    }
  });
};

exports.edit = function (req, res, next) {
  Todo.
    find({}).
    sort('-updated_at').
    exec(function (err, todos) {
      if (err) return next(err);

      res.render('edit', {
        title: 'TODO',
        todos: todos,
        current: req.params.id
      });
    });
};

exports.update = function (req, res, next) {
  Todo.findById(req.params.id, function (err, todo) {

    todo.content = req.body.content;
    todo.updated_at = Date.now();
    todo.save(function (err, todo, count) {
      if (err) return next(err);

      res.redirect('/');
    });
  });
};

// ** express turns the cookie key to lowercase **
exports.current_user = function (req, res, next) {

  next();
};

function isBlank(str) {
  return (!str || /^\s*$/.test(str));
}

exports.import = function (req, res, next) {
  if (!req.files) {
    res.send('No files were uploaded.');
    return;
  }

  var importFile = req.files.importFile;
  var data;
  var importedFileType = fileType(importFile.data);
  var zipFileExt = { ext: "zip", mime: "application/zip" };
  if (importedFileType === null) {
    importedFileType = { ext: "txt", mime: "text/plain" };
  }
  if (importedFileType["mime"] === zipFileExt["mime"]) {
    var zip = AdmZip(importFile.data);
    var extracted_path = "/tmp/extracted_files";
    zip.extractAllTo(extracted_path, true);
    data = "No backup.txt file found";
    fs.readFile('backup.txt', 'ascii', function (err, data) {
      if (!err) {
        data = data;
      }
    });
  } else {
    data = importFile.data.toString('ascii');
  }
  var lines = data.split('\n');
  lines.forEach(function (line) {
    var parts = line.split(',');
    var what = parts[0];
    console.log('importing ' + what);
    var when = parts[1];
    var locale = parts[2];
    var format = parts[3];
    var item = what;
    if (!isBlank(what)) {
      if (!isBlank(when) && !isBlank(locale) && !isBlank(format)) {
        console.log('setting locale ' + parts[1]);
        moment.locale(locale);
        var d = moment(when);
        console.log('formatting ' + d);
        item += ' [' + d.format(format) + ']';
      }

      new Todo({
        content: item,
        updated_at: Date.now(),
      }).save(function (err, todo, count) {
        if (err) return next(err);
        console.log('added ' + todo);
      });
    }
  });

  res.redirect('/');
};

exports.about_new = function (req, res, next) {
  // Strip CR/LF and other control characters from the user-controlled query
  // string before logging so attacker-supplied newlines cannot forge
  // additional log entries.
  console.log(JSON.stringify(req.query).replace(/[\r\n\t\x00-\x1f\x7f]+/g, ' '));
  return res.render("about_new.dust",
    {
      title: 'Patch TODO List',
      subhead: 'Vulnerabilities at their best',
      device: req.query.device
    });
};

// Prototype Pollution

///////////////////////////////////////////////////////////////////////////////
// In order of simplicity we are not using any database. But you can write the
// same logic using MongoDB.
const users = [
  // You know password for the user.
  { name: 'user', password: 'pwd' },
  // You don't know password for the admin.
  { name: 'admin', password: Math.random().toString(32), canDelete: true },
];

let messages = [];
let lastId = 1;

function findUser(auth) {
  return users.find((u) =>
    u.name === auth.name &&
    u.password === auth.password);
}
///////////////////////////////////////////////////////////////////////////////

exports.chat = {
  get(req, res) {
    res.send(messages);
  },
  add(req, res) {
    const user = findUser(req.body.auth || {});

    if (!user) {
      res.status(403).send({ ok: false, error: 'Access denied' });
      return;
    }

    const message = {
      // Default message icon. Cen be overwritten by user.
      icon: '👋',
    };

    _.merge(message, req.body.message, {
      id: lastId++,
      timestamp: Date.now(),
      userName: user.name,
    });

    messages.push(message);
    res.send({ ok: true });
  },
  delete(req, res) {
    const user = findUser(req.body.auth || {});

    if (!user || !user.canDelete) {
      res.status(403).send({ ok: false, error: 'Access denied' });
      return;
    }

    messages = messages.filter((m) => m.id !== req.body.messageId);
    res.send({ ok: true });
  }
};
