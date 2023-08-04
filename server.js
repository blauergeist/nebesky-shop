const mongoose = require('mongoose');
const dotenv = require('dotenv');
const session = require('express-session');
const MongoStore = require('connect-mongo');

dotenv.config({ path: './config.env' });
const app = require('./app');

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose.connect(DB).then(() => {
  console.log('DB connection successful');
});

// Create a new instance of MongoStore with the 'mongooseConnection' option
const store = MongoStore.create({
  mongoUrl: DB,
  mongooseConnection: mongoose.connection,
});

// Set up the session middleware using 'express-session' and the MongoStore instance
app.use(
  session({
    secret: 'your-secret-key123123123',
    resave: false,
    saveUninitialized: false,
    store, // Use the 'store' instance created above
  })
);

// const store = new MongoStore({
//   mongooseConnection: mongoose.createConnection(),
// });

// // Setting up a session
// app.use(
//   session({
//     secret: 'your-secret-key123123123',
//     resave: false,
//     saveUninitialized: false,
//     store: new MongoStore({
//       mongooseConnection: mongoose.createConnection(),
//     }),
//   })
// );

const port = process.env.port || 3000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}`);
});

process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);
  console.log('Unhandled rejection!');
  server.close(() => {
    process.exit(1);
  });
});

process.on('uncaughtException', (err) => {
  console.log(err.name, err.message);
  console.log('Uncaught exception!');
  server.close(() => {
    process.exit(1);
  });
});
