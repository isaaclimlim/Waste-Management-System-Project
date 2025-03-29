const express = require('express');
const router = express.Router();
const { authenticateBusiness } = require('../middleware/auth');
const {
  createRequest,
  getRequests,
  getRequestById,
  updateRequestStatus,
  getStatusCounts
} = require('../controllers/wasteRequestController');

// Apply authentication middleware to all routes
router.use(authenticateBusiness);

// Create a new waste collection request
router.post('/', createRequest);

// Get all requests for the business
router.get('/', getRequests);

// Get status counts for the business
router.get('/status-counts', getStatusCounts);

// Get a specific request by ID
router.get('/:id', getRequestById);

// Update request status
router.patch('/:id/status', updateRequestStatus);

module.exports = router; 