var mongoose = require('mongoose');

var ItinerarySchema = new mongoose.Schema({
       title: {type: String},
       description: {type: String},
       speakerName: {type: String},
       speakerDetails: {type: String},
       date: {type: String},
       time: {type: String}
});

var Itinerary = mongoose.model('Itinerary', ItinerarySchema);



module.exports = Itinerary;
