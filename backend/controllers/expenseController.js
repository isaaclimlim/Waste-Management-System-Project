const Expense = require('../models/Expense');
const BulkWasteRequest = require('../models/BulkWasteRequest');

// Get all expenses
const getExpenses = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const businessId = req.user._id;

    const result = await Expense.getExpensesByBusiness(businessId, startDate, endDate);

    if (result.success) {
      res.json({
        success: true,
        data: result.data
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Failed to fetch expenses',
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error in getExpenses:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Create new expense
const createExpense = async (req, res) => {
  try {
    const { requestId, amount, category, description } = req.body;
    const businessId = req.user._id;

    // Verify the request belongs to the business
    const request = await BulkWasteRequest.findOne({
      _id: requestId,
      businessId
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Waste request not found'
      });
    }

    const expenseData = {
      businessId,
      requestId,
      amount: Number(amount),
      category,
      description,
      date: new Date()
    };

    const result = await Expense.createExpense(expenseData);

    if (result.success) {
      // Emit socket event for real-time updates
      req.app.get('io').to(`business:${businessId}`).emit('expense:created', result.data);

      res.status(201).json({
        success: true,
        message: 'Expense created successfully',
        data: result.data
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Failed to create expense',
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error in createExpense:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get single expense
const getExpenseById = async (req, res) => {
  try {
    const expense = await Expense.findOne({
      _id: req.params.id,
      businessId: req.user._id
    }).populate('requestId', 'wasteType quantity');
    
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    
    res.json({
      success: true,
      data: expense
    });
  } catch (error) {
    console.error('Error in getExpenseById:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching expense',
      error: error.message
    });
  }
};

// Update expense
const updateExpense = async (req, res) => {
  try {
    const { amount, category, description } = req.body;
    const expense = await Expense.findOneAndUpdate(
      { _id: req.params.id, businessId: req.user._id },
      { amount, category, description },
      { new: true }
    ).populate('requestId', 'wasteType quantity');
    
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    
    res.json({
      success: true,
      message: 'Expense updated successfully',
      data: expense
    });
  } catch (error) {
    console.error('Error in updateExpense:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating expense',
      error: error.message
    });
  }
};

// Delete expense
const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findOneAndDelete({
      _id: req.params.id,
      businessId: req.user._id
    });
    
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    
    res.json({
      success: true,
      message: 'Expense deleted successfully'
    });
  } catch (error) {
    console.error('Error in deleteExpense:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting expense',
      error: error.message
    });
  }
};

// Get expense analytics
const getExpenseAnalytics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const businessId = req.user._id;

    const result = await Expense.getExpenseAnalytics(businessId, startDate, endDate);

    if (result.success) {
      res.json({
        success: true,
        data: result.data
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Failed to fetch expense analytics',
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error in getExpenseAnalytics:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

module.exports = {
  getExpenses,
  createExpense,
  getExpenseById,
  updateExpense,
  deleteExpense,
  getExpenseAnalytics
}; 