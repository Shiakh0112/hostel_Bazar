const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false, // ✅ FIX (IMPORTANT)
    },
    mobile: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["student", "owner", "staff"],
      required: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    otp: {
      type: String,
    },
    otpExpiry: {
      type: Date,
    },
    avatar: {
      type: String,
    },
    address: {
      type: String,
    },
    city: {
      type: String,
    },
    state: {
      type: String,
    },
    pincode: {
      type: String,
    },
    businessName: {
      type: String,
    },
    gstNumber: {
      type: String,
    },
    idProof: {
      type: {
        type: String,
        enum: ['aadhar', 'pan', 'passport', 'driving_license', 'voter_id'],
      },
      number: String
    },
    emergencyContact: {
      name: String,
      mobile: String,
      relation: {
        type: String,
        enum: ['father', 'mother', 'guardian', 'sibling', 'spouse', 'friend', 'other']
      }
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    hostel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hostel",
    },
    permissions: [
      {
        type: String,
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    revenue: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

/* 🔐 PASSWORD HASHING */
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

/* 🔑 PASSWORD COMPARE */
userSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model("User", userSchema);
