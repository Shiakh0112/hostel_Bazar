const Payment = require('../models/Payment.model');
const Booking = require('../models/Booking.model');
const Hostel = require('../models/Hostel.model');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/apiResponse');
const moment = require('moment');
const LateFeeService = require('../services/lateFee.service');

// Generate monthly rent payments for a student
const generateMonthlyRents = asyncHandler(async (req, res) => {
  const studentId = req.user.id;

  const booking = await Booking.findOne({
    student: studentId,
    status: 'confirmed',
    'advancePayment.status': 'paid',
    allocatedRoom: { $exists: true }
  }).populate('hostel');

  if (!booking) {
    return res.status(404).json(new ApiResponse(404, null, 'No active booking found'));
  }

  // Delete ALL existing monthly payments for this student to start fresh
  await Payment.deleteMany({
    student: studentId,
    booking: booking._id,
    paymentType: 'monthly'
  });

  const checkInDate = moment(booking.actualCheckIn || booking.bookingDetails.checkInDate);
  const checkOutDate = moment(booking.bookingDetails.expectedCheckOutDate);
  const monthlyRent = booking.hostel.pricing.monthlyRent;
  const electricityCharges = booking.hostel.pricing.electricityCharges || 0;
  // Don't add maintenance charges by default - they will be added dynamically when maintenance is completed
  const baseMonthlyAmount = monthlyRent + electricityCharges;
  const rentDay = checkInDate.date();

  const payments = [];
  let currentDate = checkInDate.clone();

  // Generate payment for check-in month
  payments.push(await Payment.create({
    student: studentId,
    hostel: booking.hostel._id,
    booking: booking._id,
    paymentType: 'monthly',
    amount: baseMonthlyAmount,
    baseRent: monthlyRent,
    electricityCharges: electricityCharges,
    maintenanceCharges: 0, // Will be updated when maintenance is completed
    month: currentDate.format('MMMM'),
    year: currentDate.year(),
    dueDate: currentDate.toDate(),
    status: 'pending',
    description: `Monthly rent for ${currentDate.format('MMMM YYYY')}`
  }));

  // Generate payments for subsequent months
  currentDate.add(1, 'month');
  
  while (currentDate.isSameOrBefore(checkOutDate, 'month')) {
    let dueDate = currentDate.clone().date(rentDay);
    
    // Handle months with fewer days
    if (dueDate.month() !== currentDate.month()) {
      dueDate = currentDate.clone().endOf('month');
    }
    
    // Stop if due date exceeds checkout
    if (dueDate.isAfter(checkOutDate, 'day')) {
      break;
    }

    payments.push(await Payment.create({
      student: studentId,
      hostel: booking.hostel._id,
      booking: booking._id,
      paymentType: 'monthly',
      amount: baseMonthlyAmount,
      baseRent: monthlyRent,
      electricityCharges: electricityCharges,
      maintenanceCharges: 0, // Will be updated when maintenance is completed
      month: dueDate.format('MMMM'),
      year: dueDate.year(),
      dueDate: dueDate.toDate(),
      status: 'pending',
      description: `Monthly rent for ${dueDate.format('MMMM YYYY')}`
    }));

    currentDate.add(1, 'month');
  }

  res.status(200).json(new ApiResponse(200, payments, `${payments.length} monthly rents generated successfully`));
});

// Get student's monthly payments
const getStudentMonthlyPayments = asyncHandler(async (req, res) => {
  const studentId = req.user.id;

  const payments = await Payment.find({
    student: studentId,
    paymentType: 'monthly'
  })
    .populate('hostel', 'name')
    .sort({ dueDate: 1 });

  // Calculate overdue payments with late fees
  const now = new Date();
  const paymentsWithStatus = payments.map(payment => {
    const isDueDatePassed = new Date(payment.dueDate) < now;
    const isOverdue = payment.status === 'pending' && isDueDatePassed;
    
    return {
      ...payment.toObject(),
      isOverdue,
      daysOverdue: isOverdue
        ? Math.floor((now - new Date(payment.dueDate)) / (1000 * 60 * 60 * 24))
        : 0
    };
  });

  // Apply late fees for overdue payments
  await LateFeeService.applyLateFees();

  res.status(200).json(new ApiResponse(200, paymentsWithStatus, 'Monthly payments fetched successfully'));
});

// Get staff view of monthly payments
const getStaffMonthlyPayments = asyncHandler(async (req, res) => {
  const staff = await require('../models/User.model').findById(req.user.id);
  
  if (!staff.hostel) {
    return res.status(400).json(new ApiResponse(400, null, 'Staff not assigned to any hostel'));
  }

  const payments = await Payment.find({
    hostel: staff.hostel,
    paymentType: 'monthly'
  })
    .populate('student', 'name email mobile')
    .populate('hostel', 'name')
    .populate('booking', 'allocatedRoom allocatedBed')
    .sort({ dueDate: 1 });

  const now = new Date();
  const paymentsWithStatus = payments.map(payment => {
    const isDueDatePassed = new Date(payment.dueDate) < now;
    const isOverdue = payment.status === 'pending' && isDueDatePassed;
    
    return {
      ...payment.toObject(),
      isOverdue,
      daysOverdue: isOverdue
        ? Math.floor((now - new Date(payment.dueDate)) / (1000 * 60 * 60 * 24))
        : 0
    };
  });

  res.status(200).json(new ApiResponse(200, paymentsWithStatus, 'Monthly payments fetched successfully'));
});

