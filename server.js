/**
 * server.js
 * Application entry point. Wires up Express, sessions, view engine,
 * static assets, routes, and error handling.
 */

const express = require('express');
const session = require('express-session');
const path = require('path');

const { PORT, SESSION_SECRET } = require('./config/constants');
const { initSchema } = require('./config/database');
const { notFoundHandler, errorHandler } = require('./middleware/errorMiddleware');
const { loggingService } = require('./services/serviceFactory');

// Initialize the SQLite schema (creates tables if they don't exist yet).
initSchema();

const app = express();

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Core middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days - "remember logged-in user"
      httpOnly: true,
    },
  })
);

// Make the logged-in user available to every view without repeating it in every controller.
app.use((req, res, next) => {
  res.locals.currentUser = req.session ? req.session.user : null;
  next();
});

// Routes
app.use('/', require('./routes/index'));

// 404 + error handling (must be registered last)
app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, "0.0.0.0", () => {
  loggingService.info(`CloudVault server started on http://0.0.0.0:${PORT}`);
  console.log(`\nCloudVault is running at http://0.0.0.0:${PORT}\n`);
});
