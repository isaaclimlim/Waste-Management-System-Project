const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Collector = require('../models/Collector');

// Verify JWT token
const verifyToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access token is required'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
};

// Verify collector role
const authenticateCollector = async (req, res, next) => {
  try {
    // Check if user is a collector
    if (!req.user || req.user.role !== 'collector') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Collector role required.'
      });
    }

    // Check if collector profile exists
    const collector = await Collector.findOne({ userId: req.user._id });
    
    if (!collector) {
      return res.status(404).json({
        success: false,
        message: 'Collector profile not found'
      });
    }

    // Add collector profile to request
    req.collector = collector;
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error authenticating collector',
      error: error.message
    });
  }
};

// Verify business role
const authenticateBusiness = async (req, res, next) => {
  try {
    // Check if user is a business
    if (!req.user || req.user.role !== 'business') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Business role required.'
      });
    }

    // Add business user to request
    req.business = req.user;
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error authenticating business',
      error: error.message
    });
  }
};

module.exports = {
  verifyToken,
  authenticateCollector,
  authenticateBusiness
}; 