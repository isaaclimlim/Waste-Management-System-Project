const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const residentController = require('../controllers/residentController');

// Protect all routes
router.use(verifyToken);

// Profile routes
router.get('/profile', residentController.getProfile);
router.put('/profile', residentController.updateProfile);

// Waste request routes
router.post('/requests', residentController.createRequest);
router.get('/requests', residentController.getRequests);
router.get('/requests/status-counts', residentController.getStatusCounts);
router.get('/requests/:id', residentController.getRequestById);
router.put('/requests/:id/cancel', residentController.cancelRequest);

module.exports = router; 