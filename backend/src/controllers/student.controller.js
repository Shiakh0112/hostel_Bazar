const User = require('../models/User.model');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/apiResponse');

const getStudentProfile = asyncHandler(async (req, res) => {
  const student = await User.findById(req.user.id)
    .populate('hostel', 'name address contact')
    .select('-password');

  res.status(200).json(new ApiResponse(200, student, 'Student profile fetched successfully'));
});

const updateStudentProfile = asyncHandler(async (req, res) => {
  const { 
    name, mobile, address, city, state, pincode, idProofType, idProofNumber,
    emergencyContactName, emergencyContactMobile, emergencyContactRelation
  } = req.body;

  const student = await User.findById(req.user.id);
  
  if (name) student.name = name;
  if (mobile) student.mobile = mobile;
  if (address) student.address = address;
  if (city) student.city = city;
  if (state) student.state = state;
  if (pincode) student.pincode = pincode;
  
  if (idProofType && idProofNumber) {
    student.idProof = {
      type: idProofType,
      number: idProofNumber
    };
  }

  // Handle emergency contact
  if (emergencyContactName || emergencyContactMobile || emergencyContactRelation) {
    student.emergencyContact = {
      name: emergencyContactName || student.emergencyContact?.name || '',
      mobile: emergencyContactMobile || student.emergencyContact?.mobile || '',
      relation: emergencyContactRelation || student.emergencyContact?.relation || ''
    };
  }

  // Handle avatar upload if file is provided
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

const getStudentHostelInfo = asyncHandler(async (req, res) => {
  const Booking = require('../models/Booking.model');
  const Bed = require('../models/Bed.model');
  
  try {
    // Find active booking for the student
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

    // Check if student has checked out
    const hasCheckedOut = booking.actualCheckOut !== null;
    
    const hostelInfo = {
      hostelName: booking.hostel?.name || 'N/A',
      hostelAddress: booking.hostel?.address || 'N/A',
      roomNumber: booking.allocatedRoom?.roomNumber || null,
      bedNumber: booking.allocatedBed?.bedNumber || null,
      floorNumber: booking.allocatedRoom?.floorNumber || null,
      checkInDate: booking.actualCheckIn || booking.bookingDetails?.checkInDate,
      checkOutDate: booking.actualCheckOut,
      expectedCheckOut: booking.bookingDetails?.expectedCheckOutDate,
      status: hasCheckedOut ? 'left' : (booking.actualCheckIn ? 'active' : 'pending'),
      bookingStatus: booking.status
    };

    res.status(200).json(new ApiResponse(200, hostelInfo, 'Hostel information fetched successfully'));
  } catch (error) {
    res.status(500).json(new ApiResponse(500, null, 'Failed to fetch hostel information'));
  }
});

module.exports = {
  getStudentProfile,
  updateStudentProfile,
  changeStudentPassword,
  getStudentHostelInfo
};
