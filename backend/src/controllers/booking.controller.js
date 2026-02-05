const Booking = require('../models/Booking.model');
const Hostel = require('../models/Hostel.model');
const User = require('../models/User.model');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/apiResponse');
const allocationService = require('../services/allocation.service');
const notificationService = require('../services/notification.service');

const createBookingRequest = asyncHandler(async (req, res) => {
  const { hostelId, bookingDetails } = req.body;

  const hostel = await Hostel.findById(hostelId);
  if (!hostel) {
    return res.status(404).json(new ApiResponse(404, null, 'Hostel not found'));
  }

  if (hostel.availableBeds === 0) {
    return res.status(400).json(new ApiResponse(400, null, 'No beds available'));
  }

  const existingBooking = await Booking.findOne({
    student: req.user.id,
    hostel: hostelId,
    status: { $in: ['pending', 'approved', 'confirmed'] }
  });

  if (existingBooking) {
    return res.status(400).json(new ApiResponse(400, null, 'You already have an active booking for this hostel'));
  }

  const booking = await Booking.create({
    student: req.user.id,
    hostel: hostelId,
    owner: hostel.owner,
    bookingDetails
  });

  // Send notification to owner
  await notificationService.sendNotification({
    recipient: hostel.owner,
    type: 'booking_request',
    title: 'New Booking Request',
    message: `New booking request from ${bookingDetails.fullName}`,
    data: { bookingId: booking._id }
  });

  res.status(201).json(new ApiResponse(201, booking, 'Booking request submitted successfully'));
});

const getStudentBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find({ student: req.user.id })
    .populate('hostel', 'name address images pricing')
    .populate('allocatedRoom', 'roomNumber floorNumber')
    .populate('allocatedBed', 'bedNumber')
    .sort({ createdAt: -1 });

  res.status(200).json(new ApiResponse(200, bookings, 'Student bookings fetched successfully'));
});

const getOwnerBookingRequests = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;
  
  const filter = { owner: req.user.id };
  if (status) filter.status = status;

  const skip = (page - 1) * limit;

  const bookings = await Booking.find(filter)
    .populate('student', 'name email mobile')
    .populate('hostel', 'name address pricing')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  const total = await Booking.countDocuments(filter);

  res.status(200).json(new ApiResponse(200, {
    bookings,
    pagination: {
      current: Number(page),
      total: Math.ceil(total / limit),
      count: bookings.length,
      totalRecords: total
    }
  }, 'Booking requests fetched successfully'));
});

const approveBooking = asyncHandler(async (req, res) => {
  const { bookingId } = req.params;

  const booking = await Booking.findOne({ _id: bookingId, owner: req.user.id });
  if (!booking) {
    return res.status(404).json(new ApiResponse(404, null, 'Booking not found'));
  }

  if (booking.status !== 'pending') {
    return res.status(400).json(new ApiResponse(400, null, 'Booking already processed'));
  }

  const hostel = await Hostel.findById(booking.hostel);
  if (hostel.availableBeds === 0) {
    return res.status(400).json(new ApiResponse(400, null, 'No beds available'));
  }

  booking.status = 'approved';
  booking.approvalDetails = {
    approvedBy: req.user.id,
    approvedAt: new Date()
  };
  booking.advancePayment.amount = hostel.pricing.advancePayment;

  await booking.save();

  // Send notification to student
  await notificationService.sendNotification({
    recipient: booking.student,
    type: 'booking_approved',
    title: 'Booking Approved',
    message: `Your booking request for ${hostel.name} has been approved. Please make advance payment.`,
    data: { bookingId: booking._id }
  });

  res.status(200).json(new ApiResponse(200, booking, 'Booking approved successfully'));
});

const rejectBooking = asyncHandler(async (req, res) => {
  const { bookingId } = req.params;
  const { reason } = req.body;

  const booking = await Booking.findOne({ _id: bookingId, owner: req.user.id });
  if (!booking) {
    return res.status(404).json(new ApiResponse(404, null, 'Booking not found'));
  }

  if (booking.status !== 'pending') {
    return res.status(400).json(new ApiResponse(400, null, 'Booking already processed'));
  }

  booking.status = 'rejected';
  booking.approvalDetails = {
    approvedBy: req.user.id,
    approvedAt: new Date(),
    rejectionReason: reason
  };

  await booking.save();

  const hostel = await Hostel.findById(booking.hostel);

  // Send notification to student
  await notificationService.sendNotification({
    recipient: booking.student,
    type: 'booking_rejected',
    title: 'Booking Rejected',
    message: `Your booking request for ${hostel.name} has been rejected. Reason: ${reason}`,
    data: { bookingId: booking._id }
  });

  res.status(200).json(new ApiResponse(200, booking, 'Booking rejected successfully'));
});

