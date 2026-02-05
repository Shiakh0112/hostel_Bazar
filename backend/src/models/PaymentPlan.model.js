const mongoose = require('mongoose');

const paymentPlanSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true
  },
  hostel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hostel',
    required: true
  },
  planType: {
    type: String,
    enum: ['monthly', 'quarterly', 'semester', 'custom'],
    required: true
  },
  totalAmount: {
    type: Number,
    required: true
  },
  installments: [{
    installmentNumber: { type: Number, required: true },
    amount: { type: Number, required: true },
    dueDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ['pending', 'paid', 'overdue', 'cancelled'],
      default: 'pending'
    },
    paidAt: Date,
    paymentId: String,
    lateFee: { type: Number, default: 0 }
  }],
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled', 'defaulted'],
    default: 'active'
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  interestRate: {
    type: Number,
    default: 0
  },
  processingFee: {
    type: Number,
    default: 0
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: Date,
  notes: String
}, {
  timestamps: true
});

module.exports = mongoose.model('PaymentPlan', paymentPlanSchema);