var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var morganLogger = require('morgan');
const logger = require('./config/winston')

var usersRouter = require('./routes/users');
var booksRouter = require('./routes/books');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(morganLogger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', usersRouter);
app.use('/booksMayank',booksRouter);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  const error = new Error('Not found');
  error.status(404);
  logger.error(error);
  next(error);
});


app.use((error, req, res, next) => {
  res.status(error.status || 500);
  logger.error(error.message);
  res.json({
    error: {
      message: error.message
    }

  });
});

module.exports = app;
