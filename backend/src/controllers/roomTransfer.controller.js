const RoomTransfer = require('../models/RoomTransfer.model');
const Booking = require('../models/Booking.model');
const Bed = require('../models/Bed.model');
const Room = require('../models/Room.model');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/apiResponse');
const notificationService = require('../services/notification.service');

const requestRoomTransfer = asyncHandler(async (req, res) => {
  const { bookingId, transferType, reason, preferredMoveDate, requestedRoomId, requestedBedId, priority } = req.body;

  const booking = await Booking.findOne({
    _id: bookingId,
    student: req.user.id,
    status: 'confirmed'
  });

  if (!booking) {
    return res.status(404).json(new ApiResponse(404, null, 'Active booking not found'));
  }

  // Check if there's already a pending transfer request
  const existingTransfer = await RoomTransfer.findOne({
    student: req.user.id,
    booking: bookingId,
    status: { $in: ['pending', 'approved'] }
  });

  if (existingTransfer) {
    return res.status(400).json(new ApiResponse(400, null, 'Transfer request already exists'));
  }

  // Validate requested room/bed availability
  if (requestedRoomId && requestedBedId) {
    const requestedBed = await Bed.findOne({
      _id: requestedBedId,
      room: requestedRoomId,
      isOccupied: false
    });

    if (!requestedBed) {
      return res.status(400).json(new ApiResponse(400, null, 'Requested bed is not available'));
    }
  }

  const transfer = await RoomTransfer.create({
    student: req.user.id,
    booking: bookingId,
    hostel: booking.hostel,
    currentRoom: booking.allocatedRoom,
    currentBed: booking.allocatedBed,
    requestedRoom: requestedRoomId,
    requestedBed: requestedBedId,
    transferType,
    reason,
    preferredMoveDate: new Date(preferredMoveDate),
    priority: priority || 'medium'
  });

  await notificationService.sendNotification({
    recipient: booking.owner,
    type: 'room_transfer_request',
    title: 'Room Transfer Request',
    message: `Student has requested ${transferType.replace('_', ' ')} - ${reason}`,
    data: { transferId: transfer._id }
  });

  res.status(201).json(new ApiResponse(201, transfer, 'Room transfer request submitted successfully'));
});

const getStudentTransfers = asyncHandler(async (req, res) => {
  const transfers = await RoomTransfer.find({ student: req.user.id })
    .populate('currentRoom', 'roomNumber floorNumber')
    .populate('currentBed', 'bedNumber')
    .populate('requestedRoom', 'roomNumber floorNumber')
    .populate('requestedBed', 'bedNumber')
    .populate('hostel', 'name')
    .sort({ createdAt: -1 });

  res.status(200).json(new ApiResponse(200, transfers, 'Transfer requests fetched successfully'));
});

const getOwnerTransfers = asyncHandler(async (req, res) => {
  const { status, priority } = req.query;

  const transfers = await RoomTransfer.find()
    .populate({
      path: 'booking',
      match: { owner: req.user.id },
      populate: { path: 'student', select: 'name email mobile' }
    })
    .populate('currentRoom', 'roomNumber floorNumber')
    .populate('currentBed', 'bedNumber')
    .populate('requestedRoom', 'roomNumber floorNumber')
    .populate('requestedBed', 'bedNumber')
    .populate('hostel', 'name')
    .sort({ priority: -1, createdAt: -1 });

  let filteredTransfers = transfers.filter(transfer => transfer.booking);

  if (status) {
    filteredTransfers = filteredTransfers.filter(transfer => transfer.status === status);
  }

  if (priority) {
    filteredTransfers = filteredTransfers.filter(transfer => transfer.priority === priority);
  }

  res.status(200).json(new ApiResponse(200, filteredTransfers, 'Transfer requests fetched successfully'));
});

const approveTransfer = asyncHandler(async (req, res) => {
  const { transferId } = req.params;
  const { transferFee, additionalCharges, notes } = req.body;

  const transfer = await RoomTransfer.findById(transferId)
    .populate('booking')
    .populate('student', 'name email');

  if (!transfer || transfer.booking.owner.toString() !== req.user.id) {
    return res.status(404).json(new ApiResponse(404, null, 'Transfer request not found'));
  }

  if (transfer.status !== 'pending') {
    return res.status(400).json(new ApiResponse(400, null, 'Transfer already processed'));
  }

  // Check if requested bed is still available
  if (transfer.requestedBed) {
    const bed = await Bed.findById(transfer.requestedBed);
    if (bed.isOccupied) {
      return res.status(400).json(new ApiResponse(400, null, 'Requested bed is no longer available'));
    }
  }

  transfer.status = 'approved';
  transfer.approvedBy = req.user.id;
  transfer.approvedAt = new Date();
  transfer.transferFee = transferFee || 0;
  transfer.additionalCharges = additionalCharges || 0;
  transfer.notes = notes;

  await transfer.save();

  await notificationService.sendNotification({
    recipient: transfer.student._id,
    type: 'room_transfer_approved',
    title: 'Room Transfer Approved',
    message: 'Your room transfer request has been approved. Please coordinate the move date.',
    data: { transferId: transfer._id }
  });

  res.status(200).json(new ApiResponse(200, transfer, 'Transfer request approved successfully'));
});

