const Joi = require('joi');
const ApiResponse = require('../utils/apiResponse');

const validateSignup = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().min(2).max(50).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    mobile: Joi.string().pattern(/^[0-9]{10}$/).required(),
    role: Joi.string().valid('student', 'owner').required()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json(new ApiResponse(400, null, error.details[0].message));
  }

  next();
};

const validateLogin = (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json(new ApiResponse(400, null, error.details[0].message));
  }

  next();
};

const validateOTP = (req, res, next) => {
  const schema = Joi.object({
    userId: Joi.string().required(),
    otp: Joi.string().length(6).required()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json(new ApiResponse(400, null, error.details[0].message));
  }

  next();
};

const validateForgotPassword = (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string().email().required()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json(new ApiResponse(400, null, error.details[0].message));
  }

  next();
};

const validateResetPassword = (req, res, next) => {
  const schema = Joi.object({
    userId: Joi.string().required(),
    otp: Joi.string().length(6).required(),
    newPassword: Joi.string().min(6).required()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json(new ApiResponse(400, null, error.details[0].message));
  }

  next();
};

module.exports = {
  validateSignup,
  validateLogin,
  validateOTP,
  validateForgotPassword,
  validateResetPassword
};