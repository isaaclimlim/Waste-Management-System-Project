const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  businessId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  requestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BulkWasteRequest',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    enum: ['collection', 'disposal', 'recycling', 'other'],
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  description: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
expenseSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Static method to create a new expense
expenseSchema.statics.createExpense = async function(expenseData) {
  try {
    const expense = new this(expenseData);
    await expense.save();
    return {
      success: true,
      data: expense
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

// Static method to get expenses by business ID
expenseSchema.statics.getExpensesByBusiness = async function(businessId, startDate, endDate) {
  try {
    const query = { businessId };
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const expenses = await this.find(query)
      .sort({ date: -1 })
      .populate('requestId', 'wasteType quantity')
      .lean();
    
    return {
      success: true,
      data: expenses
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

// Static method to get expense analytics
expenseSchema.statics.getExpenseAnalytics = async function(businessId, startDate, endDate) {
  try {
    const query = { businessId };
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // Get monthly expenses
    const monthlyExpenses = await this.aggregate([
      { $match: query },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' }
          },
          totalAmount: { $sum: '$amount' }
        }
      },
      {
        $project: {
          _id: 0,
          month: {
            $concat: [
              { $toString: '$_id.year' },
              '-',
              { $toString: '$_id.month' }
            ]
          },
          totalAmount: 1
        }
      },
      { $sort: { month: 1 } }
    ]);

    // Get expenses by category
    const categoryExpenses = await this.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$category',
          totalAmount: { $sum: '$amount' }
        }
      },
      {
        $project: {
          _id: 0,
          category: '$_id',
          totalAmount: 1
        }
      }
    ]);

    return {
      success: true,
      data: {
        monthlyExpenses,
        categoryExpenses
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

const Expense = mongoose.model('Expense', expenseSchema);

module.exports = Expense; 