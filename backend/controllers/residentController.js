const User = require('../models/User');
const WasteRequest = require('../models/WasteRequest');
const mongoose = require('mongoose');

// Get resident profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Resident profile not found'
      });
    }

    res.json({
      success: true,
      data: user
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

// Update resident profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, email, phone, address } = req.body;

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

    // Check if email is already taken by another user
    const existingUser = await User.findOne({
      email,
      _id: { $ne: req.user._id }
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email is already taken'
      });
    }

    // Update user profile
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { name, email, phone, address },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      data: updatedUser,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Error in updateProfile:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Create a new waste request
exports.createRequest = async (req, res) => {
  try {
    const { date, time, wasteType, address } = req.body;

    // Validate required fields
    if (!date || !time || !wasteType || !address) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required',
        required: ['date', 'time', 'wasteType', 'address']
      });
    }

    const request = new WasteRequest({
      residentId: req.user._id,
      date,
      time,
      wasteType,
      address,
      status: 'pending'
    });

    await request.save();

    // Emit socket event for real-time updates
    req.app.get('io').emit('request:created', request);

    res.status(201).json({
      success: true,
      data: request
    });
  } catch (error) {
    console.error('Error in createRequest:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get all requests for the resident
exports.getRequests = async (req, res) => {
  try {
    const requests = await WasteRequest.find({ residentId: req.user._id })
      .sort({ createdAt: -1 })
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

// Get request status counts
exports.getStatusCounts = async (req, res) => {
  try {
    const counts = await WasteRequest.aggregate([
      {
        $match: { residentId: new mongoose.Types.ObjectId(req.user._id) }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const statusCounts = counts.reduce((acc, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {
      pending: 0,
      in_progress: 0,
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

// Get a specific request by ID
exports.getRequestById = async (req, res) => {
  try {
    const request = await WasteRequest.findOne({
      _id: req.params.id,
      residentId: req.user._id
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    res.json({
      success: true,
      data: request
    });
  } catch (error) {
    console.error('Error in getRequestById:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Cancel a request
exports.cancelRequest = async (req, res) => {
  try {
    const request = await WasteRequest.findOne({
      _id: req.params.id,
      residentId: req.user._id,
      status: 'pending'
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found or cannot be cancelled'
      });
    }

    request.status = 'cancelled';
    await request.save();

    // Emit socket event for real-time updates
    req.app.get('io').emit('request:cancelled', request);

    res.json({
      success: true,
      data: request,
      message: 'Request cancelled successfully'
    });
  } catch (error) {
    console.error('Error in cancelRequest:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}; 