const Invoice = require('../models/Invoice.model');
const Payment = require('../models/Payment.model');
const Booking = require('../models/Booking.model');
const Hostel = require('../models/Hostel.model');
const User = require('../models/User.model');
const razorpay = require('../config/razorpay');
const crypto = require('crypto');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/apiResponse');
const billingService = require('../services/billing.service');
const notificationService = require('../services/notification.service');
const PDFService = require('../services/pdf.service');

// Load Stripe conditionally to prevent crashes
let stripe = null;
try {
  stripe = require('../config/stripe');
} catch (error) {
  console.warn('Stripe not configured. Stripe payments will not be available.');
}

const createPaymentOrder = asyncHandler(async (req, res) => {
  const { bookingId, amount, paymentType, paymentMethod = 'razorpay', paymentId } = req.body;
  
  console.log('🔥 CREATE ORDER DEBUG - Received data:', {
    bookingId,
    amount,
    paymentType,
    paymentMethod,
    paymentId,
    fullBody: req.body
  });

  const booking = await Booking.findById(bookingId);
  if (!booking) {
    return res.status(404).json(new ApiResponse(404, null, 'Booking not found'));
  }

  if (booking.student.toString() !== req.user.id) {
    return res.status(403).json(new ApiResponse(403, null, 'Access denied'));
  }

  let orderData = {};

  switch (paymentMethod) {
    case 'razorpay':
      const razorpayOptions = {
        amount: amount * 100,
        currency: 'INR',
        receipt: `payment_${Date.now()}`,
        payment_capture: 1
      };
      const razorpayOrder = await razorpay.orders.create(razorpayOptions);
      orderData = {
        orderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        paymentMethod: 'razorpay'
      };
      break;

    case 'stripe':
      if (!stripe) {
        return res.status(400).json(new ApiResponse(400, null, 'Stripe is not configured. Please use another payment method.'));
      }
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount * 100,
        currency: 'inr',
        metadata: { bookingId, paymentType }
      });
      orderData = {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amount: amount * 100,
        currency: 'inr',
        paymentMethod: 'stripe'
      };
      break;

    case 'phonepe':
    case 'upi':
    case 'googlepay':
      orderData = {
        orderId: `${paymentMethod}_${Date.now()}`,
        amount: amount,
        currency: 'INR',
        paymentMethod,
        upiId: paymentMethod === 'upi' ? req.body.upiId : null
      };
      break;

    case 'fake_card':
      orderData = {
        orderId: `fake_${Date.now()}`,
        amount: amount,
        currency: 'INR',
        paymentMethod: 'fake_card'
      };
      break;

    default:
      return res.status(400).json(new ApiResponse(400, null, 'Invalid payment method'));
  }

  let payment;

  // If paymentId exists (monthly payment), update existing payment instead of creating new
  if (paymentId) {
    payment = await Payment.findById(paymentId);
    
    if (!payment) {
      return res.status(404).json(new ApiResponse(404, null, 'Payment not found'));
    }
    
    // Update payment with new order details
    payment.paymentMethod = paymentMethod;
    if (paymentMethod === 'razorpay') payment.razorpayOrderId = orderData.orderId;
    if (paymentMethod === 'stripe') {
      payment.stripePaymentIntentId = orderData.paymentIntentId;
      payment.stripeClientSecret = orderData.clientSecret;
    }
    if (paymentMethod === 'phonepe') payment.phonepeOrderId = orderData.orderId;
    if (paymentMethod === 'upi') payment.upiTransactionId = orderData.orderId;
    if (paymentMethod === 'googlepay') payment.googlepayTransactionId = orderData.orderId;
    
    await payment.save();
  } else {
    // Create new payment (for advance payment)
    payment = await Payment.create({
      student: req.user.id,
      hostel: booking.hostel,
      booking: bookingId,
      paymentType,
      amount,
      paymentMethod,
      razorpayOrderId: paymentMethod === 'razorpay' ? orderData.orderId : null,
      stripePaymentIntentId: paymentMethod === 'stripe' ? orderData.paymentIntentId : null,
      stripeClientSecret: paymentMethod === 'stripe' ? orderData.clientSecret : null,
      phonepeOrderId: paymentMethod === 'phonepe' ? orderData.orderId : null,
      upiTransactionId: paymentMethod === 'upi' ? orderData.orderId : null,
      googlepayTransactionId: paymentMethod === 'googlepay' ? orderData.orderId : null,
      status: 'pending'
    });
  }

  console.log('🔥 PAYMENT CREATED:', {
    paymentId: payment._id,
    paymentIdString: payment._id.toString(),
    paymentIdType: typeof payment._id
  });
  
  const responseData = {
    ...orderData,
    paymentId: payment._id.toString()
  };
  
  console.log('🔥 RESPONSE DATA:', responseData);
  
  res.status(201).json(new ApiResponse(201, responseData, 'Payment order created successfully'));
});

