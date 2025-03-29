const express = require('express');
const router = express.Router();
const { authenticateBusiness } = require('../middleware/auth');
const {
  getExpenses,
  createExpense,
  getExpenseById,
  updateExpense,
  deleteExpense
} = require('../controllers/expenseController');

// Apply authentication middleware to all routes
router.use(authenticateBusiness);

// Get all expenses
router.get('/', getExpenses);

// Create new expense
router.post('/', createExpense);

// Get single expense
router.get('/:id', getExpenseById);

// Update expense
router.put('/:id', updateExpense);

// Delete expense
router.delete('/:id', deleteExpense);

module.exports = router; 