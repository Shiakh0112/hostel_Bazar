const Expense = require('../models/Expense.model');
const Hostel = require('../models/Hostel.model');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/apiResponse');
const moment = require('moment');

const createExpense = asyncHandler(async (req, res) => {
  const { hostelId, category, subcategory, amount, description, date, paymentMethod, vendor, isRecurring, recurringFrequency, tags } = req.body;

  // Verify hostel ownership
  if (!hostelId || hostelId.trim() === '') {
    return res.status(400).json(new ApiResponse(400, null, 'Valid hostel ID is required'));
  }
  
  const hostel = await Hostel.findOne({ _id: hostelId, owner: req.user.id });
  if (!hostel) {
    return res.status(404).json(new ApiResponse(404, null, 'Hostel not found'));
  }

  const expenseData = {
    hostel: hostelId,
    owner: req.user.id,
    category,
    subcategory,
    amount,
    description,
    date: date || new Date(),
    paymentMethod,
    vendor,
    isRecurring,
    tags
  };

  if (isRecurring && recurringFrequency) {
    expenseData.recurringFrequency = recurringFrequency;
    const nextDate = moment(date || new Date());
    
    if (recurringFrequency === 'monthly') {
      nextDate.add(1, 'month');
    } else if (recurringFrequency === 'quarterly') {
      nextDate.add(3, 'months');
    } else if (recurringFrequency === 'yearly') {
      nextDate.add(1, 'year');
    }
    
    expenseData.nextDueDate = nextDate.toDate();
  }

  // Handle receipt upload
  if (req.file) {
    const cloudinary = require('../config/cloudinary');
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'expense_receipts',
      resource_type: 'image'
    });
    expenseData.receipt = result.secure_url;
  }

  const expense = await Expense.create(expenseData);
  await expense.populate('hostel', 'name');

  res.status(201).json(new ApiResponse(201, expense, 'Expense created successfully'));
});

const getExpenses = asyncHandler(async (req, res) => {
  const { hostelId, category, startDate, endDate, page = 1, limit = 10 } = req.query;

  // Get owner's hostels
  let hostelFilter = { owner: req.user.id };
  if (hostelId && hostelId.trim() !== '') {
    hostelFilter._id = hostelId;
  }

  const hostels = await Hostel.find(hostelFilter).select('_id');
  const hostelIds = hostels.map(h => h._id);

  let filter = { hostel: { $in: hostelIds } };
  
  if (category) filter.category = category;
  if (startDate && endDate) {
    filter.date = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }

  const skip = (page - 1) * limit;

  const expenses = await Expense.find(filter)
    .populate('hostel', 'name')
    .sort({ date: -1 })
    .skip(skip)
    .limit(Number(limit));

  const total = await Expense.countDocuments(filter);

  // Calculate summary
  const summary = await Expense.aggregate([
    { $match: filter },
    {
      $group: {
        _id: null,
        totalAmount: { $sum: '$amount' },
        totalExpenses: { $sum: 1 }
      }
    }
  ]);

  // Category-wise breakdown
  const categoryBreakdown = await Expense.aggregate([
    { $match: filter },
    {
      $group: {
        _id: '$category',
        totalAmount: { $sum: '$amount' },
        count: { $sum: 1 }
      }
    },
    { $sort: { totalAmount: -1 } }
  ]);

  res.status(200).json(new ApiResponse(200, {
    expenses,
    summary: summary[0] || { totalAmount: 0, totalExpenses: 0 },
    categoryBreakdown,
    pagination: {
      current: Number(page),
      total: Math.ceil(total / limit),
      count: expenses.length,
      totalRecords: total
    }
  }, 'Expenses fetched successfully'));
});

const updateExpense = asyncHandler(async (req, res) => {
  const { expenseId } = req.params;
  const updates = req.body;

  const expense = await Expense.findOne({ _id: expenseId, owner: req.user.id });
  if (!expense) {
    return res.status(404).json(new ApiResponse(404, null, 'Expense not found'));
  }

  // Handle receipt upload
  if (req.file) {
    const cloudinary = require('../config/cloudinary');
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'expense_receipts',
      resource_type: 'image'
    });
    updates.receipt = result.secure_url;
  }

  Object.assign(expense, updates);
  await expense.save();
  await expense.populate('hostel', 'name');

  res.status(200).json(new ApiResponse(200, expense, 'Expense updated successfully'));
});

const deleteExpense = asyncHandler(async (req, res) => {
  const { expenseId } = req.params;

  const expense = await Expense.findOneAndDelete({ _id: expenseId, owner: req.user.id });
  if (!expense) {
    return res.status(404).json(new ApiResponse(404, null, 'Expense not found'));
  }

  res.status(200).json(new ApiResponse(200, null, 'Expense deleted successfully'));
});

const getExpenseStats = asyncHandler(async (req, res) => {
  const { hostelId, period = '30' } = req.query;

  let hostelFilter = { owner: req.user.id };
  if (hostelId && hostelId.trim() !== '') {
    hostelFilter._id = hostelId;
  }

  const hostels = await Hostel.find(hostelFilter).select('_id');
  const hostelIds = hostels.map(h => h._id);

  const startDate = moment().subtract(Number(period), 'days').toDate();

  // Monthly trend
  const monthlyExpenses = await Expense.aggregate([
    {
      $match: {
        hostel: { $in: hostelIds },
        date: { $gte: moment().subtract(12, 'months').toDate() }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$date' },
          month: { $month: '$date' }
        },
        totalAmount: { $sum: '$amount' },
        count: { $sum: 1 }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } }
  ]);

  // Category-wise expenses
  const categoryStats = await Expense.aggregate([
    {
      $match: {
        hostel: { $in: hostelIds },
        date: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: '$category',
        totalAmount: { $sum: '$amount' },
        count: { $sum: 1 },
        avgAmount: { $avg: '$amount' }
      }
    },
    { $sort: { totalAmount: -1 } }
  ]);

  // Recent expenses
  const recentExpenses = await Expense.find({
    hostel: { $in: hostelIds }
  })
    .populate('hostel', 'name')
    .sort({ date: -1 })
    .limit(5);

  res.status(200).json(new ApiResponse(200, {
    monthlyExpenses,
    categoryStats,
    recentExpenses
  }, 'Expense statistics fetched successfully'));
});

module.exports = {
  createExpense,
  getExpenses,
  updateExpense,
  deleteExpense,
  getExpenseStats
};