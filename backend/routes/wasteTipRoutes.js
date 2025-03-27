const express = require('express');
const router = express.Router();
const { auth, isAdmin } = require('../middleware/auth');
const { getWasteTips, createWasteTip } = require('../controllers/wasteTipController');

// Get all waste tips (public)
router.get('/', getWasteTips);

// Create a new waste tip (admin only)
router.post('/', auth, isAdmin, createWasteTip);

module.exports = router; 