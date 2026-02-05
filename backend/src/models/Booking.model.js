const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
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
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  bookingDetails: {
    fullName: { type: String, required: true },
    mobile: { type: String, required: true },
    email: { type: String, required: true },
    idProof: { type: String, required: true },
    preferredRoomType: {
      type: String,
      enum: ['single', 'double', 'triple', 'dormitory'],
      required: true
    },
    checkInDate: { type: Date, required: true },
    expectedCheckOutDate: { type: Date, required: true },
    numberOfPersons: { type: Number, default: 1 },
    notes: { type: String }
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'confirmed', 'cancelled', 'completed'],
    default: 'pending'
  },
  allocatedRoom: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room'
  },
  allocatedBed: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bed'
  },
  advancePayment: {
    amount: { type: Number },
    status: {
      type: String,
      enum: ['pending', 'paid', 'failed'],
      default: 'pending'
    },
    paymentId: { type: String },
    paidAt: { type: Date }
  },
  approvalDetails: {
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    approvedAt: { type: Date },
    rejectionReason: { type: String }
  },
  actualCheckIn: {
    type: Date
  },
  actualCheckOut: {
    type: Date
  },
  totalAmount: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  needsManualAllocation: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Booking', bookingSchema);