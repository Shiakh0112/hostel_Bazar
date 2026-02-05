const Checkout = require('../models/Checkout.model');
const Booking = require('../models/Booking.model');
const Bed = require('../models/Bed.model');
const Payment = require('../models/Payment.model');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/apiResponse');
const notificationService = require('../services/notification.service');

const requestCheckout = asyncHandler(async (req, res) => {
  const { bookingId, checkoutDate, reason } = req.body;

  const booking = await Booking.findOne({
    _id: bookingId,
    student: req.user.id,
    status: 'confirmed'
  }).populate('hostel', 'pricing securityDeposit');

  if (!booking) {
    return res.status(404).json(new ApiResponse(404, null, 'Active booking not found'));
  }

  const existingCheckout = await Checkout.findOne({
    booking: bookingId,
    status: { $in: ['pending', 'approved'] }
  });

  if (existingCheckout) {
    return res.status(400).json(new ApiResponse(400, null, 'Checkout request already exists'));
  }

  const checkout = await Checkout.create({
    booking: bookingId,
    student: req.user.id,
    hostel: booking.hostel._id,
    room: booking.allocatedRoom,
    bed: booking.allocatedBed,
    checkoutDate: new Date(checkoutDate),
    reason,
    securityDeposit: {
      amount: booking.hostel.securityDeposit || 0
    }
  });

  await notificationService.sendNotification({
    recipient: booking.owner,
    type: 'checkout_request',
    title: 'Checkout Request',
    message: `Student has requested checkout for ${new Date(checkoutDate).toLocaleDateString()}`,
    data: { checkoutId: checkout._id }
  });

  res.status(201).json(new ApiResponse(201, checkout, 'Checkout request submitted successfully'));
});

const getStudentCheckouts = asyncHandler(async (req, res) => {
  const checkouts = await Checkout.find({ student: req.user.id })
    .populate('hostel', 'name')
    .populate('room', 'roomNumber')
    .populate('bed', 'bedNumber')
    .sort({ createdAt: -1 });

  res.status(200).json(new ApiResponse(200, checkouts, 'Checkout requests fetched successfully'));
});

const getOwnerCheckouts = asyncHandler(async (req, res) => {
  const { status } = req.query;
  
  let filter = {};
  if (status) filter.status = status;

  const checkouts = await Checkout.find(filter)
    .populate({
      path: 'booking',
      populate: [
        { path: 'student', select: 'name email mobile' },
        { path: 'owner', select: 'name' }
      ]
    })
    .populate('hostel', 'name')
    .populate('room', 'roomNumber')
    .populate('bed', 'bedNumber')
    .sort({ createdAt: -1 });

  // Filter checkouts where the booking owner matches the current user
  const filteredCheckouts = checkouts.filter(checkout => 
    checkout.booking && 
    checkout.booking.owner && 
    checkout.booking.owner._id.toString() === req.user.id
  );
  
  res.status(200).json(new ApiResponse(200, filteredCheckouts, 'Checkout requests fetched successfully'));
});

const rejectCheckout = asyncHandler(async (req, res) => {
  const { checkoutId } = req.params;
  const { reason } = req.body;

  const checkout = await Checkout.findById(checkoutId)
    .populate('booking')
    .populate('student', 'name email');

  if (!checkout || checkout.booking.owner.toString() !== req.user.id) {
    return res.status(404).json(new ApiResponse(404, null, 'Checkout request not found'));
  }

  if (checkout.status !== 'pending') {
    return res.status(400).json(new ApiResponse(400, null, 'Checkout already processed'));
  }

  checkout.status = 'cancelled';
  checkout.rejectedBy = req.user.id;
  checkout.rejectedAt = new Date();
  checkout.rejectionReason = reason;
  await checkout.save();

  await notificationService.sendNotification({
    recipient: checkout.student._id,
    type: 'checkout_rejected',
    title: 'Checkout Request Rejected',
    message: `Your checkout request has been rejected. Reason: ${reason}`,
    data: { checkoutId: checkout._id, reason }
  });

  res.status(200).json(new ApiResponse(200, checkout, 'Checkout rejected successfully'));
});

