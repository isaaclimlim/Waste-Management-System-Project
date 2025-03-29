const mongoose = require('mongoose');

const collectorSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  vehicleType: {
    type: String,
    enum: ['truck', 'van', 'bike', 'cycle'],
    required: true
  },
  vehicleNumber: {
    type: String,
    required: true
  },
  workingHours: {
    start: {
      type: String,
      required: true
    },
    end: {
      type: String,
      required: true
    }
  },
  serviceArea: {
    radius: {
      type: Number,
      default: 10,
      min: 1,
      max: 50
    },
    preferredZones: [{
      type: String
    }]
  },
  notificationPreferences: {
    newRequests: {
      type: Boolean,
      default: true
    },
    routeUpdates: {
      type: Boolean,
      default: true
    },
    earningsUpdates: {
      type: Boolean,
      default: true
    },
    maintenanceReminders: {
      type: Boolean,
      default: true
    }
  },
  performanceMetrics: {
    totalCollections: {
      type: Number,
      default: 0
    },
    totalEarnings: {
      type: Number,
      default: 0
    },
    averageTimePerPickup: {
      type: Number,
      default: 0
    },
    onTimeCollections: {
      type: Number,
      default: 0
    },
    customerSatisfaction: {
      type: Number,
      default: 0
    },
    efficiencyScore: {
      type: Number,
      default: 0
    },
    routeOptimization: {
      type: Number,
      default: 0
    }
  },
  currentLocation: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      default: [0, 0]
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
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
collectorSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Static method to create a new collector
collectorSchema.statics.createCollector = async function(collectorData) {
  try {
    const collector = new this(collectorData);
    await collector.save();
    return {
      success: true,
      data: collector
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

// Static method to get collector by user ID
collectorSchema.statics.getCollectorByUserId = async function(userId) {
  try {
    const collector = await this.findOne({ userId })
      .populate('userId', 'name email phone')
      .lean();
    
    return {
      success: true,
      data: collector
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

// Static method to update collector profile
collectorSchema.statics.updateProfile = async function(collectorId, updateData) {
  try {
    const collector = await this.findByIdAndUpdate(
      collectorId,
      { $set: updateData },
      { new: true, runValidators: true }
    );
    
    return {
      success: true,
      data: collector
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

// Static method to update collector location
collectorSchema.statics.updateLocation = async function(collectorId, location) {
  try {
    const collector = await this.findByIdAndUpdate(
      collectorId,
      {
        $set: {
          currentLocation: {
            type: 'Point',
            coordinates: [location.lng, location.lat],
            updatedAt: new Date()
          }
        }
      },
      { new: true }
    );
    
    return {
      success: true,
      data: collector
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

// Static method to update performance metrics
collectorSchema.statics.updatePerformanceMetrics = async function(collectorId, metrics) {
  try {
    const collector = await this.findByIdAndUpdate(
      collectorId,
      { $set: { performanceMetrics: metrics } },
      { new: true }
    );
    
    return {
      success: true,
      data: collector
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

const Collector = mongoose.model('Collector', collectorSchema);

module.exports = Collector; 