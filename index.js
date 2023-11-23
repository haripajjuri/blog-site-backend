var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const mongoose = require('mongoose');
const cors = require('cors');
const router = require('./Routes');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(cors({credentials:true,origin:'http://localhost:3000'}));

app.use('/uploads',express.static(__dirname+'/uploads'));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', router);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
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

const conn_str = "mongodb+srv://hari:1234@cluster0.oc73k3b.mongodb.net/?retryWrites=true&w=majority"
url="mongodb://127.0.0.1:27017/blogApp";

mongoose.connect(conn_str).then(()=>{
  console.log('database is connected');
}).catch((err)=>{
  console.log(err);
})

module.exports = app;
