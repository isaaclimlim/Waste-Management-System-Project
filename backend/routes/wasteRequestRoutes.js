const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { 
  createRequest, 
  getResidentRequests, 
  updateRequestStatus, 
  getStatusCounts 
} = require('../controllers/wasteRequestController');

// Create a new waste collection request (resident only)
router.post('/', auth, createRequest);

// Get all requests for the logged-in resident
router.get('/resident', auth, getResidentRequests);

// Update request status (collector/admin only)
router.patch('/:requestId/status', auth, updateRequestStatus);

// Get status counts for the logged-in resident
router.get('/status-counts', auth, getStatusCounts);

module.exports = router; 