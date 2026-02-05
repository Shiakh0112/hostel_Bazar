const PaymentPlan = require('../models/PaymentPlan.model');
const Booking = require('../models/Booking.model');
const Payment = require('../models/Payment.model');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/apiResponse');
const moment = require('moment');

const createPaymentPlan = asyncHandler(async (req, res) => {
  const { bookingId, planType, totalAmount, numberOfInstallments, startDate, interestRate, processingFee } = req.body;

  const booking = await Booking.findOne({
    _id: bookingId,
    student: req.user.id
  }).populate('hostel', 'pricing');

  if (!booking) {
    return res.status(404).json(new ApiResponse(404, null, 'Booking not found'));
  }

  // Calculate installment amount
  const baseAmount = totalAmount / numberOfInstallments;
  const installmentAmount = Math.ceil(baseAmount + (baseAmount * (interestRate || 0) / 100));

  // Generate installments
  const installments = [];
  let currentDate = moment(startDate);

  for (let i = 1; i <= numberOfInstallments; i++) {
    installments.push({
      installmentNumber: i,
      amount: i === numberOfInstallments ? 
        totalAmount - (installmentAmount * (numberOfInstallments - 1)) : // Last installment adjusts for rounding
        installmentAmount,
      dueDate: currentDate.toDate()
    });

    // Calculate next due date based on plan type
    switch (planType) {
      case 'monthly':
        currentDate.add(1, 'month');
        break;
      case 'quarterly':
        currentDate.add(3, 'months');
        break;
      case 'semester':
        currentDate.add(6, 'months');
        break;
      default:
        currentDate.add(1, 'month');
    }
  }

  const paymentPlan = await PaymentPlan.create({
    student: req.user.id,
    booking: bookingId,
    hostel: booking.hostel._id,
    planType,
    totalAmount,
    installments,
    startDate: new Date(startDate),
    endDate: currentDate.toDate(),
    interestRate: interestRate || 0,
    processingFee: processingFee || 0
  });

  res.status(201).json(new ApiResponse(201, paymentPlan, 'Payment plan created successfully'));
});

const getStudentPaymentPlans = asyncHandler(async (req, res) => {
  const plans = await PaymentPlan.find({ student: req.user.id })
    .populate('hostel', 'name')
    .populate('booking', 'bookingDetails')
    .sort({ createdAt: -1 });

  res.status(200).json(new ApiResponse(200, plans, 'Payment plans fetched successfully'));
});

const getOwnerPaymentPlans = asyncHandler(async (req, res) => {
  const plans = await PaymentPlan.find()
    .populate({
      path: 'booking',
      match: { owner: req.user.id },
      populate: { path: 'student', select: 'name email mobile' }
    })
    .populate('hostel', 'name')
    .sort({ createdAt: -1 });

  const filteredPlans = plans.filter(plan => plan.booking);

  res.status(200).json(new ApiResponse(200, filteredPlans, 'Payment plans fetched successfully'));
});

const approvePaymentPlan = asyncHandler(async (req, res) => {
  const { planId } = req.params;

  const plan = await PaymentPlan.findById(planId).populate('booking');

  if (!plan || plan.booking.owner.toString() !== req.user.id) {
    return res.status(404).json(new ApiResponse(404, null, 'Payment plan not found'));
  }

  plan.approvedBy = req.user.id;
  plan.approvedAt = new Date();
  await plan.save();

  res.status(200).json(new ApiResponse(200, plan, 'Payment plan approved successfully'));
});

const payInstallment = asyncHandler(async (req, res) => {
  const { planId, installmentNumber } = req.params;
  const { paymentMethod, paymentId } = req.body;

  const plan = await PaymentPlan.findOne({
    _id: planId,
    student: req.user.id
  });

  if (!plan) {
    return res.status(404).json(new ApiResponse(404, null, 'Payment plan not found'));
  }

  const installment = plan.installments.find(inst => inst.installmentNumber === parseInt(installmentNumber));

  if (!installment) {
    return res.status(404).json(new ApiResponse(404, null, 'Installment not found'));
  }

  if (installment.status === 'paid') {
    return res.status(400).json(new ApiResponse(400, null, 'Installment already paid'));
  }

  // Calculate late fee if overdue
  let lateFee = 0;
  if (moment().isAfter(moment(installment.dueDate))) {
    const daysLate = moment().diff(moment(installment.dueDate), 'days');
    lateFee = Math.min(daysLate * 10, installment.amount * 0.1); // 10 per day, max 10% of amount
  }

  // Create payment record
  const payment = await Payment.create({
    student: req.user.id,
    hostel: plan.hostel,
    booking: plan.booking,
    amount: installment.amount + lateFee,
    paymentType: 'installment',
    paymentMethod,
    status: 'completed',
    paidAt: new Date(),
    paymentId,
    metadata: {
      paymentPlanId: planId,
      installmentNumber,
      lateFee
    }
  });

  // Update installment
  installment.status = 'paid';
  installment.paidAt = new Date();
  installment.paymentId = payment._id;
  installment.lateFee = lateFee;

  // Check if all installments are paid
  const allPaid = plan.installments.every(inst => inst.status === 'paid');
  if (allPaid) {
    plan.status = 'completed';
  }

  await plan.save();

  res.status(200).json(new ApiResponse(200, { plan, payment }, 'Installment paid successfully'));
});

const getPaymentPlanDetails = asyncHandler(async (req, res) => {
  const { planId } = req.params;

  const plan = await PaymentPlan.findById(planId)
    .populate('student', 'name email mobile')
    .populate('hostel', 'name')
    .populate('booking', 'bookingDetails');

  if (!plan) {
    return res.status(404).json(new ApiResponse(404, null, 'Payment plan not found'));
  }

  // Check access rights
  if (plan.student._id.toString() !== req.user.id && 
      plan.booking.owner.toString() !== req.user.id) {
    return res.status(403).json(new ApiResponse(403, null, 'Access denied'));
  }

  // Calculate summary
  const totalPaid = plan.installments
    .filter(inst => inst.status === 'paid')
    .reduce((sum, inst) => sum + inst.amount + inst.lateFee, 0);

  const totalPending = plan.installments
    .filter(inst => inst.status === 'pending')
    .reduce((sum, inst) => sum + inst.amount, 0);

  const overdue = plan.installments.filter(inst => 
    inst.status === 'pending' && moment().isAfter(moment(inst.dueDate))
  );

  const summary = {
    totalAmount: plan.totalAmount,
    totalPaid,
    totalPending,
    overdueCount: overdue.length,
    nextDueDate: plan.installments.find(inst => inst.status === 'pending')?.dueDate,
    completionPercentage: Math.round((totalPaid / plan.totalAmount) * 100)
  };

  res.status(200).json(new ApiResponse(200, { plan, summary }, 'Payment plan details fetched successfully'));
});

module.exports = {
  createPaymentPlan,
  getStudentPaymentPlans,
  getOwnerPaymentPlans,
  approvePaymentPlan,
  payInstallment,
  getPaymentPlanDetails
};