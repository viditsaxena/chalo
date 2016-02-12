var             express  = require('express'),
                mongoose = require('mongoose'),
              bodyParser = require('body-parser'),
              morgan     = require('morgan');


var ItinerariesController = express.Router();
var Itinerary = require('../models/itinerary');

// Routes
ItinerariesController.get('/', function(req, res){
  Itinerary.find({}, function(err, itineraries){
  res.json(itineraries);
  });
});

ItinerariesController.get('/:id', function(req, res){
  Itinerary.findOne({_id: req.params.id}, function(err, itinerary){
    res.json(itinerary);
  });
});



ItinerariesController.delete('/:id', function(req, res){
  var id = req.params.id;
  Itinerary.findByIdAndRemove(id, function(){
    res.json({status: 202, message: 'Success'});
  });
});

ItinerariesController.post('/', function(req, res){
  var itinerary = new Itinerary(req.body);
  itinerary.save(function(){
    res.json(itinerary);
  });
});

ItinerariesController.patch('/:id', function(req, res){
  Itinerary.findByIdAndUpdate(req.params.id, req.body, {new: true}, function(err, updatedItinerary){
    res.json(updatedItinerary);
  });
});



module.exports = ItinerariesController;
