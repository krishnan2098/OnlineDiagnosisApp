var express = require('express');
var router = express.Router();
var bcrypt = require('bcryptjs');
var passport = require('passport');

//Bring in User models
let User = require('../models/user');

//Show signup form
router.get('/register', function(req, res){
    res.render("register");
    console.log("Going to Register route!");
});

//Handles Signup logic
router.post('/register', function(req, res){

  //Credentials required for Signup
  const name = req.body.name;
  const email = req.body.email;
  const username = req.body.username;
  const password = req.body.password;
  const password2 = req.body.password2;

  //Properties of Signup credentials
  req.checkBody('name','Name is Required').notEmpty();
  req.checkBody('email','Email is Required').notEmpty();
  req.checkBody('email','Email is not valid').isEmail();
  req.checkBody('username','Username is Required').notEmpty();
  req.checkBody('password','Password is Required').notEmpty();
  req.checkBody('password2','Passwords do not match').equals(req.body.password);

  let errors = req.validationErrors();

  if(errors){
    res.render('register',{
      errors:errors
    });
  }else{
    let newUser = new User({
      name:name,
      email:email,
      username:username,
      password:password
    });
      bcrypt.genSalt(10, function(err,salt){
        bcrypt.hash(newUser.password, salt, function(err,hash){
          if(err){
            console.log(err);
          }
          newUser.password = hash;
          newUser.save(function(err){
            if(err){
              console.log(err);
              return;
            }else{
              req.flash('Success', 'You are now registered and can login');
              res.redirect('/users/login');
            }
          });
        });
      });
    }
});




//login form
router.get("/login", function(req, res){
    res.render("login");
    console.log("Login route!");
});

//login authenticate logic
router.post("/login", function(req, res, next){
  passport.authenticate("local",{
    successRedirect: '/dashboard',
    failureRedirect: '/users/login',
    failureFlash: true
})(req, res,next);
});

//Logout route
router.get("/logout", function(req, res){
   req.logout();
   req.flash('success', 'You are logged out');
   res.redirect("/");
});

module.exports = router;
