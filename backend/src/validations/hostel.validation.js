const Joi = require('joi');
const ApiResponse = require('../utils/apiResponse');

const validateHostel = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().min(3).max(100).required(),
    description: Joi.string().min(10).max(1000).required(),
    address: Joi.object({
      street: Joi.string().required(),
      city: Joi.string().required(),
      state: Joi.string().required(),
      pincode: Joi.string().pattern(/^[0-9]{6}$/).required(),
      area: Joi.string().required()
    }).required(),
    hostelType: Joi.string().valid('boys', 'girls', 'co-ed').required(),
    structure: Joi.object({
      totalFloors: Joi.number().integer().min(1).max(20).required(),
      roomsPerFloor: Joi.number().integer().min(1).max(50).required(),
      bedsPerRoom: Joi.number().integer().min(1).max(10).required(),
      roomType: Joi.string().valid('single', 'double', 'triple', 'dormitory').required(),
      attachedBathroom: Joi.boolean().default(false)
    }).required(),
    amenities: Joi.array().items(Joi.string()).default([]),
    rules: Joi.array().items(Joi.string()).default([]),
    pricing: Joi.object({
      monthlyRent: Joi.number().positive().required(),
      securityDeposit: Joi.number().positive().required(),
      maintenanceCharges: Joi.number().min(0).default(0),
      electricityCharges: Joi.number().min(0).default(0),
      advancePayment: Joi.number().positive().required()
    }).required(),
    contact: Joi.object({
      phone: Joi.string().pattern(/^[0-9]{10}$/),
      email: Joi.string().email(),
      whatsapp: Joi.string().pattern(/^[0-9]{10}$/)
    }),
    location: Joi.object({
      coordinates: Joi.array().items(Joi.number()).length(2).default([0, 0])
    })
  }).unknown(true); // Allow unknown fields for image types

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json(new ApiResponse(400, null, error.details[0].message));
  }

  next();
};

const validateHostelUpdate = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().min(3).max(100),
    description: Joi.string().min(10).max(1000),
    address: Joi.object({
      street: Joi.string(),
      city: Joi.string(),
      state: Joi.string(),
      pincode: Joi.string().pattern(/^[0-9]{6}$/),
      area: Joi.string()
    }),
    hostelType: Joi.string().valid('boys', 'girls', 'co-ed'),
    amenities: Joi.array().items(Joi.string()),
    rules: Joi.array().items(Joi.string()),
    pricing: Joi.object({
      monthlyRent: Joi.number().positive(),
      securityDeposit: Joi.number().positive(),
      maintenanceCharges: Joi.number().min(0),
      electricityCharges: Joi.number().min(0),
      advancePayment: Joi.number().positive()
    }),
    contact: Joi.object({
      phone: Joi.string().pattern(/^[0-9]{10}$/),
      email: Joi.string().email(),
      whatsapp: Joi.string().pattern(/^[0-9]{10}$/)
    }),
    location: Joi.object({
      coordinates: Joi.array().items(Joi.number()).length(2)
    }),
    isActive: Joi.boolean()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json(new ApiResponse(400, null, error.details[0].message));
  }

  next();
};

module.exports = {
  validateHostel,
  validateHostelUpdate
};