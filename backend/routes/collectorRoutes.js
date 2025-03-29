const express = require('express');
const router = express.Router();
const collectorController = require('../controllers/collectorController');
const { verifyToken, authenticateCollector } = require('../middleware/auth');

// Apply authentication middleware to all routes
router.use(verifyToken);
router.use(authenticateCollector);

// Profile routes
router.get('/profile', collectorController.getProfile);
router.put('/profile', collectorController.updateProfile);

// Location routes
router.put('/location', collectorController.updateLocation);

// Analytics routes
router.get('/analytics', collectorController.getAnalytics);

// Routes management
router.get('/routes', collectorController.getRoutes);

// History routes
router.get('/history', collectorController.getHistory);

// Request management
router.put('/requests/:requestId/status', collectorController.updateRequestStatus);

module.exports = router; 