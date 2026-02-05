const User = require('../models/User.model');
const Hostel = require('../models/Hostel.model');
const Booking = require('../models/Booking.model');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/apiResponse');
const generateToken = require('../utils/generateToken');
const { sendMail } = require('../config/mail');

// Generate random password
const generatePassword = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789@#$%';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

const createStaff = asyncHandler(async (req, res) => {
  const { name, email, mobile, hostelId, permissions } = req.body;

  // Verify hostel belongs to owner
  const hostel = await Hostel.findOne({ _id: hostelId, owner: req.user.id });
  if (!hostel) {
    return res.status(404).json(new ApiResponse(404, null, 'Hostel not found'));
  }

  // Check if email already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json(new ApiResponse(400, null, 'Email already exists'));
  }

  // Generate random password
  const generatedPassword = generatePassword();

  const staff = await User.create({
    name,
    email,
    password: generatedPassword,
    mobile,
    role: 'staff',
    owner: req.user.id,
    hostel: hostelId, // Ensure hostel is properly assigned
    permissions: permissions || ['maintenance'],
    isVerified: true, // Staff accounts are auto-verified
    isActive: true
  });

  // Populate the hostel information for the response
  await staff.populate('hostel', 'name address');
  await staff.populate('owner', 'name email');

  // Send email with credentials
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Staff Account Created - Hostel Management System',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Welcome to Hostel Management System</h2>
          <p>Dear ${name},</p>
          <p>Your staff account has been created successfully for <strong>${hostel.name}</strong>.</p>
          
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #1f2937;">Login Credentials</h3>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Temporary Password:</strong> <code style="background-color: #e5e7eb; padding: 4px 8px; border-radius: 4px; font-size: 16px;">${generatedPassword}</code></p>
          </div>
          
          <p style="color: #dc2626;"><strong>Important:</strong> Please change your password after your first login for security purposes.</p>
          
          <p>You can login at: <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/login" style="color: #2563eb;">Login Here</a></p>
          
          <p>Your assigned permissions: ${(permissions || ['maintenance']).join(', ')}</p>
          
          <p>Best regards,<br>Hostel Management Team</p>
        </div>
      `
    };

    await sendMail(mailOptions);
  } catch (emailError) {
    // Don't fail the staff creation if email fails
  }

  // Remove password from response
  staff.password = undefined;

  res.status(201).json(new ApiResponse(201, staff, 'Staff member created successfully. Login credentials sent to email.'));
});

const getOwnerStaff = asyncHandler(async (req, res) => {
  const { hostelId, isActive, page = 1, limit = 10 } = req.query;

  const filter = { owner: req.user.id, role: 'staff' };
  if (hostelId) filter.hostel = hostelId;
  if (isActive !== undefined) filter.isActive = isActive === 'true';

  const skip = (page - 1) * limit;

  const staff = await User.find(filter)
    .populate('hostel', 'name')
    .select('-password')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  const total = await User.countDocuments(filter);

  res.status(200).json(new ApiResponse(200, {
    staff,
    pagination: {
      current: Number(page),
      total: Math.ceil(total / limit),
      count: staff.length,
      totalRecords: total
    }
  }, 'Staff members fetched successfully'));
});

const getStaffById = asyncHandler(async (req, res) => {
  const staff = await User.findOne({
    _id: req.params.id,
    owner: req.user.id,
    role: 'staff'
  })
  .populate('hostel', 'name address')
  .populate('owner', 'name email')
  .select('-password');

  if (!staff) {
    return res.status(404).json(new ApiResponse(404, null, 'Staff member not found'));
  }

  res.status(200).json(new ApiResponse(200, staff, 'Staff details fetched successfully'));
});

const updateStaff = asyncHandler(async (req, res) => {
  const { permissions, isActive, hostelId } = req.body;

  const staff = await User.findOne({
    _id: req.params.id,
    owner: req.user.id,
    role: 'staff'
  });

  if (!staff) {
    return res.status(404).json(new ApiResponse(404, null, 'Staff member not found'));
  }

  // Verify hostel if changing
  if (hostelId && hostelId !== staff.hostel.toString()) {
    const hostel = await Hostel.findOne({ _id: hostelId, owner: req.user.id });
    if (!hostel) {
      return res.status(400).json(new ApiResponse(400, null, 'Invalid hostel'));
    }
    staff.hostel = hostelId;
  }

  if (permissions) staff.permissions = permissions;
  if (isActive !== undefined) staff.isActive = isActive;

  await staff.save();

  res.status(200).json(new ApiResponse(200, staff, 'Staff member updated successfully'));
});

const deleteStaff = asyncHandler(async (req, res) => {
  const staff = await User.findOne({
    _id: req.params.id,
    owner: req.user.id,
    role: 'staff'
  });

  if (!staff) {
    return res.status(404).json(new ApiResponse(404, null, 'Staff member not found'));
  }

  staff.isActive = false;
  await staff.save();

  res.status(200).json(new ApiResponse(200, null, 'Staff member deactivated successfully'));
});

const staffLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const staff = await User.findOne({ 
    email, 
    role: 'staff',
    isActive: true 
  }).select('+password').populate('hostel owner');

  if (!staff || !(await staff.comparePassword(password))) {
    return res.status(401).json(new ApiResponse(401, null, 'Invalid credentials'));
  }

  const token = generateToken(staff._id);

  res.status(200).json(new ApiResponse(200, {
    token,
    user: {
      id: staff._id,
      name: staff.name,
      email: staff.email,
      role: staff.role,
      permissions: staff.permissions,
      hostel: staff.hostel,
      owner: staff.owner
    }
  }, 'Staff login successful'));
});

const getStaffProfile = asyncHandler(async (req, res) => {
  const staff = await User.findById(req.user.id)
    .populate('hostel', 'name address contact')
    .populate('owner', 'name email mobile')
    .select('-password');

  res.status(200).json(new ApiResponse(200, staff, 'Staff profile fetched successfully'));
});

const updateStaffProfile = asyncHandler(async (req, res) => {
  const { name, mobile, address, city, state } = req.body;

  const staff = await User.findById(req.user.id);
  
  if (name) staff.name = name;
  if (mobile) staff.mobile = mobile;
  if (address) staff.address = address;
  if (city) staff.city = city;
  if (state) staff.state = state;

  // Handle avatar upload if file is provided
  if (req.file) {
    const cloudinary = require('../config/cloudinary');
    try {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'staff_avatars',
        resource_type: 'image'
      });
      staff.avatar = result.secure_url;
    } catch (error) {
      return res.status(500).json(new ApiResponse(500, null, 'Avatar upload failed'));
    }
  }

  await staff.save();
  staff.password = undefined;

  res.status(200).json(new ApiResponse(200, staff, 'Profile updated successfully'));
});

const changeStaffPassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json(new ApiResponse(400, null, 'New password must be at least 6 characters'));
  }

  const staff = await User.findById(req.user.id).select('+password');

  if (!(await staff.comparePassword(currentPassword))) {
    return res.status(400).json(new ApiResponse(400, null, 'Current password is incorrect'));
  }

  staff.password = newPassword;
  await staff.save();

  res.status(200).json(new ApiResponse(200, null, 'Password changed successfully'));
});

const resetStaffPassword = asyncHandler(async (req, res) => {
  const { staffId } = req.params;

  // Verify staff belongs to owner
  const staff = await User.findOne({
    _id: staffId,
    owner: req.user.id,
    role: 'staff'
  }).populate('hostel', 'name');

  if (!staff) {
    return res.status(404).json(new ApiResponse(404, null, 'Staff member not found'));
  }

  // Generate new random password
  const newPassword = generatePassword();
  staff.password = newPassword;
  await staff.save();

  // Send email with new password
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: staff.email,
      subject: 'Password Reset - Hostel Management System',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Password Reset</h2>
          <p>Dear ${staff.name},</p>
          <p>Your password has been reset by the hostel owner.</p>
          
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #1f2937;">New Login Credentials</h3>
            <p><strong>Email:</strong> ${staff.email}</p>
            <p><strong>New Password:</strong> <code style="background-color: #e5e7eb; padding: 4px 8px; border-radius: 4px; font-size: 16px;">${newPassword}</code></p>
          </div>
          
          <p style="color: #dc2626;"><strong>Important:</strong> Please change your password after login for security purposes.</p>
          
          <p>You can login at: <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/login" style="color: #2563eb;">Login Here</a></p>
          
          <p>Best regards,<br>Hostel Management Team</p>
        </div>
      `
    };

    await sendMail(mailOptions);
  } catch (emailError) {
    // Email send failed
  }

  res.status(200).json(new ApiResponse(200, null, 'Password reset successfully. New password sent to staff email.'));
});