// Get owner view of monthly payments
const getOwnerMonthlyPayments = asyncHandler(async (req, res) => {
  const { hostelId, status, month, year } = req.query;

  const hostels = await Hostel.find({ owner: req.user.id }).select('_id');
  const hostelIds = hostels.map(h => h._id);

  // Base filter for ALL payments (for summary)
  const baseFilter = {
    hostel: { $in: hostelIds },
    paymentType: 'monthly'
  };

  // Filter for displayed payments
  const displayFilter = { ...baseFilter };
  if (hostelId) displayFilter.hostel = hostelId;
  if (status) displayFilter.status = status;
  if (month) displayFilter.month = month;
  if (year) displayFilter.year = parseInt(year);

  // Fetch ALL payments for summary calculation
  const allPayments = await Payment.find(baseFilter);

  // Fetch filtered payments for display
  const payments = await Payment.find(displayFilter)
    .populate('student', 'name email mobile')
    .populate('hostel', 'name')
    .populate('booking', 'allocatedRoom allocatedBed')
    .sort({ dueDate: 1 });

  const now = new Date();
  const paymentsWithStatus = payments.map(payment => {
    const isDueDatePassed = new Date(payment.dueDate) < now;
    const isOverdue = payment.status === 'pending' && isDueDatePassed;
    
    return {
      ...payment.toObject(),
      isOverdue,
      daysOverdue: isOverdue
        ? Math.floor((now - new Date(payment.dueDate)) / (1000 * 60 * 60 * 24))
        : 0
    };
  });

  // Calculate summary from ALL payments (not filtered)
  const allPaymentsWithOverdue = allPayments.map(payment => {
    const isDueDatePassed = new Date(payment.dueDate) < now;
    const isOverdue = payment.status === 'pending' && isDueDatePassed;
    return { ...payment.toObject(), isOverdue };
  });

  const totalAmount = allPayments.reduce((sum, p) => sum + p.amount, 0);
  const collectedAmount = allPayments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0);
  const pendingAmount = totalAmount - collectedAmount;

  const summary = {
    total: allPayments.length,
    pending: allPayments.filter(p => p.status === 'pending').length,
    completed: allPayments.filter(p => p.status === 'completed').length,
    overdue: allPaymentsWithOverdue.filter(p => p.isOverdue).length,
    totalAmount,
    collectedAmount,
    pendingAmount
  };

  res.status(200).json(new ApiResponse(200, {
    payments: paymentsWithStatus,
    summary
  }, 'Monthly payments fetched successfully'));
});

const calculateMonthlyCharges = asyncHandler(async (req, res) => {
  const { bookingId, month, year } = req.body;

  try {
    const booking = await Booking.findById(bookingId)
      .populate('hostel', 'pricing')
      .populate('student', '_id');

    if (!booking || booking.student._id.toString() !== req.user.id) {
      return res.status(404).json(new ApiResponse(404, null, 'Booking not found'));
    }

    const hostel = booking.hostel;
    let electricityCharges = hostel.pricing.electricityCharges || 0;
    let maintenanceCharges = 0;
    let maintenanceRequestsCount = 0;

    // Calculate maintenance charges for the specified month/year
    if (month && year) {
      const Maintenance = require('../models/Maintenance.model');
      
      // Get start and end dates for the month
      const startDate = new Date(year, month - 1, 1); // month is 0-indexed
      const endDate = new Date(year, month, 0, 23, 59, 59); // Last day of month
      
      // Find completed maintenance requests for this student in the specified month
      const maintenanceRequests = await Maintenance.find({
        student: req.user.id,
        status: 'completed',
        completedAt: {
          $gte: startDate,
          $lte: endDate
        },
        actualCost: { $gt: 0 }
      });
      
      maintenanceCharges = maintenanceRequests.reduce((total, request) => {
        return total + (request.actualCost || 0);
      }, 0);
      
      maintenanceRequestsCount = maintenanceRequests.length;
    }
    
    const charges = {
      electricityCharges,
      maintenanceCharges,
      maintenanceRequestsCount
    };

    res.status(200).json(new ApiResponse(200, charges, 'Monthly charges calculated successfully'));
  } catch (error) {
    console.error('Calculate charges error:', error);
    res.status(500).json(new ApiResponse(500, null, 'Failed to calculate charges'));
  }
});

// Update payment with maintenance charges when maintenance is completed
const updatePaymentWithMaintenance = asyncHandler(async (req, res) => {
  const { paymentId, maintenanceCharges } = req.body;

  try {
    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json(new ApiResponse(404, null, 'Payment not found'));
    }

    // Update maintenance charges and total amount
    payment.maintenanceCharges = maintenanceCharges;
    payment.amount = payment.baseRent + payment.electricityCharges + maintenanceCharges;
    await payment.save();

    res.status(200).json(new ApiResponse(200, payment, 'Payment updated with maintenance charges'));
  } catch (error) {
    console.error('Update payment error:', error);
    res.status(500).json(new ApiResponse(500, null, 'Failed to update payment'));
  }
});

module.exports = {
  generateMonthlyRents,
  getStudentMonthlyPayments,
  getStaffMonthlyPayments,
  getOwnerMonthlyPayments,
  calculateMonthlyCharges,
  updatePaymentWithMaintenance
};