const confirmBooking = asyncHandler(async (req, res) => {
  const { bookingId } = req.params;

  const booking = await Booking.findById(bookingId);
  if (!booking) {
    return res.status(404).json(new ApiResponse(404, null, 'Booking not found'));
  }

  if (booking.status !== 'approved' || booking.advancePayment.status !== 'paid') {
    return res.status(400).json(new ApiResponse(400, null, 'Payment not completed'));
  }

  // Allocate room and bed
  const allocation = await allocationService.allocateBed(booking.hostel, booking.student, booking._id);
  
  if (!allocation.success) {
    return res.status(400).json(new ApiResponse(400, null, allocation.message));
  }

  booking.status = 'confirmed';
  booking.allocatedRoom = allocation.room;
  booking.allocatedBed = allocation.bed;
  booking.actualCheckIn = new Date();
  booking.needsManualAllocation = false;

  await booking.save();

  // Send notification to student
  await notificationService.sendNotification({
    recipient: booking.student,
    type: 'room_allocated',
    title: 'Room Allocated',
    message: `Room ${allocation.roomNumber} has been allocated to you.`,
    data: { bookingId: booking._id, roomNumber: allocation.roomNumber }
  });

  res.status(200).json(new ApiResponse(200, booking, 'Booking confirmed and room allocated'));
});

const allocateRoomManually = asyncHandler(async (req, res) => {
  const { bookingId } = req.params;

  const booking = await Booking.findOne({ _id: bookingId, owner: req.user.id })
    .populate('student', 'name email')
    .populate('hostel', 'name');
    
  if (!booking) {
    return res.status(404).json(new ApiResponse(404, null, 'Booking not found'));
  }

  if (booking.status !== 'confirmed') {
    return res.status(400).json(new ApiResponse(400, null, 'Booking must be confirmed (payment completed) before allocation'));
  }

  if (booking.allocatedRoom && booking.allocatedBed) {
    return res.status(400).json(new ApiResponse(400, null, 'Room already allocated'));
  }

  console.log('📍 Manual room allocation requested for booking:', bookingId);
  
  // Allocate room and bed
  const allocation = await allocationService.allocateBed(
    booking.hostel._id, 
    booking.student._id,
    booking._id
  );
  
  if (!allocation.success) {
    console.error('❌ Manual allocation failed:', allocation.message);
    return res.status(400).json(new ApiResponse(400, null, allocation.message));
  }

  booking.allocatedRoom = allocation.room;
  booking.allocatedBed = allocation.bed;
  booking.actualCheckIn = booking.actualCheckIn || new Date();
  booking.needsManualAllocation = false;

  await booking.save();

  console.log('✅ Manual allocation successful:', {
    booking: bookingId,
    room: allocation.roomNumber,
    bed: allocation.bedNumber
  });

  // Send notification to student
  await notificationService.sendNotification({
    recipient: booking.student._id,
    type: 'room_allocated',
    title: 'Room Allocated',
    message: `Room ${allocation.roomNumber}, Bed ${allocation.bedNumber} has been allocated to you.`,
    data: { 
      bookingId: booking._id, 
      roomNumber: allocation.roomNumber,
      bedNumber: allocation.bedNumber
    }
  });

  res.status(200).json(new ApiResponse(200, booking, 'Room allocated successfully'));
});

const getBookingById = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id)
    .populate('student', 'name email mobile')
    .populate('hostel', 'name address pricing')
    .populate('allocatedRoom', 'roomNumber floorNumber')
    .populate('allocatedBed', 'bedNumber');

  if (!booking) {
    return res.status(404).json(new ApiResponse(404, null, 'Booking not found'));
  }

  // Check if user has access to this booking
  if (booking.student._id.toString() !== req.user.id && booking.owner.toString() !== req.user.id) {
    return res.status(403).json(new ApiResponse(403, null, 'Access denied'));
  }

  res.status(200).json(new ApiResponse(200, booking, 'Booking details fetched successfully'));
});

const cancelBooking = asyncHandler(async (req, res) => {
  const { bookingId } = req.params;

  const booking = await Booking.findOne({
    _id: bookingId,
    student: req.user.id,
    status: { $in: ['pending', 'approved'] }
  });

  if (!booking) {
    return res.status(404).json(new ApiResponse(404, null, 'Booking not found or cannot be cancelled'));
  }

  booking.status = 'cancelled';
  await booking.save();

  res.status(200).json(new ApiResponse(200, booking, 'Booking cancelled successfully'));
});

module.exports = {
  createBookingRequest,
  getStudentBookings,
  getOwnerBookingRequests,
  approveBooking,
  rejectBooking,
  confirmBooking,
  allocateRoomManually,
  getBookingById,
  cancelBooking
};