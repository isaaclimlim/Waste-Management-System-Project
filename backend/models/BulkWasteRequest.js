const mongoose = require('mongoose');

const bulkWasteRequestSchema = new mongoose.Schema({
  businessId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  wasteType: {
    type: String,
    enum: ['biodegradable', 'non-biodegradable', 'recyclable'],
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  address: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'completed', 'cancelled'],
    default: 'pending'
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
bulkWasteRequestSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Static method to create a new bulk waste request
bulkWasteRequestSchema.statics.createRequest = async function(requestData) {
  try {
    const request = new this(requestData);
    await request.save();
    return {
      success: true,
      data: request
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

// Static method to get requests by business ID
bulkWasteRequestSchema.statics.getRequestsByBusiness = async function(businessId) {
  try {
    const requests = await this.find({ businessId })
      .sort({ createdAt: -1 })
      .lean();
    
    return {
      success: true,
      data: requests
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

const BulkWasteRequest = mongoose.model('BulkWasteRequest', bulkWasteRequestSchema);

module.exports = BulkWasteRequest; 