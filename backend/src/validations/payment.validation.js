const Joi = require('joi');
const ApiResponse = require('../utils/apiResponse');

const validatePayment = (req, res, next) => {
  const schema = Joi.object({
    bookingId: Joi.string(),
    invoiceId: Joi.string(),
    paymentId: Joi.string().allow(null).optional(), // For monthly payments - update existing payment
    amount: Joi.number().positive().required(),
    paymentType: Joi.string().valid('advance', 'monthly', 'security_deposit', 'maintenance', 'late_fee', 'other').required(),
    paymentMethod: Joi.string().valid('razorpay', 'stripe', 'phonepe', 'upi', 'googlepay', 'fake_card').optional(),
    // UPI specific fields
    upiId: Joi.string().optional(),
    // Fake card specific fields
    cardNumber: Joi.string().optional(),
    expiry: Joi.string().optional(),
    cvv: Joi.string().optional()
  }).xor('bookingId', 'invoiceId'); // Either bookingId or invoiceId should be present, not both

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json(new ApiResponse(400, null, error.details[0].message));
  }

  next();
};

const validatePaymentVerification = (req, res, next) => {
  const schema = Joi.object({
    razorpayOrderId: Joi.string().required(),
    razorpayPaymentId: Joi.string().required(),
    razorpaySignature: Joi.string().required(),
    paymentId: Joi.string().required()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json(new ApiResponse(400, null, error.details[0].message));
  }

  next();
};

const validateInvoiceGeneration = (req, res, next) => {
  const schema = Joi.object({
    hostelId: Joi.string().required(),
    month: Joi.string().pattern(/^(0[1-9]|1[0-2])$/).required(), // MM format
    year: Joi.number().integer().min(2020).max(2030).required()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json(new ApiResponse(400, null, error.details[0].message));
  }

  next();
};

const validateRefund = (req, res, next) => {
  const schema = Joi.object({
    refundAmount: Joi.number().positive().required(),
    reason: Joi.string().min(5).max(500).required()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json(new ApiResponse(400, null, error.details[0].message));
  }

  next();
};

module.exports = {
  validatePayment,
  validatePaymentVerification,
  validateInvoiceGeneration,
  validateRefund
};