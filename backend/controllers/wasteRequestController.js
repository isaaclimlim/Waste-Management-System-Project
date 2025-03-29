const WasteRequest = require('../models/WasteRequest');
const { getIO } = require('../socket');
const mongoose = require('mongoose');

// Create a new waste collection request
exports.createRequest = async (req, res) => {
  try {
    const { date, time, wasteType, address } = req.body;
    const businessId = req.business._id;

    const request = new WasteRequest({
      businessId,
      date,
      time,
      wasteType,
      address,
      status: 'pending'
    });

    await request.save();

    res.status(201).json({
      success: true,
      data: request
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Get all requests for the business
exports.getRequests = async (req, res) => {
  try {
    const requests = await WasteRequest.find({ businessId: req.business._id })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: requests
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get a specific request by ID
exports.getRequestById = async (req, res) => {
  try {
    const request = await WasteRequest.findOne({
      _id: req.params.id,
      businessId: req.business._id
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
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update request status
exports.updateRequestStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const request = await WasteRequest.findOne({
      _id: req.params.id,
      businessId: req.business._id
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

    res.json({
      success: true,
      data: request
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Get status counts for the business
exports.getStatusCounts = async (req, res) => {
  try {
    const counts = await WasteRequest.aggregate([
      {
        $match: { businessId: req.business._id }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const statusCounts = {
      pending: 0,
      in_progress: 0,
      completed: 0,
      cancelled: 0
    };

    counts.forEach(({ _id, count }) => {
      statusCounts[_id] = count;
    });

    res.json({
      success: true,
      data: statusCounts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}; 