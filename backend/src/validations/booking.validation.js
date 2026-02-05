const Joi = require('joi');
const ApiResponse = require('../utils/apiResponse');

const validateBooking = (req, res, next) => {
  const schema = Joi.object({
    hostelId: Joi.string().required(),
    bookingDetails: Joi.object({
      fullName: Joi.string().min(2).max(50).required(),
      mobile: Joi.string().pattern(/^[0-9]{10}$/).required(),
      email: Joi.string().email().required(),
      idProof: Joi.string().required(),
      preferredRoomType: Joi.string().valid('single', 'double', 'triple', 'dormitory').required(),
      checkInDate: Joi.date().min('now').required(),
      expectedCheckOutDate: Joi.date().greater(Joi.ref('checkInDate')).required(),
      numberOfPersons: Joi.number().integer().min(1).max(4).default(1),
      notes: Joi.string().max(500).allow('')
    }).required()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json(new ApiResponse(400, null, error.details[0].message));
  }

  next();
};

const validateBookingApproval = (req, res, next) => {
  const schema = Joi.object({
    notes: Joi.string().max(500).allow('')
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json(new ApiResponse(400, null, error.details[0].message));
  }

  next();
};

const validateBookingRejection = (req, res, next) => {
  const schema = Joi.object({
    reason: Joi.string().min(5).max(500).required()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json(new ApiResponse(400, null, error.details[0].message));
  }

  next();
};

module.exports = {
  validateBooking,
  validateBookingApproval,
  validateBookingRejection
};