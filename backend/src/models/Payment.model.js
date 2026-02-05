const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
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
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking'
  },
  invoice: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Invoice'
  },
  paymentType: {
    type: String,
    enum: ['advance', 'monthly', 'security_deposit', 'maintenance', 'late_fee', 'other'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  baseRent: {
    type: Number,
    default: 0
  },
  electricityCharges: {
    type: Number,
    default: 0
  },
  maintenanceCharges: {
    type: Number,
    default: 0
  },
  paymentMethod: {
    type: String,
    enum: ['razorpay', 'stripe', 'phonepe', 'upi', 'googlepay', 'fake_card', 'cash', 'bank_transfer'],
    default: 'razorpay'
  },
  // Razorpay fields
  razorpayOrderId: {
    type: String
  },
  razorpayPaymentId: {
    type: String
  },
  razorpaySignature: {
    type: String
  },
  // Stripe fields
  stripePaymentIntentId: {
    type: String
  },
  stripeClientSecret: {
    type: String
  },
  // PhonePe fields
  phonepeTransactionId: {
    type: String
  },
  phonepeOrderId: {
    type: String
  },
  // UPI fields
  upiTransactionId: {
    type: String
  },
  upiVpa: {
    type: String
  },
  // Google Pay fields
  googlepayTransactionId: {
    type: String
  },
  // Fake Card fields (for testing)
  fakeCardNumber: {
    type: String
  },
  fakeCardExpiry: {
    type: String
  },
  fakeCardCvv: {
    type: String
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  description: {
    type: String
  },
  dueDate: {
    type: Date
  },
  paidAt: {
    type: Date
  },
  month: {
    type: String
  },
  year: {
    type: Number
  },
  lateFee: {
    type: Number,
    default: 0
  },
  discount: {
    type: Number,
    default: 0
  },
  discountType: {
    type: String,
    enum: ['percentage', 'fixed'],
    default: 'fixed'
  },
  discountReason: {
    type: String
  },
  isOverdue: {
    type: Boolean,
    default: false
  },
  overdueDate: {
    type: Date
  },
  lateFeeApplied: {
    type: Boolean,
    default: false
  },
  receipt: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Payment', paymentSchema);