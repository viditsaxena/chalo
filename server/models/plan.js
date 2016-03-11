var mongoose = require('mongoose');

var PlanSchema = new mongoose.Schema({
       title: {type: String},
       userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
       spots:[{}]
});

var Plan = mongoose.model('Plan', PlanSchema);

module.exports = Plan;
