// express
var express = require('express');

// dependencies
var debug = require('debug');
var mongoose = require('mongoose');
var nunjucks = require('nunjucks');

// app
var config = require('./config');
var schemas = require('./schemas');

// routes


var app = express();

// view engine setup
app.set('views', __dirname + '/views');
nunjucks.configure('views', {
  autoescape: true,
  express: app,
});

// mongodb setup and listeners
var con = mongoose.createConnection(config.mongodb);
con.on('error', console.error.bind('Error connecting to MongoDB:'));
con.once('open', function () {
  console.log('Connected to MongoDB.');
  // call db init code as soon as connection is available
  schemas.init(con);
});

// statically serve public folder
app.use(express.static(__dirname + '/public'));

// add mongoose models to request
app.use(function (req, res, next) {
  req.db = con;
  req.models = schemas.getModels(con);
  return next();
});

// log requests and their total duration
var reqLog = debug('app:requests');
app.use(function (req, res, next) {
  var reqStart = Date.now();
  var reqUrl = req.url;
  res.on('finish', function () {
    var time = Date.now() - reqStart;
    reqLog('%s %s: %d (%dms)', req.method, reqUrl, res.statusCode, time);
  });
  return next();
});

// set MIME type of API requests
app.use('/api', function (req, res, next) {
  res.type('application/json');
  return next();
});


// app routes



var appError = debug('app:errors');

// API error handlers
app.use('/api', function (req, res, next) {
  res.status(404).end();
});

app.use('/api', function (err, req, res, next) {
  appError('Unhandled API error:', err);
  res.status(500).end();
});

// page error handlers
app.use(function (req, res, next) {
  res.status(404).render('404.html');
});

app.use(function (err, req, res, next) {
  appError('Unhandled error:', err);
  res.status(500).render('500.html');
});


module.exports = app;
