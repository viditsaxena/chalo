var             express  = require('express'),
                mongoose = require('mongoose'),
              bodyParser = require('body-parser'),
              morgan     = require('morgan');


var PlansController = express.Router();
var Plan = require('../models/plan');

var jwt    = require('jsonwebtoken'); // used to create, sign, and verify tokens
var config = require('./config'); // get our config file

var secret = {superSecret: config.secret}; // secret variable

// route middleware to verify a token. This code will be put in routes before the route code is executed.
PlansController.use(function(req, res, next) {

  // check header or url parameters or post parameters for token
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

// Routes
PlansController.get('/', function(req, res){
  Plan.find({}, function(err, plans){
  res.json(plans);
  });
});

PlansController.get('/search', function(req, res){
  console.log(req.query.userId);
  Plan.find({ userId: req.query.userId }, function (err, plans){
    console.log(plans);

    res.json(plans);
  });
});

PlansController.get('/:id', function(req, res){
  Plan.findOne({_id: req.params.id}, function(err, plan){
    res.json(plan);
  });
});





PlansController.delete('/:id', function(req, res){
  var id = req.params.id;
  Plan.findByIdAndRemove(id, function(){
    res.json({status: 202, message: 'Success'});
  });
});

PlansController.post('/', function(req, res){
  var plan = new Plan(req.body);
  plan.save(function(){
    res.json(plan);
  });
});

PlansController.patch('/:id', function(req, res){
  Plan.findByIdAndUpdate(req.params.id, req.body, {new: true}, function(err, updatedPlan){
    res.json(updatedPlan);
  });
});



module.exports = PlansController;
