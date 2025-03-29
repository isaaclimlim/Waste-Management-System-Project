const WasteTip = require('../models/WasteTip');

// Get all waste tips grouped by category
const getWasteTips = async (req, res) => {
  try {
    const tips = await WasteTip.find().sort({ category: 1, createdAt: -1 }).lean();

    // Group tips by category
    const groupedTips = tips.reduce((acc, tip) => {
      acc[tip.category] = acc[tip.category] || [];
      acc[tip.category].push(tip);
      return acc;
    }, {});

    res.status(200).json({
      success: true,
      data: groupedTips
    });
  } catch (error) {
    console.error('Error in getWasteTips:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Create a new waste tip (admin only)
const createWasteTip = async (req, res) => {
  try {
    const newWasteTip = await WasteTip.create(req.body);
    res.status(201).json({
      success: true,
      data: newWasteTip
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

module.exports = { getWasteTips, createWasteTip };