const verifyPayment = asyncHandler(async (req, res) => {
  const { paymentId, paymentMethod } = req.body;
  
  console.log('🔥 VERIFY PAYMENT DEBUG - Received data:', {
    paymentId,
    paymentMethod,
    fullBody: req.body
  });

  // Validate paymentId
  if (!paymentId || typeof paymentId !== 'string') {
    console.log('Invalid paymentId:', paymentId, typeof paymentId);
    return res.status(400).json(new ApiResponse(400, null, 'paymentId must be a valid string'));
  }

  const payment = await Payment.findById(paymentId);
  console.log('Found payment:', payment ? 'Yes' : 'No', payment?._id);
  
  if (!payment) {
    console.log('Payment not found for ID:', paymentId);
    return res.status(404).json(new ApiResponse(404, null, 'Payment not found'));
  }

  let isVerified = false;

  switch (paymentMethod) {
    case 'razorpay':
      const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
      const body = razorpayOrderId + '|' + razorpayPaymentId;
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest('hex');
      
      if (expectedSignature === razorpaySignature) {
        payment.razorpayPaymentId = razorpayPaymentId;
        payment.razorpaySignature = razorpaySignature;
        isVerified = true;
      }
      break;

    case 'stripe':
      if (!stripe) {
        console.log('Stripe not configured');
        return res.status(400).json(new ApiResponse(400, null, 'Stripe is not configured'));
      }
      const { stripePaymentIntentId } = req.body;
      console.log('Stripe verification - PaymentIntentId:', stripePaymentIntentId);
      
      try {
        const stripePaymentIntent = await stripe.paymentIntents.retrieve(stripePaymentIntentId);
        console.log('Stripe PaymentIntent status:', stripePaymentIntent.status);
        
        // For demo purposes, accept any valid PaymentIntent ID
        if (stripePaymentIntentId && stripePaymentIntentId.startsWith('pi_')) {
          payment.stripePaymentIntentId = stripePaymentIntentId;
          isVerified = true;
          console.log('Stripe payment verified (demo mode)');
        } else {
          console.log('Invalid Stripe PaymentIntent ID');
        }
      } catch (stripeError) {
        console.log('Stripe API error:', stripeError.message);
        // For demo, still allow verification if PaymentIntent ID format is correct
        if (stripePaymentIntentId && stripePaymentIntentId.startsWith('pi_')) {
          payment.stripePaymentIntentId = stripePaymentIntentId;
          isVerified = true;
          console.log('Stripe payment verified (demo mode - API error bypassed)');
        } else {
          return res.status(400).json(new ApiResponse(400, null, 'Stripe verification failed: ' + stripeError.message));
        }
      }
      break;

    case 'phonepe':
      const { phonepeTransactionId } = req.body;
      payment.phonepeTransactionId = phonepeTransactionId;
      isVerified = true; // Simulate verification
      break;

    case 'upi':
      const { upiTransactionId, upiVpa } = req.body;
      payment.upiTransactionId = upiTransactionId;
      payment.upiVpa = upiVpa;
      isVerified = true; // Simulate verification
      break;

    case 'googlepay':
      const { googlepayTransactionId } = req.body;
      payment.googlepayTransactionId = googlepayTransactionId;
      isVerified = true; // Simulate verification
      break;

    case 'fake_card':
      const { fakeCardNumber, fakeCardExpiry, fakeCardCvv } = req.body;
      payment.fakeCardNumber = fakeCardNumber;
      payment.fakeCardExpiry = fakeCardExpiry;
      payment.fakeCardCvv = fakeCardCvv;
      isVerified = true; // Always succeed for fake card
      break;

    default:
      return res.status(400).json(new ApiResponse(400, null, 'Invalid payment method'));
  }

  if (!isVerified) {
    payment.status = 'failed';
    await payment.save();
    return res.status(400).json(new ApiResponse(400, null, 'Payment verification failed'));
  }

  payment.status = 'completed';
  payment.paidAt = new Date();
  await payment.save();

  // Generate payment receipt
  try {
    const student = await User.findById(payment.student);
    const hostel = await Hostel.findById(payment.hostel);
    const receiptUrl = await PDFService.generatePaymentReceipt(payment, student, hostel);
    payment.receipt = receiptUrl;
    await payment.save();
  } catch (error) {
    console.error('Failed to generate receipt:', error);
  }

  // Fetch booking with owner details
  const booking = await Booking.findById(payment.booking).populate('owner hostel');
  
  // Update owner revenue for ALL payment types (advance + monthly)
  if (booking && booking.owner) {
    const User = require('../models/User.model');
    await User.findByIdAndUpdate(booking.owner._id, {
      $inc: { revenue: payment.amount }
    });
  }

  // Send notification for monthly payment
  if (payment.paymentType === 'monthly' && booking) {
    await notificationService.sendNotification({
      recipient: booking.owner._id,
      type: 'payment_success',
      title: 'Monthly Rent Received',
      message: `Monthly rent of ₹${payment.amount} received from ${booking.student?.name || 'student'} for ${payment.month} ${payment.year}`,
      data: { paymentId: payment._id, bookingId: booking._id }
    });

    await notificationService.sendNotification({
      recipient: booking.student,
      type: 'payment_success',
      title: 'Monthly Rent Payment Successful',
      message: `Your monthly rent payment of ₹${payment.amount} for ${payment.month} ${payment.year} has been completed successfully.`,
      data: { paymentId: payment._id }
    });
  }

  // Update booking if advance payment
  if (payment.paymentType === 'advance') {
    booking.advancePayment.status = 'paid';
    booking.advancePayment.paymentId = payment._id;
    booking.advancePayment.paidAt = new Date();
    booking.status = 'confirmed'; // Change status from approved to confirmed
    
    // 🔥 AUTOMATICALLY ALLOCATE BED AFTER ADVANCE PAYMENT
    console.log('🏠 Attempting to allocate bed after advance payment for booking:', booking._id);
    const allocationService = require('../services/allocation.service');
    
    let allocation = null;
    let allocationSuccess = false;
    
    try {
      allocation = await allocationService.allocateBed(
        booking.hostel, 
        booking.student,
        booking._id
      );
      
      if (allocation.success) {
        booking.allocatedRoom = allocation.room;
        booking.allocatedBed = allocation.bed;
        booking.actualCheckIn = new Date();
        allocationSuccess = true;
        console.log('✅ Bed allocated successfully:', {
          room: allocation.roomNumber,
          bed: allocation.bedNumber,
          floor: allocation.floorNumber
        });
        
        // Send notification to student about room allocation
        await notificationService.sendNotification({
          recipient: booking.student,
          type: 'room_allocated',
          title: 'Room Allocated',
          message: `Room ${allocation.roomNumber}, Bed ${allocation.bedNumber} has been allocated to you.`,
          data: { 
            bookingId: booking._id, 
            roomNumber: allocation.roomNumber,
            bedNumber: allocation.bedNumber
          }
        });
      } else {
        console.error('❌ Bed allocation failed:', {
          message: allocation.message,
          bookingId: booking._id,
          hostelId: booking.hostel
        });
        // Set flag to indicate manual allocation needed
        booking.needsManualAllocation = true;
      }
    } catch (error) {
      console.error('❌ Bed allocation error:', {
        error: error.message,
        stack: error.stack,
        bookingId: booking._id
      });
      booking.needsManualAllocation = true;
    }
    
    await booking.save();

    // 🔥 AUTOMATICALLY GENERATE MONTHLY PAYMENTS AFTER ADVANCE PAYMENT
    if (allocationSuccess) {
      console.log('🏠 Generating monthly payments for confirmed booking:', booking._id);
      try {
        const monthlyPaymentController = require('./monthlyPayment.controller');
        // Create a mock request object for generating monthly payments
        const mockReq = {
          user: { id: booking.student }
        };
        const mockRes = {
          status: () => ({ json: () => {} })
        };
        
        // Generate monthly payments
        await monthlyPaymentController.generateMonthlyRents(mockReq, mockRes);
        console.log('✅ Monthly payments generated successfully');
      } catch (error) {
        console.error('❌ Failed to generate monthly payments:', error.message);
      }
    }

    // Send notification to owner
    const ownerMessage = allocationSuccess 
      ? `Advance payment of ₹${payment.amount} received via ${paymentMethod}. Room ${allocation.roomNumber} allocated.`
      : `Advance payment of ₹${payment.amount} received via ${paymentMethod}. Please allocate room manually.`;
    
    await notificationService.sendNotification({
      recipient: booking.owner,
      type: 'payment_success',
      title: 'Payment Received',
      message: ownerMessage,
      data: { bookingId: booking._id, paymentId: payment._id }
    });
  }

  res.status(200).json(new ApiResponse(200, payment, 'Payment verified successfully'));
});

