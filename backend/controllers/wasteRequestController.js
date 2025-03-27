const WasteRequest = require('../models/WasteRequest');
const { getIO } = require('../config/socket');
const mongoose = require('mongoose');

// Create a new waste collection request
exports.createRequest = async (req, res) => {
  try {
    const { date, time, wasteType, address } = req.body;
    const residentId = req.user.id;

    const requestData = {
      residentId: mongoose.Types.ObjectId(residentId),
      date,
      time,
      wasteType,
      address
    };

    const result = await WasteRequest.createRequest(requestData);

    if (result.success) {
      // Emit socket event for new request
      const io = getIO();
      io.to(residentId.toString()).emit('newRequest', result.data);

      res.status(201).json({
        success: true,
        message: 'Waste collection request created successfully',
        data: result.data
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Failed to create waste collection request',
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error in createRequest:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get all requests for a resident
exports.getResidentRequests = async (req, res) => {
  try {
    console.log('User from request:', req.user);
    if (!req.user || !req.user.id) {
      console.error('No user ID found in request');
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    const residentId = req.user.id;
    console.log('Fetching requests for residentId:', residentId);
    console.log('ResidentId type:', typeof residentId);
    
    try {
      // Convert string ID to ObjectId using the correct syntax
      const objectId = new mongoose.Types.ObjectId(residentId);
      console.log('Converted to ObjectId:', objectId);
      console.log('ObjectId type:', typeof objectId);
      
      const result = await WasteRequest.getRequestsByResident(objectId);
      console.log('Query result:', result);

      if (result.success) {
        res.status(200).json({
          success: true,
          data: result.data
        });
      } else {
        console.error('Failed to fetch requests:', result);
        res.status(400).json({
          success: false,
          message: 'Failed to fetch waste collection requests',
          error: result.error
        });
      }
    } catch (idError) {
      console.error('Error converting ID:', idError);
      console.error('ID conversion error details:', {
        residentId,
        residentIdType: typeof residentId,
        errorMessage: idError.message
      });
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format',
        error: idError.message,
        details: {
          providedId: residentId,
          idType: typeof residentId
        }
      });
    }
  } catch (error) {
    console.error('Error in getResidentRequests:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Update request status (for collectors/admins)
exports.updateRequestStatus = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status } = req.body;

    const request = await WasteRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Waste collection request not found'
      });
    }

    const result = await request.updateStatus(status);

    if (result.success) {
      // Emit socket event for status update
      const io = getIO();
      io.to(request.residentId.toString()).emit('requestStatusUpdate', {
        requestId,
        status,
        updatedAt: result.data.updatedAt
      });

      res.status(200).json({
        success: true,
        message: 'Request status updated successfully',
        data: result.data
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Failed to update request status',
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error in updateRequestStatus:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get status counts for the logged-in resident
exports.getStatusCounts = async (req, res) => {
  try {
    console.log('User from request:', req.user);
    if (!req.user || !req.user.id) {
      console.error('No user ID found in request');
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    const residentId = req.user.id;
    console.log('Fetching status counts for residentId:', residentId);
    console.log('ResidentId type:', typeof residentId);

    try {
      // Convert string ID to ObjectId using the correct syntax
      const objectId = new mongoose.Types.ObjectId(residentId);
      console.log('Converted to ObjectId:', objectId);
      console.log('ObjectId type:', typeof objectId);

      const counts = await WasteRequest.aggregate([
        {
          $match: { residentId: objectId }
        },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]);
      console.log('Aggregation result:', counts);

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
    } catch (idError) {
      console.error('Error converting ID:', idError);
      console.error('ID conversion error details:', {
        residentId,
        residentIdType: typeof residentId,
        errorMessage: idError.message
      });
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format',
        error: idError.message,
        details: {
          providedId: residentId,
          idType: typeof residentId
        }
      });
    }
  } catch (error) {
    console.error('Error in getStatusCounts:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching status counts',
      error: error.message
    });
  }
}; 