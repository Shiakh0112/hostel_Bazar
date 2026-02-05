const User = require('../models/User.model');
const Booking = require('../models/Booking.model');
const Payment = require('../models/Payment.model');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/apiResponse');
const exportService = require('../services/export.service');
const backupService = require('../services/backup.service');
const smsService = require('../services/sms.service');

// Advanced User Management
const getAllUsers = asyncHandler(async (req, res) => {
  const { role, status, page = 1, limit = 20, search } = req.query;
  
  let filter = {};
  if (role) filter.role = role;
  if (status) filter.isActive = status === 'active';
  
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { mobile: { $regex: search, $options: 'i' } }
    ];
  }

  const skip = (page - 1) * limit;
  
  const users = await User.find(filter)
    .select('-password')
    .populate('hostel', 'name')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  const total = await User.countDocuments(filter);

  res.status(200).json(new ApiResponse(200, {
    users,
    pagination: {
      current: Number(page),
      total: Math.ceil(total / limit),
      count: users.length,
      totalRecords: total
    }
  }, 'Users fetched successfully'));
});

const updateUserRole = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { role, permissions, isActive } = req.body;

  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json(new ApiResponse(404, null, 'User not found'));
  }

  if (role) user.role = role;
  if (permissions) user.permissions = permissions;
  if (isActive !== undefined) user.isActive = isActive;

  await user.save();

  res.status(200).json(new ApiResponse(200, user, 'User updated successfully'));
});

const bulkUserOperations = asyncHandler(async (req, res) => {
  const { operation, userIds, data } = req.body;

  let result = {};

  switch (operation) {
    case 'activate':
      result = await User.updateMany(
        { _id: { $in: userIds } },
        { isActive: true }
      );
      break;
    
    case 'deactivate':
      result = await User.updateMany(
        { _id: { $in: userIds } },
        { isActive: false }
      );
      break;
    
    case 'updateRole':
      result = await User.updateMany(
        { _id: { $in: userIds } },
        { role: data.role }
      );
      break;
    
    case 'delete':
      result = await User.deleteMany({ _id: { $in: userIds } });
      break;
    
    default:
      return res.status(400).json(new ApiResponse(400, null, 'Invalid operation'));
  }

  res.status(200).json(new ApiResponse(200, result, `Bulk ${operation} completed successfully`));
});

// Data Export Functions
const exportRevenueData = asyncHandler(async (req, res) => {
  const { format = 'excel', startDate, endDate, hostelId } = req.query;

  let filter = { status: 'completed' };
  if (startDate && endDate) {
    filter.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }
  if (hostelId) filter.hostel = hostelId;

  const payments = await Payment.find(filter)
    .populate('hostel', 'name')
    .populate('student', 'name email mobile')
    .sort({ createdAt: -1 });

  const exportData = payments.map(payment => ({
    date: payment.createdAt,
    hostelName: payment.hostel?.name,
    studentName: payment.student?.name,
    studentEmail: payment.student?.email,
    amount: payment.amount,
    paymentType: payment.paymentType,
    paymentMethod: payment.paymentMethod,
    status: payment.status
  }));

  const result = await exportService.exportRevenueReport(exportData, format);

  if (result.success) {
    res.download(result.filePath, result.filename);
  } else {
    res.status(500).json(new ApiResponse(500, null, 'Export failed'));
  }
});

const exportStudentData = asyncHandler(async (req, res) => {
  const { format = 'excel', hostelId } = req.query;

  const bookings = await Booking.find({ status: 'confirmed' })
    .populate('student', 'name email mobile')
    .populate('hostel', 'name')
    .populate('allocatedRoom', 'roomNumber')
    .populate('allocatedBed', 'bedNumber');

  let filteredBookings = bookings;
  if (hostelId) {
    filteredBookings = bookings.filter(booking => booking.hostel._id.toString() === hostelId);
  }

  const exportData = filteredBookings.map(booking => ({
    name: booking.student.name,
    email: booking.student.email,
    mobile: booking.student.mobile,
    hostel: booking.hostel,
    room: booking.allocatedRoom,
    bed: booking.allocatedBed,
    checkInDate: booking.actualCheckIn,
    status: 'active'
  }));

  const result = await exportService.exportStudentReport(exportData, format);

  if (result.success) {
    res.download(result.filePath, result.filename);
  } else {
    res.status(500).json(new ApiResponse(500, null, 'Export failed'));
  }
});

