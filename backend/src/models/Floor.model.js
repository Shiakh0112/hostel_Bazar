const mongoose = require('mongoose');

const floorSchema = new mongoose.Schema({
  hostel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hostel',
    required: true
  },
  floorNumber: {
    type: Number,
    required: true
  },
  totalRooms: {
    type: Number,
    required: true
  },
  occupiedRooms: {
    type: Number,
    default: 0
  },
  availableRooms: {
    type: Number,
    default: 0
  },
  totalBeds: {
    type: Number,
    default: 0
  },
  occupiedBeds: {
    type: Number,
    default: 0
  },
  availableBeds: {
    type: Number,
    default: 0
  },
  facilities: [{
    type: String
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

floorSchema.pre('save', function(next) {
  this.availableRooms = this.totalRooms - this.occupiedRooms;
  this.availableBeds = this.totalBeds - this.occupiedBeds;
  next();
});

module.exports = mongoose.model('Floor', floorSchema);