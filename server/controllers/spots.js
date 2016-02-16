var             express  = require('express'),
                mongoose = require('mongoose'),
              bodyParser = require('body-parser'),
              morgan     = require('morgan');


var SpotsController = express.Router();
var Spot = require('../models/spot');

// Routes
SpotsController.get('/', function(req, res){
  Spot.find({}, function(err, spots){
  res.json(spots);
  });
});

SpotsController.get('/:id', function(req, res){
  Spot.findOne({_id: req.params.id}, function(err, spot){
    res.json(spot);
  });
});


SpotsController.delete('/:id', function(req, res){
  var id = req.params.id;
  Spot.findByIdAndRemove(id, function(){
    res.json({status: 202, message: 'Success'});
  });
});

SpotsController.post('/', function(req, res){
  var spot = new Spot(req.body);
  spot.save(function(){
    res.json(spot);
  });
});

SpotsController.patch('/:id', function(req, res){
  Spot.findByIdAndUpdate(req.params.id, req.body, {new: true}, function(err, updatedSpot){
    res.json(updatedSpot);
  });
});



module.exports = SpotsController;
