const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  hostel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hostel',
    required: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    enum: ['maintenance', 'utilities', 'staff_salary', 'supplies', 'marketing', 'insurance', 'rent', 'other'],
    required: true
  },
  subcategory: {
    type: String
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  description: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'bank_transfer', 'card', 'upi', 'cheque'],
    default: 'cash'
  },
  vendor: {
    name: String,
    contact: String,
    email: String
  },
  receipt: {
    type: String // URL to receipt image
  },
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringFrequency: {
    type: String,
    enum: ['monthly', 'quarterly', 'yearly']
  },
  nextDueDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'cancelled'],
    default: 'paid'
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  tags: [String]
}, {
  timestamps: true
});

module.exports = mongoose.model('Expense', expenseSchema);