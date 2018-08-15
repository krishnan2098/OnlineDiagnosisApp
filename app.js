var express = require("express");
var path = require('path');
var flash = require('connect-flash');
var bodyParser = require('body-parser');
var mongoose = require("mongoose");
var config = require('./config/database')
var passport = require("passport");
var session = require('express-session');
var expressValidator = require('express-validator');
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);

//Connect to DB
mongoose.connect(config.database);
let db = mongoose.connection;

//check DB connection
db.once('open', function(){
  console.log('Connected to MongoDB');
});
//Check for DB errors
db.on('error', function(err){
  console.log(err);
});

//Init app
var app = express();


//Parse Application middleware
app.use(bodyParser.urlencoded({extended: true}));
//Parse application/json
//app.use(bodyParser.json);


//setting static files
app.use(express.static(path.join(__dirname + '/public')));

//Load View engines
app.set('views', path.join(__dirname, '/views'));
app.set('view engine', 'ejs');

//Seed data must be called here

//Express-session middleware
app.use(require("express-session")({
    secret: "This is the secret key!",
    resave: true,
    saveUninitialized: true
}));

//Express Messages middleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});


//Express validator
app.use(expressValidator({
  errorFormatter: function(param, msg, value){
    var namespace = param.split('.'),
    root = namespace.shift('.');
    formParam= root;

    while(namespace.length){
      formParam += '[' + namespace.length + ']';
      }
      return{
        param: formParam,
        msg: msg,
        value: value
      };
  }
}));

//Passport Config
require('./config/passport')(passport);
//Passport Middleware
app.use(passport.initialize());
app.use(passport.session());


//pass user data to all routes
app.get('*', function(req, res, next){
    res.locals.currentUser = req.user || null;
    next();
});

//Landing page
app.get('/', function(req, res){
    res.render('landing');
    console.log("Home route!");
});

//================
//Dashboard route
//================
app.get('/dashboard', function(req, res){
    res.render('dashboard');
    console.log("Authentication success, reached dashboard route!");
});


/*
//================
//Discussion forums route
//================
app.get("/discussions-forum", isLoggedIn, function(req, res){
    res.render("forums");
    console.log("Forums route!");
});


//middleware checking if user is still logged in
function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}

*/


//Route files
let users = require('./routes/users');
app.use('/users', users);



//let profiles = require('./routes/profile');
//app.use('/profile', profiles);

app.listen(5000, function(){
   console.log("Server has started at PORT:5000. Enter http://127.0.0.1:5000 or http://localhost:5000 to view")
});

server.listen(5000);
