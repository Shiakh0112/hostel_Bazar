const mongoose = require('mongoose');

const roomTransferSchema = new mongoose.Schema({
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
  currentRoom: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: true
  },
  currentBed: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bed',
    required: true
  },
  requestedRoom: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room'
  },
  requestedBed: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bed'
  },
  transferType: {
    type: String,
    enum: ['room_change', 'bed_change', 'hostel_change'],
    required: true
  },
  reason: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'completed', 'cancelled'],
    default: 'pending'
  },
  requestedDate: {
    type: Date,
    default: Date.now
  },
  preferredMoveDate: {
    type: Date,
    required: true
  },
  actualMoveDate: Date,
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: Date,
  rejectionReason: String,
  transferFee: {
    type: Number,
    default: 0
  },
  additionalCharges: {
    type: Number,
    default: 0
  },
  notes: String,
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('RoomTransfer', roomTransferSchema);