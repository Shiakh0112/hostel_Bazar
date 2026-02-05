const mongoose = require('mongoose');

const emergencyContactSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  relationship: {
    type: String,
    required: true,
    enum: ['parent', 'guardian', 'sibling', 'spouse', 'friend', 'relative', 'other']
  },
  mobile: {
    type: String,
    required: true
  },
  email: {
    type: String,
    lowercase: true
  },
  address: {
    type: String
  },
  isPrimary: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Ensure only one primary contact per user
emergencyContactSchema.pre('save', async function(next) {
  if (this.isPrimary) {
    await this.constructor.updateMany(
      { user: this.user, _id: { $ne: this._id } },
      { isPrimary: false }
    );
  }
  next();
});

module.exports = mongoose.model('EmergencyContact', emergencyContactSchema);