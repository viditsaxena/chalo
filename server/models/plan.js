var mongoose = require('mongoose');

var PlanSchema = new mongoose.Schema({
       title: {type: String},
       userId: {type: String},
       spots:[{
         name: {type: String},
         category: {type: String},
         address: {type: String},
         hours: {type: String},
         phone: {type: String},
         website: {type: String},
         notes: {type: String},
         imageUrl: {type: String},
         dayNumber: {type: Number}
       }]
});

var Plan = mongoose.model('Plan', PlanSchema);

module.exports = Plan;
