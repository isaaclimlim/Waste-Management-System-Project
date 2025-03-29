const BulkWasteRequest = require('../models/BulkWasteRequest');
const mongoose = require('mongoose');
const csv = require('csv-writer').createObjectCsvWriter;
const Collector = require('../models/Collector');

// Get assigned requests for the collector
exports.getAssignedRequests = async (req, res) => {
  try {
    const collectorId = req.user._id;

    const requests = await BulkWasteRequest.find({
      collectorId,
      status: { $in: ['pending', 'in_progress'] }
    }).sort({ date: 1 });

    res.json({
      success: true,
      data: requests
    });
  } catch (error) {
    console.error('Error in getAssignedRequests:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Update request status
exports.updateRequestStatus = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status } = req.body;
    const collectorId = req.user._id;

    const request = await BulkWasteRequest.findOne({
      _id: requestId,
      collectorId
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    request.status = status;
    if (status === 'completed') {
      request.completedAt = new Date();
    }
    await request.save();

    // Emit socket event for real-time updates
    req.app.get('io').emit('request:updated', request);

    res.json({
      success: true,
      message: 'Request status updated successfully',
      data: request
    });
  } catch (error) {
    console.error('Error in updateRequestStatus:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Update collector's location
exports.updateLocation = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    const collectorId = req.user._id;

    // Update collector's location in the database
    await mongoose.model('User').findByIdAndUpdate(collectorId, {
      'location.coordinates': [longitude, latitude],
      'location.updatedAt': new Date()
    });

    // Emit socket event for real-time updates
    req.app.get('io').emit('collector:location', {
      collectorId,
      location: { latitude, longitude }
    });

    res.json({
      success: true,
      message: 'Location updated successfully'
    });
  } catch (error) {
    console.error('Error in updateLocation:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get collector analytics
exports.getAnalytics = async (req, res) => {
  try {
    const collectorId = req.user._id;
    const { timeFrame } = req.query;

    // Calculate date range based on timeFrame
    const endDate = new Date();
    const startDate = new Date();
    if (timeFrame === 'week') {
      startDate.setDate(endDate.getDate() - 7);
    } else {
      startDate.setMonth(endDate.getMonth() - 1);
    }

    // Fetch completed requests within date range
    const completedRequests = await BulkWasteRequest.find({
      collectorId,
      status: 'completed',
      completedAt: { $gte: startDate, $lte: endDate }
    }).sort({ completedAt: 1 });

    // Calculate basic metrics
    const totalPickups = completedRequests.length;
    const totalEarnings = completedRequests.reduce((sum, request) => sum + (request.earnings || 0), 0);
    const averageDailyPickups = totalPickups / (timeFrame === 'week' ? 7 : 30);

    // Calculate time-based metrics
    const pickupsOverTime = [];
    const earningsBreakdown = [
      { category: 'Regular Pickups', amount: 0 },
      { category: 'Bulk Pickups', amount: 0 },
      { category: 'Emergency Pickups', amount: 0 }
    ];

    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dayRequests = completedRequests.filter(
        request => request.completedAt.toDateString() === currentDate.toDateString()
      );

      pickupsOverTime.push({
        date: currentDate.toISOString().split('T')[0],
        pickups: dayRequests.length
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Calculate earnings breakdown
    completedRequests.forEach(request => {
      if (request.type === 'regular') {
        earningsBreakdown[0].amount += request.earnings || 0;
      } else if (request.type === 'bulk') {
        earningsBreakdown[1].amount += request.earnings || 0;
      } else if (request.type === 'emergency') {
        earningsBreakdown[2].amount += request.earnings || 0;
      }
    });

    res.json({
      success: true,
      data: {
        totalPickups,
        totalEarnings,
        averageDailyPickups,
        pickupsOverTime,
        earningsBreakdown
      }
    });
  } catch (error) {
    console.error('Error in getAnalytics:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Export analytics data
exports.exportAnalytics = async (req, res) => {
  try {
    const collectorId = req.user._id;
    const { timeFrame } = req.query;

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    if (timeFrame === 'week') {
      startDate.setDate(endDate.getDate() - 7);
    } else {
      startDate.setMonth(endDate.getMonth() - 1);
    }

    // Fetch completed requests
    const completedRequests = await BulkWasteRequest.find({
      collectorId,
      status: 'completed',
      completedAt: { $gte: startDate, $lte: endDate }
    }).sort({ completedAt: 1 });

    // Prepare CSV data
    const csvWriter = csv({
      path: 'analytics.csv',
      header: [
        { id: 'date', title: 'Date' },
        { id: 'pickups', title: 'Number of Pickups' },
        { id: 'distance', title: 'Distance (km)' },
        { id: 'earnings', title: 'Earnings ($)' },
        { id: 'type', title: 'Pickup Type' }
      ]
    });

    const records = completedRequests.map(request => ({
      date: request.completedAt.toISOString().split('T')[0],
      pickups: 1,
      distance: request.distance || 0,
      earnings: request.earnings || 0,
      type: request.type
    }));

    await csvWriter.writeRecords(records);

    // Send the CSV file
    res.download('analytics.csv', `collector-analytics-${timeFrame}-${new Date().toISOString().split('T')[0]}.csv`, (err) => {
      if (err) {
        console.error('Error sending file:', err);
      }
      // Clean up the file after sending
      require('fs').unlinkSync('analytics.csv');
    });
  } catch (error) {
    console.error('Error in exportAnalytics:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      vehicleType,
      vehicleNumber,
      notificationPreferences,
      workingHours
    } = req.body;

    // Validate required fields
    if (!name || !email || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and phone are required'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }

    // Check if email is already taken by another collector
    const existingCollector = await Collector.findOne({
      email,
      _id: { $ne: req.collector._id }
    });

    if (existingCollector) {
      return res.status(400).json({
        success: false,
        message: 'Email is already taken'
      });
    }

    // Update collector profile
    const updatedCollector = await Collector.findByIdAndUpdate(
      req.collector._id,
      {
        name,
        email,
        phone,
        vehicleType,
        vehicleNumber,
        notificationPreferences,
        workingHours
      },
      { new: true, runValidators: true }
    );

    // Remove sensitive information
    updatedCollector.password = undefined;

    res.status(200).json({
      success: true,
      data: updatedCollector,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Error updating collector profile:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile',
      error: error.message
    });
  }
};

// Get collector profile
exports.getProfile = async (req, res) => {
  try {
    const collector = await Collector.findOne({ userId: req.user._id })
      .select('-password');

    if (!collector) {
      return res.status(404).json({
        success: false,
        message: 'Collector profile not found'
      });
    }

    res.json({
      success: true,
      data: collector
    });
  } catch (error) {
    console.error('Error in getProfile:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get collector routes
exports.getRoutes = async (req, res) => {
  try {
    const collectorId = req.user._id;
    const requests = await BulkWasteRequest.find({
      collectorId,
      status: { $in: ['pending', 'in_progress'] }
    }).sort({ date: 1 });

    res.json({
      success: true,
      data: requests
    });
  } catch (error) {
    console.error('Error in getRoutes:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get collector history
exports.getHistory = async (req, res) => {
  try {
    const collectorId = req.user._id;
    const { page = 1, limit = 10 } = req.query;

    const requests = await BulkWasteRequest.find({
      collectorId,
      status: 'completed'
    })
    .sort({ completedAt: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

    const total = await BulkWasteRequest.countDocuments({
      collectorId,
      status: 'completed'
    });

    res.json({
      success: true,
      data: {
        requests,
        total,
        pages: Math.ceil(total / limit),
        currentPage: parseInt(page)
      }
    });
  } catch (error) {
    console.error('Error in getHistory:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}; 