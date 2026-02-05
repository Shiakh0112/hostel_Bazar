const mongoose = require('mongoose');

const checkoutSchema = new mongoose.Schema({
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  hostel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hostel',
    required: true
  },
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: true
  },
  bed: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bed',
    required: true
  },
  checkoutDate: {
    type: Date,
    required: true
  },
  requestedDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'completed', 'cancelled'],
    default: 'pending'
  },
  securityDeposit: {
    amount: { type: Number, required: true },
    refundAmount: { type: Number, default: 0 },
    deductions: [{
      reason: String,
      amount: Number,
      description: String
    }]
  },
  damageAssessment: {
    inspectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    inspectionDate: Date,
    damages: [{
      item: String,
      description: String,
      cost: Number,
      images: [String]
    }],
    totalDamageCost: { type: Number, default: 0 },
    notes: String
  },
  finalBill: {
    rentDue: { type: Number, default: 0 },
    utilitiesDue: { type: Number, default: 0 },
    damageCost: { type: Number, default: 0 },
    lateFees: { type: Number, default: 0 },
    otherCharges: { type: Number, default: 0 },
    totalDue: { type: Number, default: 0 },
    securityRefund: { type: Number, default: 0 },
    netAmount: { type: Number, default: 0 }
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: Date,
  rejectedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  rejectedAt: Date,
  rejectionReason: String,
  completedAt: Date,
  reason: String,
  notes: String
}, {
  timestamps: true
});

module.exports = mongoose.model('Checkout', checkoutSchema);