const rejectTransfer = asyncHandler(async (req, res) => {
  const { transferId } = req.params;
  const { rejectionReason } = req.body;

  const transfer = await RoomTransfer.findById(transferId)
    .populate('booking')
    .populate('student', 'name email');

  if (!transfer || transfer.booking.owner.toString() !== req.user.id) {
    return res.status(404).json(new ApiResponse(404, null, 'Transfer request not found'));
  }

  if (transfer.status !== 'pending') {
    return res.status(400).json(new ApiResponse(400, null, 'Transfer already processed'));
  }

  transfer.status = 'rejected';
  transfer.rejectionReason = rejectionReason;
  transfer.approvedBy = req.user.id;
  transfer.approvedAt = new Date();

  await transfer.save();

  await notificationService.sendNotification({
    recipient: transfer.student._id,
    type: 'room_transfer_rejected',
    title: 'Room Transfer Rejected',
    message: `Your room transfer request has been rejected. Reason: ${rejectionReason}`,
    data: { transferId: transfer._id }
  });

  res.status(200).json(new ApiResponse(200, transfer, 'Transfer request rejected successfully'));
});

const completeTransfer = asyncHandler(async (req, res) => {
  const { transferId } = req.params;

  const transfer = await RoomTransfer.findById(transferId)
    .populate('booking')
    .populate('currentBed')
    .populate('requestedBed');

  if (!transfer || transfer.booking.owner.toString() !== req.user.id) {
    return res.status(404).json(new ApiResponse(404, null, 'Transfer request not found'));
  }

  if (transfer.status !== 'approved') {
    return res.status(400).json(new ApiResponse(400, null, 'Transfer must be approved first'));
  }

  // Update bed occupancy
  await Bed.findByIdAndUpdate(transfer.currentBed._id, {
    isOccupied: false,
    occupiedBy: null,
    occupiedFrom: null,
    occupiedTill: new Date()
  });

  await Bed.findByIdAndUpdate(transfer.requestedBed._id, {
    isOccupied: true,
    occupiedBy: transfer.student,
    occupiedFrom: new Date()
  });

  // Update booking
  await Booking.findByIdAndUpdate(transfer.booking._id, {
    allocatedRoom: transfer.requestedRoom,
    allocatedBed: transfer.requestedBed
  });

  transfer.status = 'completed';
  transfer.actualMoveDate = new Date();
  await transfer.save();

  await notificationService.sendNotification({
    recipient: transfer.student,
    type: 'room_transfer_completed',
    title: 'Room Transfer Completed',
    message: 'Your room transfer has been completed successfully.',
    data: { transferId: transfer._id }
  });

  res.status(200).json(new ApiResponse(200, transfer, 'Room transfer completed successfully'));
});

const getAvailableRooms = asyncHandler(async (req, res) => {
  const { hostelId, roomType } = req.query;

  let filter = { hostel: hostelId };
  if (roomType) filter.roomType = roomType;

  const rooms = await Room.find(filter)
    .populate({
      path: 'beds',
      match: { isOccupied: false }
    });

  const availableRooms = rooms.filter(room => room.beds.length > 0);

  res.status(200).json(new ApiResponse(200, availableRooms, 'Available rooms fetched successfully'));
});

const getStaffTransferRequests = asyncHandler(async (req, res) => {
  // Get staff's assigned hostel
  const staff = await require('../models/User.model').findById(req.user.id);
  if (!staff || !staff.hostel) {
    return res.status(200).json(new ApiResponse(200, [], 'No assigned hostel found'));
  }

  const transfers = await RoomTransfer.find({ hostel: staff.hostel })
    .populate('student', 'name email mobile')
    .populate('currentRoom', 'roomNumber floorNumber')
    .populate('currentBed', 'bedNumber')
    .populate('requestedRoom', 'roomNumber floorNumber')
    .populate('requestedBed', 'bedNumber')
    .populate('hostel', 'name')
    .sort({ priority: -1, createdAt: -1 });

  res.status(200).json(new ApiResponse(200, transfers, 'Staff transfer requests fetched successfully'));
});

module.exports = {
  requestRoomTransfer,
  getStudentTransfers,
  getOwnerTransfers,
  approveTransfer,
  rejectTransfer,
  completeTransfer,
  getAvailableRooms,
  getStaffTransferRequests
};