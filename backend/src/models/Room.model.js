const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
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
  roomNumber: {
    type: String,
    required: true
  },
  floorNumber: {
    type: Number,
    required: true
  },
  roomType: {
    type: String,
    enum: ['single', 'double', 'triple', 'dormitory'],
    required: true
  },
  totalBeds: {
    type: Number,
    required: true
  },
  occupiedBeds: {
    type: Number,
    default: 0
  },
  availableBeds: {
    type: Number,
    default: 0
  },
  attachedBathroom: {
    type: Boolean,
    default: false
  },
  amenities: [{
    type: String
  }],
  images: [{
    type: String
  }],
  monthlyRent: {
    type: Number,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isFull: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

roomSchema.pre('save', function(next) {
  this.availableBeds = this.totalBeds - this.occupiedBeds;
  this.isFull = this.occupiedBeds >= this.totalBeds;
  next();
});

module.exports = mongoose.model('Room', roomSchema);