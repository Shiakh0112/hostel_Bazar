const Discount = require('../models/Discount.model');
const Hostel = require('../models/Hostel.model');
const Payment = require('../models/Payment.model');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/apiResponse');

const createDiscount = asyncHandler(async (req, res) => {
  const { hostelId, name, code, type, value, maxDiscount, minAmount, applicableOn, validTill, usageLimit, eligibleStudents, description, terms } = req.body;

  // Verify hostel ownership
  const hostel = await Hostel.findOne({ _id: hostelId, owner: req.user.id });
  if (!hostel) {
    return res.status(404).json(new ApiResponse(404, null, 'Hostel not found'));
  }

  const discount = await Discount.create({
    hostel: hostelId,
    owner: req.user.id,
    name,
    code: code?.toUpperCase(),
    type,
    value,
    maxDiscount,
    minAmount,
    applicableOn,
    validTill,
    usageLimit,
    eligibleStudents,
    description,
    terms
  });

  await discount.populate('hostel', 'name');

  res.status(201).json(new ApiResponse(201, discount, 'Discount created successfully'));
});

const getDiscounts = asyncHandler(async (req, res) => {
  const { hostelId, isActive, page = 1, limit = 10 } = req.query;

  let hostelFilter = { owner: req.user.id };
  if (hostelId) hostelFilter._id = hostelId;

  const hostels = await Hostel.find(hostelFilter).select('_id');
  const hostelIds = hostels.map(h => h._id);

  let filter = { hostel: { $in: hostelIds } };
  if (isActive !== undefined) filter.isActive = isActive === 'true';

  const skip = (page - 1) * limit;

  const discounts = await Discount.find(filter)
    .populate('hostel', 'name')
    .populate('eligibleStudents', 'name email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  const total = await Discount.countDocuments(filter);

  res.status(200).json(new ApiResponse(200, {
    discounts,
    pagination: {
      current: Number(page),
      total: Math.ceil(total / limit),
      count: discounts.length,
      totalRecords: total
    }
  }, 'Discounts fetched successfully'));
});

const validateDiscount = asyncHandler(async (req, res) => {
  const { code, amount, studentId, paymentType } = req.body;

  const discount = await Discount.findOne({
    code: code.toUpperCase(),
    isActive: true,
    validFrom: { $lte: new Date() },
    validTill: { $gte: new Date() }
  }).populate('hostel');

  if (!discount) {
    return res.status(404).json(new ApiResponse(404, null, 'Invalid or expired discount code'));
  }

  // Check usage limit
  if (discount.usageLimit && discount.usedCount >= discount.usageLimit) {
    return res.status(400).json(new ApiResponse(400, null, 'Discount usage limit exceeded'));
  }

  // Check minimum amount
  if (amount < discount.minAmount) {
    return res.status(400).json(new ApiResponse(400, null, `Minimum amount required: ₹${discount.minAmount}`));
  }

  // Check if applicable on payment type
  if (discount.applicableOn !== 'all' && discount.applicableOn !== paymentType) {
    return res.status(400).json(new ApiResponse(400, null, `Discount not applicable on ${paymentType} payments`));
  }

  // Check eligible students
  if (discount.eligibleStudents.length > 0 && !discount.eligibleStudents.includes(studentId)) {
    return res.status(400).json(new ApiResponse(400, null, 'You are not eligible for this discount'));
  }

  // Calculate discount amount
  let discountAmount = 0;
  if (discount.type === 'percentage') {
    discountAmount = (amount * discount.value) / 100;
    if (discount.maxDiscount && discountAmount > discount.maxDiscount) {
      discountAmount = discount.maxDiscount;
    }
  } else {
    discountAmount = discount.value;
  }

  // Ensure discount doesn't exceed payment amount
  if (discountAmount > amount) {
    discountAmount = amount;
  }

  res.status(200).json(new ApiResponse(200, {
    discount: {
      id: discount._id,
      name: discount.name,
      code: discount.code,
      type: discount.type,
      value: discount.value,
      discountAmount: Math.round(discountAmount),
      finalAmount: Math.round(amount - discountAmount)
    }
  }, 'Discount validated successfully'));
});

const applyDiscount = asyncHandler(async (req, res) => {
  const { paymentId, discountId } = req.body;

  const payment = await Payment.findById(paymentId);
  const discount = await Discount.findById(discountId);

  if (!payment || !discount) {
    return res.status(404).json(new ApiResponse(404, null, 'Payment or discount not found'));
  }

  // Calculate discount amount
  let discountAmount = 0;
  if (discount.type === 'percentage') {
    discountAmount = (payment.amount * discount.value) / 100;
    if (discount.maxDiscount && discountAmount > discount.maxDiscount) {
      discountAmount = discount.maxDiscount;
    }
  } else {
    discountAmount = discount.value;
  }

  if (discountAmount > payment.amount) {
    discountAmount = payment.amount;
  }

  // Update payment
  payment.discount = Math.round(discountAmount);
  payment.discountType = discount.type;
  payment.discountReason = `Discount: ${discount.name} (${discount.code})`;
  await payment.save();

  // Update discount usage
  discount.usedCount += 1;
  await discount.save();

  res.status(200).json(new ApiResponse(200, payment, 'Discount applied successfully'));
});

const updateDiscount = asyncHandler(async (req, res) => {
  const { discountId } = req.params;
  const updates = req.body;

  const discount = await Discount.findOne({ _id: discountId, owner: req.user.id });
  if (!discount) {
    return res.status(404).json(new ApiResponse(404, null, 'Discount not found'));
  }

  Object.assign(discount, updates);
  await discount.save();
  await discount.populate('hostel', 'name');

  res.status(200).json(new ApiResponse(200, discount, 'Discount updated successfully'));
});

const deleteDiscount = asyncHandler(async (req, res) => {
  const { discountId } = req.params;

  const discount = await Discount.findOneAndDelete({ _id: discountId, owner: req.user.id });
  if (!discount) {
    return res.status(404).json(new ApiResponse(404, null, 'Discount not found'));
  }

  res.status(200).json(new ApiResponse(200, null, 'Discount deleted successfully'));
});

module.exports = {
  createDiscount,
  getDiscounts,
  validateDiscount,
  applyDiscount,
  updateDiscount,
  deleteDiscount
};