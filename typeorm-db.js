var typeorm = require("typeorm");
var EntitySchema = typeorm.EntitySchema;

const Users = require("./entity/Users")

const mysqlHost = process.env.MYSQL_HOST || "localhost";
const mysqlPort = parseInt(process.env.MYSQL_PORT || "3306", 10);
const mysqlUsername = process.env.MYSQL_USERNAME || "root";
const mysqlPassword = process.env.MYSQL_PASSWORD || "";
const mysqlDatabase = process.env.MYSQL_DATABASE || "acme";

if (!process.env.MYSQL_PASSWORD) {
  console.warn('MYSQL_PASSWORD is not set; connecting to MySQL with an empty password (development default).');
}

typeorm.createConnection({
  name: "mysql",
  type: "mysql",
  host: mysqlHost,
  port: mysqlPort,
  username: mysqlUsername,
  password: mysqlPassword,
  database: mysqlDatabase,
  synchronize: true,
  "logging": true,
  entities: [
    new EntitySchema(Users)
  ]
}).then(() => {

  const dbConnection = typeorm.getConnection('mysql')

  const repo = dbConnection.getRepository("Users")
  return repo
}).then((repo) => {


  console.log('Seeding 2 users to MySQL users table: Liran (role: user), Simon (role: admin')
  const inserts = [
    repo.insert({
      name: "Liran",
      address: "IL",
      role: "user"
    }),
    repo.insert({
      name: "Simon",
      address: "UK",
      role: "admin"
    })
  ];

  return Promise.all(inserts)
}).catch((err) => {
  console.error('failed connecting and seeding users to the MySQL database')
  console.error(err)
})
