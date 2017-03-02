var express=require('express');
var bodyParser=require('body-parser');
var mongoose=require('mongoose');
var passport=require('passport');
var LocalStrategy=require('passport-local').Strategy;
var session = require('express-session');
var flash = require('connect-flash');
var path = require('path');
var fs = require("fs");
var multer  = require('multer');
var paginate = require('express-paginate');
//var userUploadsPath = path.resolve(__dirname, "user_uploads");
var expressValidator = require('express-validator');
var router= require('./app/routes');
var app = express();
var DB_URI = "mongodb://localhost:27017/portfolio";




// Body Parser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));

// View Engine
app.set('view engine','ejs');
//Static PAth
app.use(express.static(__dirname +'/public/user_uploads'));
// Express Session
app.use(session({
    secret: 'secret',
    saveUninitialized: true,
    resave: true
}));



//Passport init
app.use(passport.initialize());
app.use(passport.session());
//To remove the warning
mongoose.Promise = global.Promise;
//DB connection
mongoose.connect(DB_URI,function(err)
{
	if(err)
	{
		console.log('There is an erroor: ' + err);

	}else{
		console.log('Success!');
	}
});


// Express Validator
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));

// Connect Flash
app.use(flash());


//Global Vars
app.use(function (req, res, next) {
  res.locals.req = req;
  res.locals.res = res;
  res.locals.message = req.message;
  res.locals.errors=null;
  res.locals.messages=null;
  res.locals.portname=null;
  res.locals.ppsrc=null;
  res.locals.link=null;
  res.locals.storagetype=null;
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.user = req.user || null;
  next();
});

//using the routes file
app.use(router);

app.all(function(req, res, next) {
  // set default or minimum is 10 (as it was prior to v0.2.0)
  if (req.query.limit <= 10) req.query.limit = 10;
  next();
});

app.listen(8080,function(){
	console.log('The server is listening on port 8080.....');
});