const getStudentPayments = asyncHandler(async (req, res) => {
  const { status, paymentType, page = 1, limit = 10 } = req.query;

  console.log('🔍 Getting student payments for user:', req.user.id);
  console.log('🔍 Query params:', { status, paymentType, page, limit });

  const filter = { student: req.user.id };
  if (status) filter.status = status;
  if (paymentType) filter.paymentType = paymentType;

  console.log('🔍 Filter:', filter);

  const skip = (page - 1) * limit;

  const payments = await Payment.find(filter)
    .populate('hostel', 'name')
    .populate('booking', 'bookingDetails.fullName')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  const total = await Payment.countDocuments(filter);

  console.log('🔍 Found payments:', payments.length);
  console.log('🔍 Total payments:', total);
  if (payments.length > 0) {
    console.log('🔍 Sample payments:', payments.slice(0, 3).map(p => ({
      id: p._id,
      amount: p.amount,
      status: p.status,
      paymentType: p.paymentType,
      razorpayPaymentId: p.razorpayPaymentId,
      stripePaymentIntentId: p.stripePaymentIntentId,
      paidAt: p.paidAt,
      createdAt: p.createdAt
    })));
  }

  res.status(200).json(new ApiResponse(200, {
    payments,
    pagination: {
      current: Number(page),
      total: Math.ceil(total / limit),
      count: payments.length,
      totalRecords: total
    }
  }, 'Student payments fetched successfully'));
});