const exportMaintenanceData = asyncHandler(async (req, res) => {
  const { format = 'excel', startDate, endDate, hostelId } = req.query;
  const Maintenance = require('../models/Maintenance.model');

  let filter = {};
  if (startDate && endDate) {
    filter.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }
  if (hostelId) filter.hostel = hostelId;

  const maintenanceData = await Maintenance.find(filter)
    .populate('hostel', 'name')
    .populate('student', 'name')
    .populate('assignedTo', 'name')
    .sort({ createdAt: -1 });

  const result = await exportService.exportMaintenanceReport(maintenanceData, format);

  if (result.success) {
    res.download(result.filePath, result.filename);
  } else {
    res.status(500).json(new ApiResponse(500, null, 'Export failed'));
  }
});

// Backup Management
const createBackup = asyncHandler(async (req, res) => {
  const { type = 'manual' } = req.body;

  const result = await backupService.createBackup(type);
  
  res.status(200).json(new ApiResponse(200, result, 'Backup created successfully'));
});

const getBackupList = asyncHandler(async (req, res) => {
  const backups = await backupService.getBackupList();
  
  res.status(200).json(new ApiResponse(200, backups, 'Backup list fetched successfully'));
});

const restoreBackup = asyncHandler(async (req, res) => {
  const { filename } = req.body;

  const result = await backupService.restoreBackup(filename);
  
  res.status(200).json(new ApiResponse(200, result, 'Database restored successfully'));
});

const deleteBackup = asyncHandler(async (req, res) => {
  const { filename } = req.params;

  const result = await backupService.deleteBackup(filename);
  
  res.status(200).json(new ApiResponse(200, result, 'Backup deleted successfully'));
});

const getBackupStatus = asyncHandler(async (req, res) => {
  const status = await backupService.getBackupStatus();
  
  res.status(200).json(new ApiResponse(200, status, 'Backup status fetched successfully'));
});

// SMS Management
const sendBulkSMS = asyncHandler(async (req, res) => {
  const { recipients, message, userRole } = req.body;

  let targetUsers = [];

  if (userRole) {
    // Send to all users of specific role
    targetUsers = await User.find({ 
      role: userRole, 
      isActive: true,
      mobile: { $exists: true, $ne: '' }
    }).select('name mobile');
  } else if (recipients) {
    // Send to specific recipients
    targetUsers = recipients;
  }

  const results = await smsService.sendBulkSMS(targetUsers, message);
  
  res.status(200).json(new ApiResponse(200, results, 'Bulk SMS sent successfully'));
});

const getSMSSettings = asyncHandler(async (req, res) => {
  const settings = {
    smsEnabled: !!process.env.TWILIO_ACCOUNT_SID,
    fromNumber: process.env.TWILIO_PHONE_NUMBER,
    accountSid: process.env.TWILIO_ACCOUNT_SID ? '***' + process.env.TWILIO_ACCOUNT_SID.slice(-4) : null
  };
  
  res.status(200).json(new ApiResponse(200, settings, 'SMS settings fetched successfully'));
});

// System Statistics
const getSystemStats = asyncHandler(async (req, res) => {
  const totalUsers = await User.countDocuments();
  const activeUsers = await User.countDocuments({ isActive: true });
  const totalBookings = await Booking.countDocuments();
  const activeBookings = await Booking.countDocuments({ status: 'confirmed' });
  const totalRevenue = await Payment.aggregate([
    { $match: { status: 'completed' } },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);

  const stats = {
    users: {
      total: totalUsers,
      active: activeUsers,
      inactive: totalUsers - activeUsers
    },
    bookings: {
      total: totalBookings,
      active: activeBookings
    },
    revenue: {
      total: totalRevenue[0]?.total || 0
    }
  };

  res.status(200).json(new ApiResponse(200, stats, 'System statistics fetched successfully'));
});

module.exports = {
  getAllUsers,
  updateUserRole,
  bulkUserOperations,
  exportRevenueData,
  exportStudentData,
  exportMaintenanceData,
  createBackup,
  getBackupList,
  restoreBackup,
  deleteBackup,
  getBackupStatus,
  sendBulkSMS,
  getSMSSettings,
  getSystemStats
};