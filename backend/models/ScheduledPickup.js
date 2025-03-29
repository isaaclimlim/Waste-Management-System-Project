const mongoose = require('mongoose');

const scheduledPickupSchema = new mongoose.Schema({
  businessId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  frequency: {
    type: String,
    enum: ['weekly', 'monthly'],
    required: true
  },
  dayOfWeek: {
    type: String,
    enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
    required: function() {
      return this.frequency === 'weekly';
    }
  },
  dayOfMonth: {
    type: Number,
    min: 1,
    max: 31,
    required: function() {
      return this.frequency === 'monthly';
    }
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
  startDate: {
    type: Date,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
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
scheduledPickupSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Static method to create a new scheduled pickup
scheduledPickupSchema.statics.createSchedule = async function(scheduleData) {
  try {
    const schedule = new this(scheduleData);
    await schedule.save();
    return {
      success: true,
      data: schedule
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

// Static method to get schedules by business ID
scheduledPickupSchema.statics.getSchedulesByBusiness = async function(businessId) {
  try {
    const schedules = await this.find({ businessId })
      .sort({ createdAt: -1 })
      .lean();
    
    return {
      success: true,
      data: schedules
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

// Static method to update schedule status
scheduledPickupSchema.statics.updateStatus = async function(scheduleId, isActive) {
  try {
    const schedule = await this.findByIdAndUpdate(
      scheduleId,
      { isActive },
      { new: true }
    );
    return {
      success: true,
      data: schedule
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

const ScheduledPickup = mongoose.model('ScheduledPickup', scheduledPickupSchema);

module.exports = ScheduledPickup; 