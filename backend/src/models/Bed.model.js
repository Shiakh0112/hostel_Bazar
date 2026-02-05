const mongoose = require('mongoose');

const bedSchema = new mongoose.Schema({
  hostel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hostel',
    required: true
  },
  floor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Floor',
    required: true
  },
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: true
  },
  bedNumber: {
    type: String,
    required: true
  },
  roomNumber: {
    type: String,
    required: true
  },
  floorNumber: {
    type: Number,
    required: true
  },
  isOccupied: {
    type: Boolean,
    default: false
  },
  occupant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking'
  },
  monthlyRent: {
    type: Number,
    required: true
  },
  occupiedFrom: {
    type: Date
  },
  occupiedTill: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Bed', bedSchema);