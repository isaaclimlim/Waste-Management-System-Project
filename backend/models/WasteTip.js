const mongoose = require('mongoose');

const wasteTipSchema = new mongoose.Schema({
  category: {
    type: String,
    enum: ['biodegradable', 'non-biodegradable', 'recyclable'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
wasteTipSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const WasteTip = mongoose.model('WasteTip', wasteTipSchema);

module.exports = WasteTip; 