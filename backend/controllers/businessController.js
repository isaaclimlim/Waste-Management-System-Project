const User = require('../models/User');
const BulkWasteRequest = require('../models/BulkWasteRequest');
const ScheduledPickup = require('../models/ScheduledPickup');
const WasteRequest = require('../models/WasteRequest');
const mongoose = require('mongoose');

// Get business profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profile' });
  }
};

// Update business profile
const updateProfile = async (req, res) => {
  try {
    const { name, email, phone, address } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, email, phone, address },
      { new: true }
    ).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile' });
  }
};

// Get business analytics
const getAnalytics = async (req, res) => {
  try {
    const requests = await WasteRequest.find({ businessId: req.user._id });
    const bulkRequests = await BulkWasteRequest.find({ businessId: req.user._id });
    
    const analytics = {
      totalRequests: requests.length,
      totalBulkRequests: bulkRequests.length,
      // Add more analytics as needed
    };
    
    res.json(analytics);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching analytics' });
  }
};

// Get business recommendations
const getRecommendations = async (req, res) => {
  try {
    // Implement recommendation logic
    const recommendations = [];
    res.json(recommendations);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching recommendations' });
  }
};

// Get bulk requests
const getBulkRequests = async (req, res) => {
  try {
    const bulkRequests = await BulkWasteRequest.find({ businessId: req.user._id });
    res.json(bulkRequests);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching bulk requests' });
  }
};

// Create bulk request
const createBulkRequest = async (req, res) => {
  try {
    const { date, time, wasteType, quantity, address } = req.body;
    const bulkRequest = new BulkWasteRequest({
      businessId: req.user._id,
      date,
      time,
      wasteType,
      quantity,
      address
    });
    await bulkRequest.save();
    res.status(201).json(bulkRequest);
  } catch (error) {
    res.status(500).json({ message: 'Error creating bulk request' });
  }
};

// Get scheduled pickups
const getScheduledPickups = async (req, res) => {
  try {
    const pickups = await ScheduledPickup.find({ businessId: req.user._id });
    res.json(pickups);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching scheduled pickups' });
  }
};

// Create scheduled pickup
const createScheduledPickup = async (req, res) => {
  try {
    const { date, time, frequency, address } = req.body;
    const pickup = new ScheduledPickup({
      businessId: req.user._id,
      date,
      time,
      frequency,
      address
    });
    await pickup.save();
    res.status(201).json(pickup);
  } catch (error) {
    res.status(500).json({ message: 'Error creating scheduled pickup' });
  }
};

// Get status counts for a business
const getStatusCounts = async (req, res) => {
  try {
    const businessId = req.user._id;
    const counts = await BulkWasteRequest.aggregate([
      {
        $match: { businessId: new mongoose.Types.ObjectId(businessId) }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Convert array of objects to object with status as keys
    const statusCounts = counts.reduce((acc, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {
      pending: 0,
      accepted: 0,
      rejected: 0,
      completed: 0,
      cancelled: 0
    });

    res.json({
      success: true,
      data: statusCounts
    });
  } catch (error) {
    console.error('Error in getStatusCounts:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get all requests for a business
const getRequests = async (req, res) => {
  try {
    const businessId = req.user._id;
    const requests = await BulkWasteRequest.find({ businessId })
      .sort({ date: -1 })
      .lean();

    res.json({
      success: true,
      data: requests
    });
  } catch (error) {
    console.error('Error in getRequests:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  getAnalytics,
  getRecommendations,
  getBulkRequests,
  createBulkRequest,
  getScheduledPickups,
  createScheduledPickup,
  getRequests,
  getStatusCounts
}; 