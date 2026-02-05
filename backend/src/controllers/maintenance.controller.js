const Maintenance = require('../models/Maintenance.model');
const User = require('../models/User.model');
const Bed = require('../models/Bed.model');
const Hostel = require('../models/Hostel.model');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/apiResponse');
const notificationService = require('../services/notification.service');

const createMaintenanceRequest = asyncHandler(async (req, res) => {
  const { category, title, description, priority } = req.body;

  // Get student's bed and hostel
  const bed = await Bed.findOne({ occupant: req.user.id }).populate('hostel room');
  if (!bed) {
    return res.status(400).json(new ApiResponse(400, null, 'No room allocated to create maintenance request'));
  }

  // Check for duplicate requests (same title and category within 24 hours)
  const existingRequest = await Maintenance.findOne({
    student: req.user.id,
    title: title.trim(),
    category,
    status: { $in: ['pending', 'assigned', 'in_progress'] },
    createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
  });

  if (existingRequest) {
    return res.status(400).json(new ApiResponse(400, null, 'Similar request already exists. Please wait 24 hours before creating duplicate requests.'));
  }

  const maintenance = await Maintenance.create({
    student: req.user.id,
    hostel: bed.hostel._id,
    room: bed.room._id,
    category,
    title: title.trim(),
    description: description.trim(),
    priority: priority || 'medium'
  });

  // Send notification to owner
  await notificationService.sendNotification({
    recipient: bed.hostel.owner,
    type: 'maintenance_request',
    title: 'New Maintenance Request',
    message: `New ${category} maintenance request from Room ${bed.room.roomNumber}`,
    data: { maintenanceId: maintenance._id }
  });

  // Also notify all staff members of this hostel about new unassigned request
  const hostelStaff = await User.find({ 
    hostel: bed.hostel._id, 
    role: 'staff', 
    isActive: true 
  });
  
  for (const staffMember of hostelStaff) {
    await notificationService.sendNotification({
      recipient: staffMember._id,
      type: 'maintenance_request',
      title: 'New Maintenance Request Available',
      message: `New ${category} request in your hostel: ${maintenance.title}`,
      data: { maintenanceId: maintenance._id }
    });
  }

  res.status(201).json(new ApiResponse(201, maintenance, 'Maintenance request created successfully'));
});

const uploadMaintenanceImages = asyncHandler(async (req, res) => {
  const { requestId } = req.params;
  const cloudinary = require('../config/cloudinary');
  
  const request = await Maintenance.findById(requestId);
  if (!request) {
    return res.status(404).json(new ApiResponse(404, null, 'Maintenance request not found'));
  }

  // Check if user has permission to upload images
  const hasPermission = 
    request.student.toString() === req.user.id || // Student who created request
    request.assignedTo?.toString() === req.user.id; // Staff assigned to task

  if (!hasPermission) {
    return res.status(403).json(new ApiResponse(403, null, 'Access denied'));
  }

  if (!req.files || req.files.length === 0) {
    return res.status(400).json(new ApiResponse(400, null, 'No image files provided'));
  }

  try {
    const uploadedImages = [];
    
    for (const file of req.files) {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: 'maintenance_images',
        resource_type: 'image'
      });
      
      uploadedImages.push(result.secure_url);
    }

    request.images.push(...uploadedImages);
    await request.save();

    res.status(200).json(new ApiResponse(200, {
      images: uploadedImages,
      totalImages: request.images.length
    }, 'Maintenance images uploaded successfully'));
  } catch (error) {
    res.status(500).json(new ApiResponse(500, null, 'Image upload failed'));
  }
});

const getStudentMaintenanceRequests = asyncHandler(async (req, res) => {
  const { status, category, page = 1, limit = 10 } = req.query;

  const filter = { student: req.user.id };
  if (status) filter.status = status;
  if (category) filter.category = category;

  const skip = (page - 1) * limit;

  const requests = await Maintenance.find(filter)
    .populate('hostel', 'name')
    .populate('room', 'roomNumber floorNumber')
    .populate('assignedTo', 'name mobile')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  const total = await Maintenance.countDocuments(filter);

  res.status(200).json(new ApiResponse(200, {
    requests,
    pagination: {
      current: Number(page),
      total: Math.ceil(total / limit),
      count: requests.length,
      totalRecords: total
    }
  }, 'Student maintenance requests fetched successfully'));
});