const getOwnerPayments = asyncHandler(async (req, res) => {
  const { status, paymentType, hostelId, page = 1, limit = 10 } = req.query;

  // Get owner's hostels
  const hostels = await Hostel.find({ owner: req.user.id }).select('_id');
  const hostelIds = hostels.map(h => h._id);

  const filter = { hostel: { $in: hostelIds } };
  if (status) filter.status = status;
  if (paymentType) filter.paymentType = paymentType;
  if (hostelId) filter.hostel = hostelId;

  const skip = (page - 1) * limit;

  const payments = await Payment.find(filter)
    .populate('student', 'name email mobile')
    .populate('hostel', 'name')
    .populate('booking', 'bookingDetails.fullName')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  const total = await Payment.countDocuments(filter);

  res.status(200).json(new ApiResponse(200, {
    payments,
    pagination: {
      current: Number(page),
      total: Math.ceil(total / limit),
      count: payments.length,
      totalRecords: total
    }
  }, 'Owner payments fetched successfully'));
});

const generateMonthlyInvoices = asyncHandler(async (req, res) => {
  const { hostelId, month, year } = req.body;

  const hostel = await Hostel.findOne({ _id: hostelId, owner: req.user.id });
  if (!hostel) {
    return res.status(404).json(new ApiResponse(404, null, 'Hostel not found'));
  }

  const result = await billingService.generateMonthlyInvoices(hostelId, month, year);

  res.status(200).json(new ApiResponse(200, result, 'Monthly invoices generated successfully'));
});

const getInvoices = asyncHandler(async (req, res) => {
  const { status, month, year, page = 1, limit = 10 } = req.query;

  let filter = {};

  if (req.user.role === 'student') {
    filter.student = req.user.id;
  } else if (req.user.role === 'owner') {
    const hostels = await Hostel.find({ owner: req.user.id }).select('_id');
    filter.hostel = { $in: hostels.map(h => h._id) };
  }

  if (status) filter.status = status;
  if (month) filter.month = month;
  if (year) filter.year = Number(year);

  const skip = (page - 1) * limit;

  const invoices = await Invoice.find(filter)
    .populate('student', 'name email')
    .populate('hostel', 'name')
    .populate('booking', 'allocatedRoom allocatedBed')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  const total = await Invoice.countDocuments(filter);

  res.status(200).json(new ApiResponse(200, {
    invoices,
    pagination: {
      current: Number(page),
      total: Math.ceil(total / limit),
      count: invoices.length,
      totalRecords: total
    }
  }, 'Invoices fetched successfully'));
});

