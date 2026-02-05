const EmergencyContact = require('../models/EmergencyContact.model');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/apiResponse');

const addEmergencyContact = asyncHandler(async (req, res) => {
  const { name, relationship, mobile, email, address, isPrimary } = req.body;

  // Validation
  if (!name || !relationship || !mobile) {
    return res.status(400).json(new ApiResponse(400, null, 'Name, relationship, and mobile are required'));
  }

  // Check if mobile number already exists for this user
  const existingContact = await EmergencyContact.findOne({
    user: req.user.id,
    mobile,
    isActive: true
  });

  if (existingContact) {
    return res.status(400).json(new ApiResponse(400, null, 'Contact with this mobile number already exists'));
  }

  // If setting as primary, unset other primary contacts
  if (isPrimary) {
    await EmergencyContact.updateMany(
      { user: req.user.id, isActive: true },
      { isPrimary: false }
    );
  }

  const contact = await EmergencyContact.create({
    user: req.user.id,
    name: name.trim(),
    relationship,
    mobile: mobile.trim(),
    email: email ? email.trim().toLowerCase() : undefined,
    address: address ? address.trim() : undefined,
    isPrimary: isPrimary || false
  });

  res.status(201).json(new ApiResponse(201, contact, 'Emergency contact added successfully'));
});

const getEmergencyContacts = asyncHandler(async (req, res) => {
  const contacts = await EmergencyContact.find({ 
    user: req.user.id, 
    isActive: true 
  }).sort({ isPrimary: -1, createdAt: -1 });

  res.status(200).json(new ApiResponse(200, contacts, 'Emergency contacts fetched successfully'));
});

const updateEmergencyContact = asyncHandler(async (req, res) => {
  const { contactId } = req.params;
  const { name, relationship, mobile, email, address, isPrimary } = req.body;

  const contact = await EmergencyContact.findOne({
    _id: contactId,
    user: req.user.id,
    isActive: true
  });

  if (!contact) {
    return res.status(404).json(new ApiResponse(404, null, 'Emergency contact not found'));
  }

  // Check if mobile number already exists for another contact
  if (mobile && mobile !== contact.mobile) {
    const existingContact = await EmergencyContact.findOne({
      user: req.user.id,
      mobile,
      isActive: true,
      _id: { $ne: contactId }
    });

    if (existingContact) {
      return res.status(400).json(new ApiResponse(400, null, 'Contact with this mobile number already exists'));
    }
  }

  // If setting as primary, unset other primary contacts
  if (isPrimary && !contact.isPrimary) {
    await EmergencyContact.updateMany(
      { user: req.user.id, isActive: true, _id: { $ne: contactId } },
      { isPrimary: false }
    );
  }

  // Update fields
  if (name) contact.name = name.trim();
  if (relationship) contact.relationship = relationship;
  if (mobile) contact.mobile = mobile.trim();
  if (email !== undefined) contact.email = email ? email.trim().toLowerCase() : undefined;
  if (address !== undefined) contact.address = address ? address.trim() : undefined;
  if (isPrimary !== undefined) contact.isPrimary = isPrimary;

  await contact.save();

  res.status(200).json(new ApiResponse(200, contact, 'Emergency contact updated successfully'));
});

const deleteEmergencyContact = asyncHandler(async (req, res) => {
  const { contactId } = req.params;

  const contact = await EmergencyContact.findOne({
    _id: contactId,
    user: req.user.id,
    isActive: true
  });

  if (!contact) {
    return res.status(404).json(new ApiResponse(404, null, 'Emergency contact not found'));
  }

  // Soft delete
  contact.isActive = false;
  await contact.save();

  res.status(200).json(new ApiResponse(200, null, 'Emergency contact deleted successfully'));
});

const getStudentEmergencyContacts = asyncHandler(async (req, res) => {
  const { studentId } = req.params;

  const contacts = await EmergencyContact.find({
    user: studentId,
    isActive: true
  }).sort({ isPrimary: -1, createdAt: -1 });

  res.status(200).json(new ApiResponse(200, contacts, 'Student emergency contacts fetched successfully'));
});

module.exports = {
  addEmergencyContact,
  getEmergencyContacts,
  updateEmergencyContact,
  deleteEmergencyContact,
  getStudentEmergencyContacts
};