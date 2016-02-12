var mongoose = require('mongoose');

var PlanSchema = new mongoose.Schema({
       title: {type: String},
       description: {type: String},
       spots: [ {
          name: {type: String},
          category: {type: String},
          address: {type: String},
          hours: {type: String},
          phone: {type: String},
          website: {type: String},
          notes: {type: String},
          dayNumber: {type: Integer}
        }],
       userId: {type: String}
});

var Plan = mongoose.model('Plan', PlanSchema);

module.exports = Plan;
