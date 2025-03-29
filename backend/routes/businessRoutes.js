const express = require('express');
const router = express.Router();
const { verifyToken, authenticateBusiness } = require('../middleware/auth');
const {
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
} = require('../controllers/businessController');

// Apply authentication middleware to all routes
router.use(verifyToken);
router.use(authenticateBusiness);

// Profile routes
router.get('/profile', getProfile);
router.put('/profile', updateProfile);

// Analytics routes
router.get('/analytics', getAnalytics);
router.get('/recommendations', getRecommendations);

// Bulk request routes
router.get('/bulk-requests', getBulkRequests);
router.post('/bulk-requests', createBulkRequest);

// Scheduled pickup routes
router.get('/scheduled-pickups', getScheduledPickups);
router.post('/scheduled-pickups', createScheduledPickup);

// Request routes
router.get('/requests', getRequests);
router.get('/requests/status-counts', getStatusCounts);

module.exports = router; 