const getStaffStats = asyncHandler(async (req, res) => {
  const { hostelId } = req.query;

  let matchFilter = { owner: req.user.id, role: 'staff' };
  if (hostelId) matchFilter.hostel = hostelId;

  const stats = await User.aggregate([
    { $match: matchFilter },
    {
      $group: {
        _id: null,
        totalStaff: { $sum: 1 },
        activeStaff: {
          $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] }
        },
        inactiveStaff: {
          $sum: { $cond: [{ $eq: ['$isActive', false] }, 1, 0] }
        }
      }
    }
  ]);

  const hostelWiseStats = await User.aggregate([
    { $match: { owner: req.user.id, role: 'staff' } },
    {
      $lookup: {
        from: 'hostels',
        localField: 'hostel',
        foreignField: '_id',
        as: 'hostelInfo'
      }
    },
    { $unwind: '$hostelInfo' },
    {
      $group: {
        _id: '$hostel',
        hostelName: { $first: '$hostelInfo.name' },
        staffCount: { $sum: 1 },
        activeStaff: {
          $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] }
        }
      }
    }
  ]);

  const result = {
    overview: stats[0] || {
      totalStaff: 0,
      activeStaff: 0,
      inactiveStaff: 0
    },
    hostelWise: hostelWiseStats
  };

  res.status(200).json(new ApiResponse(200, result, 'Staff statistics fetched successfully'));
});