const getOwnerMaintenanceRequests = asyncHandler(async (req, res) => {
  const { status, category, priority, hostelId, page = 1, limit = 10 } = req.query;

  // Get owner's hostels
  const hostels = await Hostel.find({ owner: req.user.id }).select('_id');
  const hostelIds = hostels.map(h => h._id);

  const filter = { hostel: { $in: hostelIds } };
  if (status) filter.status = status;
  if (category) filter.category = category;
  if (priority) filter.priority = priority;
  if (hostelId) filter.hostel = hostelId;

  const skip = (page - 1) * limit;

  const requests = await Maintenance.find(filter)
    .populate('student', 'name mobile')
    .populate('hostel', 'name')
    .populate('room', 'roomNumber floorNumber')
    .populate('assignedTo', 'name mobile')
    .sort({ priority: -1, createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  const total = await Maintenance.countDocuments(filter);

  res.status(200).json(new ApiResponse(200, {
    requests,
    pagination: {
      current: Number(page),
      total: Math.ceil(total / limit),
      count: requests.length,
      totalRecords: total
    }
  }, 'Owner maintenance requests fetched successfully'));
});

const getStaffMaintenanceRequests = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;

  // Get staff's hostel with proper population
  const staff = await User.findById(req.user.id).populate('hostel');
  if (!staff || !staff.hostel) {
    return res.status(400).json(new ApiResponse(400, null, 'Staff not assigned to any hostel'));
  }

  // Show both assigned requests AND unassigned requests from their hostel
  const filter = {
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
  };
  
  if (status) {
    if (status === 'unassigned') {
      // Special filter for unassigned requests only
      filter.$or = [{
        hostel: staff.hostel._id,
        $or: [
          { assignedTo: null },
          { assignedTo: { $exists: false } }
        ],
        status: 'pending'
      }];
    } else {
      filter.status = status;
    }
  }

  const skip = (page - 1) * limit;

  const requests = await Maintenance.find(filter)
    .populate('student', 'name mobile')
    .populate('hostel', 'name')
    .populate('room', 'roomNumber floorNumber')
    .populate('assignedTo', 'name mobile')
    .sort({ priority: -1, createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  const total = await Maintenance.countDocuments(filter);

  res.status(200).json(new ApiResponse(200, {
    requests,
    pagination: {
      current: Number(page),
      total: Math.ceil(total / limit),
      count: requests.length,
      totalRecords: total
    }
  }, 'Staff maintenance requests fetched successfully'));
});

const assignMaintenanceRequest = asyncHandler(async (req, res) => {
  const { requestId } = req.params;
  const { staffId, estimatedCost } = req.body;

  const request = await Maintenance.findById(requestId).populate('hostel');
  if (!request) {
    return res.status(404).json(new ApiResponse(404, null, 'Maintenance request not found'));
  }

  if (request.hostel.owner.toString() !== req.user.id) {
    return res.status(403).json(new ApiResponse(403, null, 'Access denied'));
  }

  // Verify staff belongs to owner and is assigned to the same hostel
  const staff = await User.findOne({ _id: staffId, owner: req.user.id, role: 'staff' });
  if (!staff) {
    return res.status(400).json(new ApiResponse(400, null, 'Invalid staff member'));
  }

  // Verify staff is assigned to the same hostel as the maintenance request
  if (staff.hostel.toString() !== request.hostel._id.toString()) {
    return res.status(400).json(new ApiResponse(400, null, 'Staff member not assigned to this hostel'));
  }

  request.assignedTo = staffId;
  request.assignedBy = req.user.id;
  request.assignedAt = new Date();
  request.status = 'assigned';
  if (estimatedCost) request.estimatedCost = estimatedCost;

  await request.save();

  // Send notification to staff
  await notificationService.sendNotification({
    recipient: staffId,
    type: 'maintenance_assigned',
    title: 'Maintenance Task Assigned',
    message: `New ${request.category} task assigned: ${request.title}`,
    data: { maintenanceId: request._id }
  });

  res.status(200).json(new ApiResponse(200, request, 'Maintenance request assigned successfully'));
});

const updateMaintenanceStatus = asyncHandler(async (req, res) => {
  const { requestId } = req.params;
  const { status, actualCost, notes } = req.body;

  const request = await Maintenance.findById(requestId).populate('student hostel');
  if (!request) {
    return res.status(404).json(new ApiResponse(404, null, 'Maintenance request not found'));
  }

  let hasPermission = false;

  // Check permissions based on user role
  if (req.user.role === 'staff') {
    const staff = await User.findById(req.user.id);
    // Staff can update if:
    // 1. Task is assigned to them
    // 2. Task is unassigned in their hostel (can take it)
    // 3. They belong to the same hostel as the request
    hasPermission = 
      request.assignedTo?.toString() === req.user.id ||
      (staff.hostel?.toString() === request.hostel._id.toString() && 
       (status === 'assigned' || !request.assignedTo));
  } else if (req.user.role === 'student') {
    hasPermission = request.student.toString() === req.user.id;
  } else if (req.user.role === 'owner') {
    const ownerHostel = await Hostel.findOne({ _id: request.hostel._id, owner: req.user.id });
    hasPermission = !!ownerHostel;
  }

  if (!hasPermission) {
    return res.status(403).json(new ApiResponse(403, null, 'Access denied'));
  }

  // Special case: Staff taking unassigned task
  if (req.user.role === 'staff' && status === 'assigned' && !request.assignedTo) {
    request.assignedTo = req.user.id;
    request.assignedAt = new Date();
  }

  // Handle status changes
  if (status) {
    request.status = status;
    
    // Reset assignment if rejected/cancelled
    if (status === 'pending') {
      request.assignedTo = null;
      request.assignedAt = null;
    }
  }
  
  if (actualCost) request.actualCost = actualCost;
  if (status === 'completed') request.completedAt = new Date();

  if (notes) {
    request.notes.push({
      user: req.user.id,
      message: notes
    });
  }

  await request.save();

  // If maintenance is completed, update the monthly payment for this month
  if (status === 'completed' && actualCost > 0) {
    try {
      const Payment = require('../models/Payment.model');
      const moment = require('moment');
      
      const completedDate = new Date();
      const month = moment(completedDate).format('MMMM');
      const year = moment(completedDate).year();
      
      // Find the payment for this month and student
      const payment = await Payment.findOne({
        student: request.student._id,
        month: month,
        year: year,
        paymentType: 'monthly',
        status: 'pending'
      });
      
      if (payment) {
        // Add maintenance charges to existing payment
        payment.maintenanceCharges = (payment.maintenanceCharges || 0) + actualCost;
        payment.amount = payment.baseRent + payment.electricityCharges + payment.maintenanceCharges;
        await payment.save();
        
        console.log(`Updated payment ${payment._id} with maintenance charges: ${actualCost}`);
      }
    } catch (error) {
      console.error('Error updating payment with maintenance charges:', error);
      // Don't fail the maintenance update if payment update fails
    }
  }

  // Send notifications
  if (status === 'completed') {
    await notificationService.sendNotification({
      recipient: request.student._id,
      type: 'maintenance_completed',
      title: 'Maintenance Completed',
      message: `Your maintenance request "${request.title}" has been completed`,
      data: { maintenanceId: request._id }
    });
  } else if (status === 'in_progress') {
    await notificationService.sendNotification({
      recipient: request.student._id,
      type: 'maintenance_progress',
      title: 'Maintenance In Progress',
      message: `Your maintenance request "${request.title}" is now in progress`,
      data: { maintenanceId: request._id }
    });
  } else if (notes && notes.includes('Message to student:')) {
    await notificationService.sendNotification({
      recipient: request.student._id,
      type: 'maintenance_message',
      title: 'Message from Staff',
      message: notes,
      data: { maintenanceId: request._id }
    });
  }

  await request.populate('assignedTo', 'name mobile');

  res.status(200).json(new ApiResponse(200, request, 'Maintenance status updated successfully'));
});

const addMaintenanceNote = asyncHandler(async (req, res) => {
  const { requestId } = req.params;
  const { message } = req.body;

  const request = await Maintenance.findById(requestId);
  if (!request) {
    return res.status(404).json(new ApiResponse(404, null, 'Maintenance request not found'));
  }

  request.notes.push({
    user: req.user.id,
    message
  });

  await request.save();

  res.status(200).json(new ApiResponse(200, request, 'Note added successfully'));
});

const rateMaintenanceService = asyncHandler(async (req, res) => {
  const { requestId } = req.params;
  const { rating, feedback } = req.body;

  const request = await Maintenance.findById(requestId);
  if (!request) {
    return res.status(404).json(new ApiResponse(404, null, 'Maintenance request not found'));
  }

  if (request.student.toString() !== req.user.id) {
    return res.status(403).json(new ApiResponse(403, null, 'Access denied'));
  }

  if (request.status !== 'completed') {
    return res.status(400).json(new ApiResponse(400, null, 'Can only rate completed maintenance'));
  }

  request.rating = rating;
  request.feedback = feedback;
  await request.save();

  res.status(200).json(new ApiResponse(200, request, 'Maintenance service rated successfully'));
});

const bulkUpdateMaintenanceStatus = asyncHandler(async (req, res) => {
  const { requestIds, status, notes } = req.body;

  if (!requestIds || !Array.isArray(requestIds) || requestIds.length === 0) {
    return res.status(400).json(new ApiResponse(400, null, 'Request IDs array is required'));
  }

  const requests = await Maintenance.find({ _id: { $in: requestIds } }).populate('hostel');
  
  // Check permissions for all requests
  for (const request of requests) {
    let hasPermission = false;
    
    if (req.user.role === 'owner') {
      hasPermission = request.hostel.owner.toString() === req.user.id;
    } else if (req.user.role === 'staff') {
      const staff = await User.findById(req.user.id);
      hasPermission = staff.hostel?.toString() === request.hostel._id.toString();
    }
    
    if (!hasPermission) {
      return res.status(403).json(new ApiResponse(403, null, `Access denied for request ${request._id}`));
    }
  }

  // Update all requests
  const updateData = { status };
  if (status === 'completed') updateData.completedAt = new Date();
  if (notes) {
    updateData.$push = {
      notes: {
        user: req.user.id,
        message: notes
      }
    };
  }

  await Maintenance.updateMany(
    { _id: { $in: requestIds } },
    updateData
  );

  res.status(200).json(new ApiResponse(200, null, `${requestIds.length} maintenance requests updated successfully`));
});

const getMaintenanceStats = asyncHandler(async (req, res) => {
  const { hostelId, startDate, endDate } = req.query;

  let matchFilter = {};

  if (req.user.role === 'owner') {
    const hostels = await Hostel.find({ owner: req.user.id }).select('_id');
    matchFilter.hostel = { $in: hostels.map(h => h._id) };
    
    if (hostelId) {
      matchFilter.hostel = hostelId;
    }
  } else if (req.user.role === 'staff') {
    matchFilter.assignedTo = req.user.id;
  } else if (req.user.role === 'student') {
    matchFilter.student = req.user.id;
  }

  if (startDate && endDate) {
    matchFilter.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }

  const stats = await Maintenance.aggregate([
    { $match: matchFilter },
    {
      $group: {
        _id: null,
        totalRequests: { $sum: 1 },
        pendingRequests: {
          $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
        },
        assignedRequests: {
          $sum: { $cond: [{ $eq: ['$status', 'assigned'] }, 1, 0] }
        },
        inProgressRequests: {
          $sum: { $cond: [{ $eq: ['$status', 'in_progress'] }, 1, 0] }
        },
        completedRequests: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
        },
        totalCost: { $sum: '$actualCost' },
        averageRating: { $avg: '$rating' },
        averageResolutionTime: {
          $avg: {
            $cond: [
              { $and: [{ $ne: ['$completedAt', null] }, { $ne: ['$createdAt', null] }] },
              { $divide: [{ $subtract: ['$completedAt', '$createdAt'] }, 1000 * 60 * 60] },
              null
            ]
          }
        }
      }
    }
  ]);

  const categoryStats = await Maintenance.aggregate([
    { $match: matchFilter },
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        totalCost: { $sum: '$actualCost' },
        averageRating: { $avg: '$rating' }
      }
    },
    { $sort: { count: -1 } }
  ]);

  const priorityStats = await Maintenance.aggregate([
    { $match: matchFilter },
    {
      $group: {
        _id: '$priority',
        count: { $sum: 1 }
      }
    }
  ]);

  const result = {
    overview: stats[0] || {
      totalRequests: 0,
      pendingRequests: 0,
      assignedRequests: 0,
      inProgressRequests: 0,
      completedRequests: 0,
      totalCost: 0,
      averageRating: 0,
      averageResolutionTime: 0
    },
    categoryBreakdown: categoryStats,
    priorityBreakdown: priorityStats
  };

  res.status(200).json(new ApiResponse(200, result, 'Maintenance statistics fetched successfully'));
});

module.exports = {
  createMaintenanceRequest,
  uploadMaintenanceImages,
  getStudentMaintenanceRequests,
  getOwnerMaintenanceRequests,
  getStaffMaintenanceRequests,
  assignMaintenanceRequest,
  updateMaintenanceStatus,
  addMaintenanceNote,
  rateMaintenanceService,
  bulkUpdateMaintenanceStatus,
  getMaintenanceStats
};