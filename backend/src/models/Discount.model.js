const mongoose = require('mongoose');

const discountSchema = new mongoose.Schema({
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
  name: {
    type: String,
    required: true
  },
  code: {
    type: String,
    unique: true,
    uppercase: true
  },
  type: {
    type: String,
    enum: ['percentage', 'fixed'],
    required: true
  },
  value: {
    type: Number,
    required: true,
    min: 0
  },
  maxDiscount: {
    type: Number // For percentage discounts
  },
  minAmount: {
    type: Number,
    default: 0
  },
  applicableOn: {
    type: String,
    enum: ['advance', 'monthly', 'all'],
    default: 'all'
  },
  validFrom: {
    type: Date,
    default: Date.now
  },
  validTill: {
    type: Date,
    required: true
  },
  usageLimit: {
    type: Number,
    default: null // null means unlimited
  },
  usedCount: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  eligibleStudents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  description: String,
  terms: String
}, {
  timestamps: true
});

module.exports = mongoose.model('Discount', discountSchema);