const getStaffBookingRequests = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;
  
  // Get staff's assigned hostel
  const staff = await User.findById(req.user.id);
  if (!staff || !staff.hostel) {
    return res.status(200).json(new ApiResponse(200, [], 'No assigned hostel found'));
  }

  const filter = { hostel: staff.hostel };
  if (status) filter.status = status;

  const skip = (page - 1) * limit;

  const bookings = await Booking.find(filter)
    .populate('student', 'name email mobile')
    .populate('hostel', 'name address pricing')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  const total = await Booking.countDocuments(filter);

  res.status(200).json(new ApiResponse(200, {
    data: bookings,
    pagination: {
      current: Number(page),
      total: Math.ceil(total / limit),
      count: bookings.length,
      totalRecords: total
    }
  }, 'Staff booking requests fetched successfully'));
});

const getStaffTaskReports = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  
  // Mock data for staff task reports
  const reports = {
    completed: 15,
    pending: 3,
    total: 18
  };
  
  res.status(200).json(new ApiResponse(200, reports, 'Staff task reports fetched successfully'));
});

const getStaffMaintenanceReports = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  
  // Mock data for staff maintenance reports
  const reports = {
    completed: 12,
    pending: 2,
    total: 14
  };
  
  res.status(200).json(new ApiResponse(200, reports, 'Staff maintenance reports fetched successfully'));
});

const getStaffStudentReports = asyncHandler(async (req, res) => {
  // Mock data for staff student reports
  const reports = {
    managed: 25,
    active: 23
  };
  
  res.status(200).json(new ApiResponse(200, reports, 'Staff student reports fetched successfully'));
});

const getStaffActivities = asyncHandler(async (req, res) => {
  // Mock data for staff activities
  const activities = [
    {
      type: 'maintenance',
      title: 'Fixed AC in Room 101',
      description: 'Repaired air conditioning unit',
      status: 'completed',
      date: new Date()
    },
    {
      type: 'task',
      title: 'Room Inspection',
      description: 'Conducted monthly room inspection',
      status: 'completed',
      date: new Date(Date.now() - 86400000)
    },
    {
      type: 'student',
      title: 'Student Check-in',
      description: 'Assisted new student check-in',
      status: 'completed',
      date: new Date(Date.now() - 172800000)
    }
  ];
  
  res.status(200).json(new ApiResponse(200, activities, 'Staff activities fetched successfully'));
});

