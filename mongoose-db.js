var mongoose = require('mongoose');
var cfenv = require("cfenv");
var crypto = require('crypto');
var Schema = mongoose.Schema;

var Todo = new Schema({
  content: Buffer,
  updated_at: Date,
});

mongoose.model('Todo', Todo);

var User = new Schema({
  username: String,
  password: String,
});

mongoose.model('User', User);

// CloudFoundry env vars
var mongoCFUri = cfenv.getAppEnv().getServiceURL('goof-mongo');
console.log(JSON.stringify(cfenv.getAppEnv()));

// Default Mongo URI is local
const DOCKER = process.env.DOCKER
if (DOCKER === '1') {
  var mongoUri = 'mongodb://goof-mongo/express-todo';
} else {
  var mongoUri = 'mongodb://localhost/express-todo';
}


// CloudFoundry Mongo URI
if (mongoCFUri) {
  mongoUri = mongoCFUri;
} else if (process.env.MONGOLAB_URI) {
  // Generic (plus Heroku) env var support
  mongoUri = process.env.MONGOLAB_URI;
} else if (process.env.MONGODB_URI) {
  // Generic (plus Heroku) env var support
  mongoUri = process.env.MONGODB_URI;
}

console.log("Using Mongo URI " + mongoUri);

mongoose.connect(mongoUri);

User = mongoose.model('User');

// Admin seed password must come from the ADMIN_SEED_PASSWORD env var. To keep the
// local demo runnable without configuration we fall back to a freshly-generated
// random value so no static credential is ever shipped in source.
//
// When falling back to a random value we log it once at startup *only* in
// non-production environments, so a developer running the demo can still log
// in. Production environments must supply the env var explicitly.
var adminSeedPassword = process.env.ADMIN_SEED_PASSWORD
if (!adminSeedPassword) {
  adminSeedPassword = crypto.randomBytes(24).toString('hex');
  if (process.env.NODE_ENV !== 'production') {
    console.log('ADMIN_SEED_PASSWORD not set; generated dev password for admin@snyk.io: ' + adminSeedPassword);
  } else {
    console.log('ADMIN_SEED_PASSWORD not set; generated a random password for the admin seed user.');
  }
}

User.find({ username: 'admin@snyk.io' }).exec(function (err, users) {
  console.log(users);
  if (users.length === 0) {
    console.log('no admin');
    new User({ username: 'admin@snyk.io', password: adminSeedPassword }).save(function (err, user, count) {
      if (err) {
        console.log('error saving admin user');
      }
    });
  }
});