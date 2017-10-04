var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var expressValidator = require('express-validator');
var compression = require('compression');
var helmet = require('helmet');

var index = require('./routes/index');
var users = require('./routes/users');
var catalog = require('./routes/catalog');

var app = express();

app.locals.moment = require('moment');

//set up Mongoose connection
var mongoose = require('mongoose');
var mongoDB = process.env.MONGODB_URI || 'mongodb://your_user_id:your_password@server:port/database';

mongoose.connect(mongoDB, { useMongoClient: true });
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error.'));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(expressValidator()); //Must be added after the bodyParser
app.use(cookieParser());
app.use(compression());
app.use(helmet());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/users', users);
app.use('/catalog', catalog);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;



//mongodb://angelod:123@cabojodb-shard-00-00-naqf4.mongodb.net:27017,cabojodb-shard-00-01-naqf4.mongodb.net:27017,cabojodb-shard-00-02-naqf4.mongodb.net:27017/Library?ssl=true&replicaSet=cabojoDB-shard-0&authSource=admin

//mongo "mongodb://cabojodb-shard-00-00-naqf4.mongodb.net:27017,cabojodb-shard-00-01-naqf4.mongodb.net:27017,cabojodb-shard-00-02-naqf4.mongodb.net:27017/test?replicaSet=cabojoDB-shard-0" --authenticationDatabase admin --ssl --username angelod --password 123
