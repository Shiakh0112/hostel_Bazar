const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth.middleware');
const roleAuth = require('../middlewares/role.middleware');
const upload = require('../middlewares/upload.middleware');
const User = require('../models/User.model');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/apiResponse');

// Get student profile
const getStudentProfile = asyncHandler(async (req, res) => {
  const student = await User.findById(req.user.id)
    .populate('hostel', 'name address contact')
    .select('-password');
  res.status(200).json(new ApiResponse(200, student, 'Student profile fetched successfully'));
});

// Update student profile
const updateStudentProfile = asyncHandler(async (req, res) => {
  const { name, mobile, address, city, state, pincode, idProofType, idProofNumber } = req.body;
  const student = await User.findById(req.user.id);
  
  if (name) student.name = name;
  if (mobile) student.mobile = mobile;
  if (address) student.address = address;
  if (city) student.city = city;
  if (state) student.state = state;
  if (pincode) student.pincode = pincode;
  
  if (idProofType && idProofNumber) {
    student.idProof = { type: idProofType, number: idProofNumber };
  }

  if (req.file) {
    const cloudinary = require('../config/cloudinary');
    try {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'student_avatars',
        resource_type: 'image'
      });
      student.avatar = result.secure_url;
    } catch (error) {
      return res.status(500).json(new ApiResponse(500, null, 'Avatar upload failed'));
    }
  }

  await student.save();
  student.password = undefined;
  res.status(200).json(new ApiResponse(200, student, 'Profile updated successfully'));
});

// Change password
const changeStudentPassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json(new ApiResponse(400, null, 'New password must be at least 6 characters'));
  }
  const student = await User.findById(req.user.id).select('+password');
  if (!(await student.comparePassword(currentPassword))) {
    return res.status(400).json(new ApiResponse(400, null, 'Current password is incorrect'));
  }
  student.password = newPassword;
  await student.save();
  res.status(200).json(new ApiResponse(200, null, 'Password changed successfully'));
});

// Get hostel info
const getStudentHostelInfo = asyncHandler(async (req, res) => {
  const Booking = require('../models/Booking.model');
  
  const booking = await Booking.findOne({
    student: req.user.id,
    status: { $in: ['confirmed', 'approved'] },
    isActive: true
  })
  .populate('hostel', 'name address')
  .populate('allocatedRoom', 'roomNumber floorNumber')
  .populate('allocatedBed', 'bedNumber');

  if (!booking) {
    return res.status(200).json(new ApiResponse(200, null, 'No active hostel booking found'));
  }

  const hasCheckedOut = booking.actualCheckOut !== null;
  const hostelInfo = {
    hostelName: booking.hostel?.name || 'N/A',
    roomNumber: booking.allocatedRoom?.roomNumber || null,
    bedNumber: booking.allocatedBed?.bedNumber || null,
    checkInDate: booking.actualCheckIn,
    checkOutDate: booking.actualCheckOut,
    status: hasCheckedOut ? 'left' : (booking.actualCheckIn ? 'active' : 'pending')
  };

  res.status(200).json(new ApiResponse(200, hostelInfo, 'Hostel information fetched successfully'));
});

// Routes
router.get('/profile', protect, roleAuth(['student']), getStudentProfile);
router.put('/profile', protect, roleAuth(['student']), upload.single('avatar'), updateStudentProfile);
router.put('/change-password', protect, roleAuth(['student']), changeStudentPassword);
router.get('/hostel-info', protect, roleAuth(['student']), getStudentHostelInfo);

module.exports = router;
