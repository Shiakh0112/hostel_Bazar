const User = require("../models/User.model");
const asyncHandler = require("../utils/asyncHandler");
const ApiResponse = require("../utils/apiResponse");
const generateOTP = require("../utils/generateOTP");
const generateToken = require("../utils/generateToken");
const emailService = require("../services/email.service");

/* ===================== SIGNUP ===================== */
const signup = asyncHandler(async (req, res) => {
  const { name, email, password, mobile, role } = req.body;

  if (role === "staff") {
    return res
      .status(400)
      .json(new ApiResponse(400, null, "Staff signup not allowed"));
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, "User already exists"));
  }

  const otp = generateOTP();

  const user = await User.create({
    name,
    email,
    password,
    mobile,
    role,
    otp,
    otpExpiry: Date.now() + 10 * 60 * 1000,
  });

  await emailService.sendOTP(email, otp, name);

  res
    .status(201)
    .json(new ApiResponse(201, { userId: user._id }, "OTP sent to email"));
});

/* ===================== VERIFY OTP ===================== */
const verifyOTP = asyncHandler(async (req, res) => {
  const { userId, otp } = req.body;

  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json(new ApiResponse(404, null, "User not found"));
  }

  if (user.otp !== otp || user.otpExpiry < Date.now()) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, "Invalid or expired OTP"));
  }

  user.isVerified = true;
  user.otp = undefined;
  user.otpExpiry = undefined;
  await user.save();

  // ✅ Optional but recommended
  await emailService.sendWelcomeEmail(user.email, user.name, user.role);

  const token = generateToken(user._id);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
      "Account verified successfully"
    )
  );
});

/* ===================== RESEND OTP (MISSING BEFORE) ===================== */
const resendOTP = asyncHandler(async (req, res) => {
  const { userId } = req.body;

  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json(new ApiResponse(404, null, "User not found"));
  }

  const otp = generateOTP();
  user.otp = otp;
  user.otpExpiry = Date.now() + 10 * 60 * 1000;
  await user.save();

  await emailService.sendOTP(user.email, otp, user.name);

  res.status(200).json(new ApiResponse(200, null, "OTP resent successfully"));
});

/* ===================== LOGIN ===================== */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.comparePassword(password))) {
    return res
      .status(401)
      .json(new ApiResponse(401, null, "Invalid credentials"));
  }

  if (!user.isVerified) {
    return res
      .status(401)
      .json(new ApiResponse(401, null, "Please verify your account"));
  }

  if (!user.isActive) {
    return res
      .status(401)
      .json(new ApiResponse(401, null, "Account is deactivated"));
  }

  const token = generateToken(user._id);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
      "Login successful"
    )
  );
});

/* ===================== STAFF LOGIN (MISSING BEFORE) ===================== */
const staffLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({
    email,
    role: "staff",
  }).select("+password");

  if (!user || !(await user.comparePassword(password))) {
    return res
      .status(401)
      .json(new ApiResponse(401, null, "Invalid staff credentials"));
  }

  if (!user.isActive) {
    return res
      .status(401)
      .json(new ApiResponse(401, null, "Account is deactivated"));
  }

  const token = generateToken(user._id);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
      "Staff login successful"
    )
  );
});

/* ===================== FORGOT PASSWORD ===================== */
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json(new ApiResponse(404, null, "User not found"));
  }

  const otp = generateOTP();
  user.otp = otp;
  user.otpExpiry = Date.now() + 10 * 60 * 1000;
  await user.save();

  await emailService.sendPasswordResetOTP(email, otp, user.name);

  res
    .status(200)
    .json(
      new ApiResponse(200, { userId: user._id }, "Password reset OTP sent")
    );
});

/* ===================== RESET PASSWORD ===================== */
const resetPassword = asyncHandler(async (req, res) => {
  const { userId, otp, newPassword } = req.body;

  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json(new ApiResponse(404, null, "User not found"));
  }

  if (user.otp !== otp || user.otpExpiry < Date.now()) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, "Invalid or expired OTP"));
  }

  user.password = newPassword;
  user.otp = undefined;
  user.otpExpiry = undefined;
  await user.save();

  res.status(200).json(new ApiResponse(200, null, "Password reset successful"));
});

/* ===================== GET PROFILE ===================== */
const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).populate("hostel owner");

  res
    .status(200)
    .json(new ApiResponse(200, user, "Profile fetched successfully"));
});

/* ===================== UPDATE PROFILE ===================== */
const updateProfile = asyncHandler(async (req, res) => {
  const { name, mobile, address, city, state, pincode, businessName, gstNumber } = req.body;
  
  const user = await User.findById(req.user.id);
  
  if (name) user.name = name;
  if (mobile) user.mobile = mobile;
  if (address) user.address = address;
  if (city) user.city = city;
  if (state) user.state = state;
  if (pincode) user.pincode = pincode;
  if (businessName) user.businessName = businessName;
  if (gstNumber) user.gstNumber = gstNumber;

  // Handle avatar upload if file is provided
  if (req.file) {
    const cloudinary = require('../config/cloudinary');
    try {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'profile_avatars',
        resource_type: 'image'
      });
      user.avatar = result.secure_url;
    } catch (error) {
      return res.status(500).json(new ApiResponse(500, null, 'Avatar upload failed'));
    }
  }

  await user.save();
  user.password = undefined;

  res.status(200).json(new ApiResponse(200, user, "Profile updated successfully"));
});

/* ===================== UPLOAD PROFILE IMAGE ===================== */
const uploadProfileImage = asyncHandler(async (req, res) => {
  const cloudinary = require("../config/cloudinary");

  if (!req.file) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, "No image file provided"));
  }

  const result = await cloudinary.uploader.upload(req.file.path, {
    folder: "profile_images",
    resource_type: "image",
    transformation: [
      { width: 300, height: 300, crop: "fill" },
      { quality: "auto" },
    ],
  });

  const user = await User.findByIdAndUpdate(
    req.user.id,
    { avatar: result.secure_url },
    { new: true }
  );

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { avatar: user.avatar },
        "Profile image uploaded successfully"
      )
    );
});

/* ===================== CHANGE PASSWORD ===================== */
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json(new ApiResponse(400, null, 'New password must be at least 6 characters'));
  }

  const user = await User.findById(req.user.id).select('+password');

  if (!(await user.comparePassword(currentPassword))) {
    return res.status(400).json(new ApiResponse(400, null, 'Current password is incorrect'));
  }

  user.password = newPassword;
  await user.save();

  res.status(200).json(new ApiResponse(200, null, 'Password changed successfully'));
});

module.exports = {
  signup,
  verifyOTP,
  resendOTP,
  login,
  staffLogin,
  forgotPassword,
  resetPassword,
  getProfile,
  updateProfile,
  uploadProfileImage,
  changePassword
};