const approveCheckout = asyncHandler(async (req, res) => {
  const { checkoutId } = req.params;

  const checkout = await Checkout.findById(checkoutId)
    .populate('booking')
    .populate('student', 'name email');

  if (!checkout || checkout.booking.owner.toString() !== req.user.id) {
    return res.status(404).json(new ApiResponse(404, null, 'Checkout request not found'));
  }

  if (checkout.status !== 'pending') {
    return res.status(400).json(new ApiResponse(400, null, 'Checkout already processed'));
  }

  checkout.status = 'approved';
  checkout.approvedBy = req.user.id;
  checkout.approvedAt = new Date();
  await checkout.save();

  await notificationService.sendNotification({
    recipient: checkout.student._id,
    type: 'checkout_approved',
    title: 'Checkout Approved',
    message: 'Your checkout request has been approved. Please complete the inspection process.',
    data: { checkoutId: checkout._id }
  });

  res.status(200).json(new ApiResponse(200, checkout, 'Checkout approved successfully'));
});

const conductDamageAssessment = asyncHandler(async (req, res) => {
  const { checkoutId } = req.params;
  const { damages, notes } = req.body;

  const checkout = await Checkout.findById(checkoutId).populate('booking');

  if (!checkout || checkout.booking.owner.toString() !== req.user.id) {
    return res.status(404).json(new ApiResponse(404, null, 'Checkout request not found'));
  }

  if (checkout.status !== 'approved') {
    return res.status(400).json(new ApiResponse(400, null, 'Checkout must be approved first'));
  }

  const totalDamageCost = damages.reduce((sum, damage) => sum + (damage.cost || 0), 0);

  checkout.damageAssessment = {
    inspectedBy: req.user.id,
    inspectionDate: new Date(),
    damages: damages || [],
    totalDamageCost,
    notes
  };

  // Calculate final bill
  const rentDue = await calculateRentDue(checkout.booking._id, checkout.checkoutDate);
  const utilitiesDue = await calculateUtilitiesDue(checkout.booking._id, checkout.checkoutDate);
  
  checkout.finalBill = {
    rentDue,
    utilitiesDue,
    damageCost: totalDamageCost,
    lateFees: 0,
    otherCharges: 0,
    totalDue: rentDue + utilitiesDue + totalDamageCost,
    securityRefund: Math.max(0, checkout.securityDeposit.amount - totalDamageCost),
    netAmount: (rentDue + utilitiesDue + totalDamageCost) - Math.max(0, checkout.securityDeposit.amount - totalDamageCost)
  };

  await checkout.save();

  res.status(200).json(new ApiResponse(200, checkout, 'Damage assessment completed successfully'));
});

const completeCheckout = asyncHandler(async (req, res) => {
  const { checkoutId } = req.params;

  const checkout = await Checkout.findById(checkoutId)
    .populate('booking')
    .populate('bed');

  if (!checkout || checkout.booking.owner.toString() !== req.user.id) {
    return res.status(404).json(new ApiResponse(404, null, 'Checkout request not found'));
  }

  if (checkout.status !== 'approved') {
    return res.status(400).json(new ApiResponse(400, null, 'Checkout must be approved and assessed first'));
  }

  // Mark bed as available
  await Bed.findByIdAndUpdate(checkout.bed._id, {
    isOccupied: false,
    occupiedBy: null,
    occupiedFrom: null,
    occupiedTill: checkout.checkoutDate
  });

  // Update booking status
  await Booking.findByIdAndUpdate(checkout.booking._id, {
    status: 'completed',
    actualCheckOut: checkout.checkoutDate
  });

  checkout.status = 'completed';
  checkout.completedAt = new Date();
  await checkout.save();

  await notificationService.sendNotification({
    recipient: checkout.student,
    type: 'checkout_completed',
    title: 'Checkout Completed',
    message: 'Your checkout process has been completed successfully.',
    data: { checkoutId: checkout._id }
  });

  res.status(200).json(new ApiResponse(200, checkout, 'Checkout completed successfully'));
});

const calculateRentDue = async (bookingId, checkoutDate) => {
  // Calculate any pending rent based on checkout date
  const payments = await Payment.find({
    booking: bookingId,
    paymentType: 'monthly',
    status: 'pending'
  });
  
  return payments.reduce((sum, payment) => sum + payment.amount, 0);
};

const calculateUtilitiesDue = async (bookingId, checkoutDate) => {
  // Calculate utilities based on usage (simplified)
  return 0; // Implement based on your utility calculation logic
};

module.exports = {
  requestCheckout,
  getStudentCheckouts,
  getOwnerCheckouts,
  approveCheckout,
  rejectCheckout,
  conductDamageAssessment,
  completeCheckout
};