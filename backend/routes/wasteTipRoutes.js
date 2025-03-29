const express = require('express');
const router = express.Router();
const { authenticateBusiness } = require('../middleware/auth');
const {
  getWasteTips,
  createWasteTip
} = require('../controllers/wasteTipController');

// Get all waste tips (public route)
router.get('/', getWasteTips);

// Create a new waste tip (protected route, business only)
router.post('/', authenticateBusiness, createWasteTip);

module.exports = router; 