const payInvoice = asyncHandler(async (req, res) => {
  const { invoiceId } = req.params;

  const invoice = await Invoice.findById(invoiceId);
  if (!invoice) {
    return res.status(404).json(new ApiResponse(404, null, 'Invoice not found'));
  }

  if (invoice.student.toString() !== req.user.id) {
    return res.status(403).json(new ApiResponse(403, null, 'Access denied'));
  }

  if (invoice.status === 'paid') {
    return res.status(400).json(new ApiResponse(400, null, 'Invoice already paid'));
  }

  const options = {
    amount: invoice.totalAmount * 100,
    currency: 'INR',
    receipt: `invoice_${invoice.invoiceNumber}`,
    payment_capture: 1
  };

  const order = await razorpay.orders.create(options);

  res.status(200).json(new ApiResponse(200, {
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    invoiceId: invoice._id
  }, 'Payment order created for invoice'));
});

const getPaymentStats = asyncHandler(async (req, res) => {
  const { hostelId, startDate, endDate } = req.query;

  let matchFilter = {};

  if (req.user.role === 'owner') {
    const hostels = await Hostel.find({ owner: req.user.id }).select('_id');
    matchFilter.hostel = { $in: hostels.map(h => h._id) };
    
    if (hostelId) {
      matchFilter.hostel = hostelId;
    }
  } else if (req.user.role === 'student') {
    matchFilter.student = req.user.id;
  }

  if (startDate && endDate) {
    matchFilter.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }

  const stats = await Payment.aggregate([
    { $match: matchFilter },
    {
      $group: {
        _id: null,
        totalAmount: { $sum: '$amount' },
        totalPayments: { $sum: 1 },
        completedPayments: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
        },
        pendingPayments: {
          $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
        },
        completedAmount: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, '$amount', 0] }
        },
        pendingAmount: {
          $sum: { $cond: [{ $eq: ['$status', 'pending'] }, '$amount', 0] }
        }
      }
    }
  ]);

  const result = stats[0] || {
    totalAmount: 0,
    totalPayments: 0,
    completedPayments: 0,
    pendingPayments: 0,
    completedAmount: 0,
    pendingAmount: 0
  };

  res.status(200).json(new ApiResponse(200, result, 'Payment statistics fetched successfully'));
});

const sendPaymentReminder = asyncHandler(async (req, res) => {
  const { paymentId } = req.params;

  const payment = await Payment.findById(paymentId)
    .populate('student', 'name email mobile')
    .populate('hostel', 'name');

  if (!payment) {
    return res.status(404).json(new ApiResponse(404, null, 'Payment not found'));
  }

  // Send notification to student
  await notificationService.sendNotification({
    recipient: payment.student._id,
    type: 'payment_reminder',
    title: 'Payment Reminder',
    message: `Reminder: Your ${payment.paymentType} payment of ₹${payment.amount} for ${payment.hostel.name} is due.`,
    data: { paymentId: payment._id }
  });

  res.status(200).json(new ApiResponse(200, null, 'Payment reminder sent successfully'));
});

const markPaymentAsPaid = asyncHandler(async (req, res) => {
  const { paymentId } = req.params;

  const payment = await Payment.findById(paymentId)
    .populate('student', 'name')
    .populate('hostel', 'name');

  if (!payment) {
    return res.status(404).json(new ApiResponse(404, null, 'Payment not found'));
  }

  if (payment.status === 'completed') {
    return res.status(400).json(new ApiResponse(400, null, 'Payment already marked as paid'));
  }

  payment.status = 'completed';
  payment.paidAt = new Date();
  payment.paymentMethod = 'manual';
  await payment.save();

  // Send notification to student
  await notificationService.sendNotification({
    recipient: payment.student._id,
    type: 'payment_confirmed',
    title: 'Payment Confirmed',
    message: `Your ${payment.paymentType} payment of ₹${payment.amount} has been marked as paid by staff.`,
    data: { paymentId: payment._id }
  });

  res.status(200).json(new ApiResponse(200, payment, 'Payment marked as paid successfully'));
});