const exportStaffReport = asyncHandler(async (req, res) => {
  const { type } = req.params;
  const { startDate, endDate } = req.query;
  
  // Mock PDF generation
  const pdfContent = `Staff ${type} Report\nDate Range: ${startDate} to ${endDate}\nGenerated on: ${new Date().toISOString()}`;
  
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=staff-${type}-report.pdf`);
  res.status(200).send(Buffer.from(pdfContent));
});

const getStaffSettings = asyncHandler(async (req, res) => {
  // Mock settings data
  const settings = {
    notifications: {
      emailNotifications: true,
      smsNotifications: false,
      taskReminders: true,
      maintenanceAlerts: true,
      systemUpdates: false
    },
    workPreferences: {
      preferredShift: 'morning',
      availableDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
      specializations: ['maintenance', 'cleaning'],
      maxTasksPerDay: 5
    }
  };
  
  res.status(200).json(new ApiResponse(200, settings, 'Staff settings fetched successfully'));
});

const updateStaffNotifications = asyncHandler(async (req, res) => {
  const notificationSettings = req.body;
  
  // In a real app, save to database
  // For now, just return success
  
  res.status(200).json(new ApiResponse(200, notificationSettings, 'Notification settings updated successfully'));
});

const updateStaffWorkPreferences = asyncHandler(async (req, res) => {
  const workPreferences = req.body;
  
  // In a real app, save to database
  // For now, just return success
  
  res.status(200).json(new ApiResponse(200, workPreferences, 'Work preferences updated successfully'));
});

const getAssignedTasks = asyncHandler(async (req, res) => {
  const Maintenance = require('../models/Maintenance.model');
  
  // Get staff's hostel
  const staff = await User.findById(req.user.id).populate('hostel');
  if (!staff || !staff.hostel) {
    return res.status(200).json(new ApiResponse(200, [], 'No assigned hostel found'));
  }

  // Get maintenance requests that are either:
  // 1. Assigned to this staff member
  // 2. Unassigned requests from their hostel
  const tasks = await Maintenance.find({
    $or: [
      { assignedTo: req.user.id }, // Assigned to this staff
      { 
        hostel: staff.hostel._id, 
        $or: [
          { assignedTo: null }, // Unassigned requests
          { assignedTo: { $exists: false } } // Requests without assignedTo field
        ]
      }
    ]
  })
    .populate('student', 'name mobile')
    .populate('hostel', 'name')
    .populate('room', 'roomNumber floorNumber')
    .populate('assignedTo', 'name mobile')
    .sort({ priority: -1, createdAt: -1 });
  
  res.status(200).json(new ApiResponse(200, tasks, 'Assigned tasks fetched successfully'));
});

const getAssignedHostels = asyncHandler(async (req, res) => {
  const staff = await User.findById(req.user.id).populate('hostel');
  
  if (!staff || !staff.hostel) {
    return res.status(200).json(new ApiResponse(200, [], 'No assigned hostel found'));
  }

  // Return the assigned hostel as an array for consistency
  const hostels = [staff.hostel];
  
  res.status(200).json(new ApiResponse(200, hostels, 'Assigned hostels fetched successfully'));
});

const getStaffStudents = asyncHandler(async (req, res) => {
  // Get staff's assigned hostel
  const staff = await User.findById(req.user.id);
  if (!staff || !staff.hostel) {
    return res.status(200).json(new ApiResponse(200, {
      students: [],
      totalStudents: 0,
      activeStudents: 0
    }, 'No assigned hostel found'));
  }

  // Get confirmed bookings (students who paid)
  const confirmedBookings = await Booking.find({
    hostel: staff.hostel,
    status: { $in: ['confirmed', 'approved'] },
    'advancePayment.status': 'paid'
  })
    .populate('student', 'name email mobile')
    .populate('hostel', 'name pricing')
    .populate('allocatedRoom', 'roomNumber')
    .populate('allocatedBed', 'bedNumber')
    .sort({ actualCheckIn: -1 });

  // Format student list
  const currentStudents = confirmedBookings.map(booking => ({
    _id: booking.student._id,
    name: booking.student.name,
    email: booking.student.email,
    mobile: booking.student.mobile,
    hostel: { name: booking.hostel.name },
    room: booking.allocatedRoom ? { roomNumber: booking.allocatedRoom.roomNumber } : null,
    bed: booking.allocatedBed ? { bedNumber: booking.allocatedBed.bedNumber } : null,
    checkInDate: booking.actualCheckIn || booking.bookingDetails?.checkInDate,
    status: booking.allocatedRoom ? 'active' : 'pending_allocation',
    monthlyRent: booking.hostel.pricing?.monthlyRent
  }));

  res.status(200).json(new ApiResponse(200, {
    students: currentStudents,
    totalStudents: currentStudents.length,
    activeStudents: currentStudents.filter(s => s.status === 'active').length
  }, 'Staff students fetched successfully'));
});

module.exports = {
  createStaff,
  getOwnerStaff,
  getStaffById,
  updateStaff,
  deleteStaff,
  staffLogin,
  getStaffProfile,
  updateStaffProfile,
  changeStaffPassword,
  resetStaffPassword,
  getStaffStats,
  getStaffBookingRequests,
  getStaffSettings,
  updateStaffNotifications,
  updateStaffWorkPreferences,
  getStaffTaskReports,
  getStaffMaintenanceReports,
  getStaffStudentReports,
  getStaffActivities,
  exportStaffReport,
  getAssignedTasks,
  getAssignedHostels,
  getStaffStudents
};