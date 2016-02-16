var mongoose = require('mongoose');

var PlanSchema = new mongoose.Schema({
       title: {type: String},
       description: {type: String},
       spots:[{id:{type: String}}]
});

var Plan = mongoose.model('Plan', PlanSchema);

module.exports = Plan;
