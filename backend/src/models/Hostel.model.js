const mongoose = require('mongoose');

const hostelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  address: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    area: { type: String, required: true }
  },
  hostelType: {
    type: String,
    enum: ['boys', 'girls', 'co-ed'],
    required: true
  },
  structure: {
    totalFloors: { type: Number, required: true },
    roomsPerFloor: { type: Number, required: true },
    bedsPerRoom: { type: Number, required: true },
    roomType: {
      type: String,
      enum: ['single', 'double', 'triple', 'dormitory'],
      required: true
    },
    attachedBathroom: { type: Boolean, default: false }
  },
  amenities: [{
    type: String
  }],
  rules: [{
    type: String
  }],
  mainImage: {
    type: String
  },
  images: [{
    url: String,
    type: {
      type: String,
      enum: ['building', 'room', 'bathroom', 'mess', 'common', 'hall', 'kitchen', 'parking', 'garden']
    }
  }],
  pricing: {
    monthlyRent: { type: Number, required: true },
    advancePayment: { type: Number, required: true },
    maintenanceCharges: { type: Number, default: 0 }, // Only charged when maintenance work is done
    electricityCharges: { type: Number, required: true } // Always charged monthly
  },
  contact: {
    phone: String,
    email: String,
    whatsapp: String
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      default: [0, 0]
    }
  },
  totalBeds: {
    type: Number,
    default: 0
  },
  availableBeds: {
    type: Number,
    default: 0
  },
  occupiedBeds: {
    type: Number,
    default: 0
  },
  rating: {
    average: { type: Number, default: 0 },
    count: { type: Number, default: 0 }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isApproved: {
    type: Boolean,
    default: false
  },
  lateFeeSettings: {
    enabled: {
      type: Boolean,
      default: true
    },
    type: {
      type: String,
      enum: ['fixed', 'percentage', 'daily'],
      default: 'fixed'
    },
    amount: {
      type: Number,
      default: 100
    },
    percentage: {
      type: Number,
      default: 5
    },
    dailyAmount: {
      type: Number,
      default: 50
    },
    gracePeriod: {
      type: Number,
      default: 3
    },
    maxLateFee: {
      type: Number,
      default: 1000
    }
  },
  checkoutSettings: {
    noticePeriod: {
      type: Number,
      default: 30
    },
    advancePaymentRefund: {
      type: Boolean,
      default: true
    },
    deductionRules: {
      damage: { type: Number, default: 0 },
      cleaning: { type: Number, default: 500 },
      keyLoss: { type: Number, default: 200 }
    }
  }
}, {
  timestamps: true
});

hostelSchema.index({ location: '2dsphere' });

hostelSchema.pre('save', function(next) {
  if (this.isNew) {
    this.totalBeds = this.structure.totalFloors * this.structure.roomsPerFloor * this.structure.bedsPerRoom;
    this.availableBeds = this.totalBeds;
  }
  next();
});

module.exports = mongoose.model('Hostel', hostelSchema);