const fs = require('fs');
const path = require('path');
const downloadInvoicePDF = asyncHandler(async (req, res) => {
  const { invoiceId } = req.params;

  const invoice = await Invoice.findById(invoiceId)
    .populate('student', 'name email')
    .populate('hostel', 'name address');

  if (!invoice) {
    return res.status(404).json(new ApiResponse(404, null, 'Invoice not found'));
  }

  if (invoice.student._id.toString() !== req.user.id) {
    return res.status(403).json(new ApiResponse(403, null, 'Access denied'));
  }

  try {
    let pdfUrl = invoice.pdfUrl;
    
    // Generate PDF if not exists
    if (!pdfUrl) {
      pdfUrl = await PDFService.generateInvoicePDF(invoice, invoice.student, invoice.hostel);
      invoice.pdfUrl = pdfUrl;
      await invoice.save();
    }

    const filepath = path.join(process.cwd(), pdfUrl);
    
    if (!fs.existsSync(filepath)) {
      // Regenerate if file doesn't exist
      pdfUrl = await PDFService.generateInvoicePDF(invoice, invoice.student, invoice.hostel);
      invoice.pdfUrl = pdfUrl;
      await invoice.save();
    }

    res.download(path.join(process.cwd(), pdfUrl), `invoice-${invoice.invoiceNumber}.pdf`);
  } catch (error) {
    res.status(500).json(new ApiResponse(500, null, 'Failed to generate invoice PDF'));
  }
});

const downloadPaymentReceipt = asyncHandler(async (req, res) => {
  const { paymentId } = req.params;

  const payment = await Payment.findById(paymentId)
    .populate('student', 'name email')
    .populate('hostel', 'name address');

  if (!payment) {
    return res.status(404).json(new ApiResponse(404, null, 'Payment not found'));
  }

  if (payment.student._id.toString() !== req.user.id) {
    return res.status(403).json(new ApiResponse(403, null, 'Access denied'));
  }

  if (payment.status !== 'completed') {
    return res.status(400).json(new ApiResponse(400, null, 'Receipt only available for completed payments'));
  }

  try {
    let receiptUrl = payment.receipt;
    
    // Generate receipt if not exists
    if (!receiptUrl) {
      receiptUrl = await PDFService.generatePaymentReceipt(payment, payment.student, payment.hostel);
      payment.receipt = receiptUrl;
      await payment.save();
    }

    const filepath = path.join(process.cwd(), receiptUrl);
    
    if (!fs.existsSync(filepath)) {
      // Regenerate if file doesn't exist
      receiptUrl = await PDFService.generatePaymentReceipt(payment, payment.student, payment.hostel);
      payment.receipt = receiptUrl;
      await payment.save();
    }

    res.download(path.join(process.cwd(), receiptUrl), `receipt-${payment._id}.pdf`);
  } catch (error) {
    res.status(500).json(new ApiResponse(500, null, 'Failed to generate payment receipt'));
  }
});

const triggerMonthlyInvoiceGeneration = asyncHandler(async (req, res) => {
  const CronService = require('../services/cron.service');
  
  try {
    const result = await CronService.triggerMonthlyInvoiceGeneration();
    res.status(200).json(new ApiResponse(200, result, 'Monthly invoice generation triggered'));
  } catch (error) {
    res.status(500).json(new ApiResponse(500, null, 'Failed to trigger invoice generation'));
  }
});

const triggerLateFeeCalculation = asyncHandler(async (req, res) => {
  const CronService = require('../services/cron.service');
  
  try {
    const result = await CronService.triggerLateFeeCalculation();
    res.status(200).json(new ApiResponse(200, result, 'Late fee calculation triggered'));
  } catch (error) {
    res.status(500).json(new ApiResponse(500, null, 'Failed to trigger late fee calculation'));
  }
});

module.exports = {
  createPaymentOrder,
  verifyPayment,
  getStudentPayments,
  getOwnerPayments,
  generateMonthlyInvoices,
  getInvoices,
  payInvoice,
  getPaymentStats,
  sendPaymentReminder,
  markPaymentAsPaid,
  downloadInvoicePDF,
  downloadPaymentReceipt,
  triggerMonthlyInvoiceGeneration,
  triggerLateFeeCalculation
};