var             express  = require('express'),
                mongoose = require('mongoose'),
              bodyParser = require('body-parser'),
              morgan     = require('morgan');


var PlansController = express.Router();
var Plan = require('../models/plan');
// var User = require('../models/user');
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
