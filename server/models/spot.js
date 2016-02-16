var mongoose = require('mongoose');

var SpotSchema = new mongoose.Schema({
          name: {type: String},
          category: {type: String},
          address: {type: String},
          hours: {type: String},
          phone: {type: String},
          website: {type: String},
          notes: {type: String},
          imageUrl: {type: String},
          dayNumber: {type: Number}
});

var Spot = mongoose.model('Spot', SpotSchema);

module.exports = Spot;
