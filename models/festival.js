const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
const Schema = mongoose.Schema;

var schema = new Schema({
  author: { type: Schema.Types.ObjectId, ref: 'User' },
  title: {type: String, trim: true, required: true},
  location: {type: String, trim: true},
  starts: {type: String, trim: true, format: 'MM/DD/YYYY'},
  startTime: {type: String, trim: true},
  ends: {type: String, trim: true, format: 'MM/DD/YYYY'},
  endTime: {type: String, trim: true},
  desc: {type: String, trim: true},
  festType: {type: String, trim: true},
  festTopic: {type: String, trim: true},
  orgname: {type: String, trim: true},
  orgdesc: {type: String, trim: true},
  price: {type: Number, trim: true, default: 0},
  numLikes: {type: Number, default: 0},
  numAttends: {type: Number, default: 0},
  numReads: {type: Number, default: 0},
  createdAt: {type: Date, default: Date.now}
}, {
  toJSON: { virtuals: true},
  toObject: {virtuals: true}
});
schema.plugin(mongoosePaginate);
var Festival = mongoose.model('Festival', schema);

module.exports = Festival;
