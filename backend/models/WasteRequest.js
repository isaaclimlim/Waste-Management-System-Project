const mongoose = require('mongoose');

const wasteRequestSchema = new mongoose.Schema({
  residentId: {
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
  address: {
    type: String,
    required: true
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
wasteRequestSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Static method to create a new waste request
wasteRequestSchema.statics.createRequest = async function(requestData) {
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

// Instance method to update request status
wasteRequestSchema.methods.updateStatus = async function(newStatus) {
  try {
    this.status = newStatus;
    await this.save();
    return {
      success: true,
      data: this
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

// Static method to get requests by resident ID
wasteRequestSchema.statics.getRequestsByResident = async function(residentId) {
  try {
    console.log('Searching for requests with residentId:', residentId);
    const requests = await this.find({ residentId })
      .sort({ createdAt: -1 })
      .lean();
    console.log('Found requests:', requests);
    
    return {
      success: true,
      data: requests
    };
  } catch (error) {
    console.error('Error in getRequestsByResident:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

const WasteRequest = mongoose.model('WasteRequest', wasteRequestSchema);

module.exports = WasteRequest; 