// Require what will be needed for the controller
var express  =  require('express'),
    User     =  require('../models/user'),
    usersRouter   =  express.Router();

    var jwt    = require('jsonwebtoken'); // used to create, sign, and verify tokens
    var config = require('./config'); // get our config file

    var secret = {superSecret: config.secret}; // secret variable to sign json web tokens we create and verify.

    // Create a new user and return as json for POST to '/api/users'. This is for User Sign Up.
    usersRouter.post('/', function (req, res) {
      User.findOne({
        email: req.body.email
      }, function(err, user) {

        //if the user is found
        if (user) {
          res.json({ success: false, message: 'User already exists. Please log in.' });
        //if the user is not found. Create the user and then return it.
        } else if (!user) {
          var newUser = new User(req.body);
          newUser.save(function(){ //pre-save hook will be run before user gets saved. See user model.
          res.json({success: true, user : newUser, message: "Thank You for Signing Up"});
          });
        }
      });
    });

    //LOGIN ROUTE. This is where the token is created with every successful login and added to user profile.
    usersRouter.post('/authentication_token', function(req, res){
      var password = req.body.password;
      // find the user
        User.findOne({
          email: req.body.email
        }, function(err, user) {
          //If error in finding the user throw the error
          if (err) throw err;
          //If there is no error and the user is not found.
          if (!user) {
            res.json({ success: false, message: 'Authentication failed. User not found.' });
            //if the user is found
          } else if (user) {
            // check if password matches
            user.authenticate(password, function(isMatch){
              if(isMatch){
                // if user is found and password is right
                // create a token with users email. This is fine because password is hashed. JWT are not encrypted only encoded. So if
                // the password is included in the jwt it could decoded easily.
                var token = jwt.sign({email: user.email}, secret.superSecret, {
                  expiresIn: 144000 // expires in 24 hours
                });
                // set the user token in the database
                user.token = token;
                user.save(function(){
                  // return the information including token as JSON
                  res.json({
                    success: true,
                    id: user._id,
                    message: 'Enjoy your token!',
                    token: token
                  });
                });
              } else {
                res.json({ success: false, message: 'Authentication failed. Wrong password.' });
              }
            });
          }
        });
      });

      // route middleware to verify a token in incoming requests.
      //This code will be put in routes before the route code is executed.
      usersRouter.use(function(req, res, next) {

        // check header or url parameters or post parameters for token in the requests.
        var token = req.body.token || req.query.token || req.headers['x-access-token'];

        // If token is there, then decode token
        if (token) {

          // verifies secret and checks exp
          jwt.verify(token, secret.superSecret, function(err, decoded) {
            if (err) {
              return res.json({ success: false, message: 'Failed to authenticate token.' });
            } else {
              // if everything is good, save to incoming request for use in other routes
              req.decoded = decoded;
              next();
            }
          });

        } else {

          // if there is no token
          // return an error
          return res.status(403).send({
              success: false,
              message: 'No token provided.'
          });

        }
      });


//***********************AUTHENTICATED ROUTES******************************

      // Return ALL the users as json to GET to '/api/users'
    usersRouter.get('/', function (req, res) {
      User.find({}, function (err, users) {
        res.json(users);
      });
    });



    // Export the controller
    module.exports = usersRouter;
