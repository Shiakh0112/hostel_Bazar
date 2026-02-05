const User = require('../models/User.model');
const Hostel = require('../models/Hostel.model');
const Booking = require('../models/Booking.model');
const Payment = require('../models/Payment.model');
const Maintenance = require('../models/Maintenance.model');
const Bed = require('../models/Bed.model');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/apiResponse');
const moment = require('moment');

const getOwnerDashboard = asyncHandler(async (req, res) => {
  const { hostelId, period = '30' } = req.query;
  
  // Get owner's hostels
  let hostelFilter = { owner: req.user.id };
  if (hostelId) hostelFilter._id = hostelId;

  const hostels = await Hostel.find(hostelFilter);
  const hostelIds = hostels.map(h => h._id);

  const startDate = moment().subtract(Number(period), 'days').toDate();

  // Basic stats
  const totalHostels = hostels.length;
  const totalBeds = await Bed.countDocuments({ hostel: { $in: hostelIds } });
  const occupiedBeds = await Bed.countDocuments({ 
    hostel: { $in: hostelIds }, 
    isOccupied: true 
  });
  const availableBeds = totalBeds - occupiedBeds;
  const occupancyRate = totalBeds > 0 ? ((occupiedBeds / totalBeds) * 100).toFixed(2) : 0;

  // Booking stats
  const totalBookings = await Booking.countDocuments({ 
    hostel: { $in: hostelIds },
    createdAt: { $gte: startDate }
  });
  const pendingBookings = await Booking.countDocuments({ 
    hostel: { $in: hostelIds },
    status: 'pending'
  });
  const confirmedBookings = await Booking.countDocuments({ 
    hostel: { $in: hostelIds },
    status: 'confirmed'
  });

  // Revenue stats - Include ALL payment types (advance + monthly)
  const revenueStats = await Payment.aggregate([
    {
      $match: {
        hostel: { $in: hostelIds },
        status: 'completed',
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$amount' },
        totalPayments: { $sum: 1 },
        advancePayments: {
          $sum: { $cond: [{ $eq: ['$paymentType', 'advance'] }, '$amount', 0] }
        },
        monthlyPayments: {
          $sum: { $cond: [{ $eq: ['$paymentType', 'monthly'] }, '$amount', 0] }
        }
      }
    }
  ]);

  const revenue = revenueStats[0] || { totalRevenue: 0, totalPayments: 0 };

  // Maintenance stats
  const maintenanceStats = await Maintenance.aggregate([
    {
      $match: {
        hostel: { $in: hostelIds },
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  // Monthly revenue trend - Include ALL payment types
  const monthlyRevenue = await Payment.aggregate([
    {
      $match: {
        hostel: { $in: hostelIds },
        status: 'completed',
        createdAt: { $gte: moment().subtract(12, 'months').toDate() }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        },
        revenue: { $sum: '$amount' },
        count: { $sum: 1 },
        advancePayments: {
          $sum: { $cond: [{ $eq: ['$paymentType', 'advance'] }, '$amount', 0] }
        },
        monthlyPayments: {
          $sum: { $cond: [{ $eq: ['$paymentType', 'monthly'] }, '$amount', 0] }
        }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } }
  ]);

  // Hostel-wise performance
  const hostelPerformance = await Promise.all(
    hostels.map(async (hostel) => {
      const beds = await Bed.countDocuments({ hostel: hostel._id });
      const occupied = await Bed.countDocuments({ 
        hostel: hostel._id, 
        isOccupied: true 
      });
      const bookings = await Booking.countDocuments({ 
        hostel: hostel._id,
        createdAt: { $gte: startDate }
      });
      const revenue = await Payment.aggregate([
        {
          $match: {
            hostel: hostel._id,
            status: 'completed',
            createdAt: { $gte: startDate }
          }
        },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]);

      return {
        hostelId: hostel._id,
        name: hostel.name,
        totalBeds: beds,
        occupiedBeds: occupied,
        occupancyRate: beds > 0 ? ((occupied / beds) * 100).toFixed(2) : 0,
        newBookings: bookings,
        revenue: revenue[0]?.total || 0
      };
    })
  );

  res.status(200).json(new ApiResponse(200, {
    overview: {
      totalHostels,
      totalBeds,
      occupiedBeds,
      availableBeds,
      occupancyRate: Number(occupancyRate),
      totalBookings,
      pendingBookings,
      confirmedBookings,
      totalRevenue: revenue.totalRevenue,
      totalPayments: revenue.totalPayments,
      advancePayments: revenue.advancePayments || 0,
      monthlyPayments: revenue.monthlyPayments || 0
    },
    maintenance: maintenanceStats,
    monthlyRevenue,
    hostelPerformance
  }, 'Owner dashboard data fetched successfully'));
});

const getRevenueReport = asyncHandler(async (req, res) => {
  const { hostelId, startDate, endDate, groupBy = 'month' } = req.query;

  let hostelFilter = { owner: req.user.id };
  if (hostelId) hostelFilter._id = hostelId;

  const hostels = await Hostel.find(hostelFilter);
  const hostelIds = hostels.map(h => h._id);

  let matchFilter = {
    hostel: { $in: hostelIds },
    status: 'completed'
  };

  if (startDate && endDate) {
    matchFilter.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }

  let groupStage = {};
  if (groupBy === 'day') {
    groupStage = {
      year: { $year: '$createdAt' },
      month: { $month: '$createdAt' },
      day: { $dayOfMonth: '$createdAt' }
    };
  } else if (groupBy === 'month') {
    groupStage = {
      year: { $year: '$createdAt' },
      month: { $month: '$createdAt' }
    };
  } else if (groupBy === 'year') {
    groupStage = {
      year: { $year: '$createdAt' }
    };
  }

  const revenueData = await Payment.aggregate([
    { $match: matchFilter },
    {
      $group: {
        _id: groupStage,
        totalRevenue: { $sum: '$amount' },
        totalPayments: { $sum: 1 },
        advancePayments: {
          $sum: { $cond: [{ $eq: ['$paymentType', 'advance'] }, '$amount', 0] }
        },
        monthlyPayments: {
          $sum: { $cond: [{ $eq: ['$paymentType', 'monthly'] }, '$amount', 0] }
        }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
  ]);

  // Payment type breakdown
  const paymentTypeBreakdown = await Payment.aggregate([
    { $match: matchFilter },
    {
      $group: {
        _id: '$paymentType',
        totalAmount: { $sum: '$amount' },
        count: { $sum: 1 }
      }
    }
  ]);

  // Hostel-wise revenue
  const hostelWiseRevenue = await Payment.aggregate([
    { $match: matchFilter },
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
        totalRevenue: { $sum: '$amount' },
        totalPayments: { $sum: 1 }
      }
    },
    { $sort: { totalRevenue: -1 } }
  ]);

  res.status(200).json(new ApiResponse(200, {
    revenueData,
    paymentTypeBreakdown,
    hostelWiseRevenue
  }, 'Revenue report generated successfully'));
});

const getOccupancyReport = asyncHandler(async (req, res) => {
  const { hostelId, startDate, endDate } = req.query;

  let hostelFilter = { owner: req.user.id };
  if (hostelId) hostelFilter._id = hostelId;

  const hostels = await Hostel.find(hostelFilter);

  const occupancyData = await Promise.all(
    hostels.map(async (hostel) => {
      const totalBeds = await Bed.countDocuments({ hostel: hostel._id });
      const occupiedBeds = await Bed.countDocuments({ 
        hostel: hostel._id, 
        isOccupied: true 
      });

      // Floor-wise occupancy
      const floorWiseOccupancy = await Bed.aggregate([
        { $match: { hostel: hostel._id } },
        {
          $group: {
            _id: '$floorNumber',
            totalBeds: { $sum: 1 },
            occupiedBeds: {
              $sum: { $cond: [{ $eq: ['$isOccupied', true] }, 1, 0] }
            }
          }
        },
        {
          $addFields: {
            occupancyRate: {
              $multiply: [
                { $divide: ['$occupiedBeds', '$totalBeds'] },
                100
              ]
            }
          }
        },
        { $sort: { _id: 1 } }
      ]);

      // Monthly occupancy trend
      let monthlyOccupancy = [];
      if (startDate && endDate) {
        const start = moment(startDate);
        const end = moment(endDate);
        
        while (start.isSameOrBefore(end, 'month')) {
          const monthStart = start.clone().startOf('month').toDate();
          const monthEnd = start.clone().endOf('month').toDate();
          
          const occupiedInMonth = await Bed.countDocuments({
            hostel: hostel._id,
            isOccupied: true,
            occupiedFrom: { $lte: monthEnd },
            $or: [
              { occupiedTill: { $gte: monthStart } },
              { occupiedTill: null }
            ]
          });

          monthlyOccupancy.push({
            month: start.format('YYYY-MM'),
            occupiedBeds: occupiedInMonth,
            totalBeds,
            occupancyRate: totalBeds > 0 ? ((occupiedInMonth / totalBeds) * 100).toFixed(2) : 0
          });

          start.add(1, 'month');
        }
      }

      return {
        hostelId: hostel._id,
        hostelName: hostel.name,
        totalBeds,
        occupiedBeds,
        availableBeds: totalBeds - occupiedBeds,
        occupancyRate: totalBeds > 0 ? ((occupiedBeds / totalBeds) * 100).toFixed(2) : 0,
        floorWiseOccupancy,
        monthlyOccupancy
      };
    })
  );

  res.status(200).json(new ApiResponse(200, occupancyData, 'Occupancy report generated successfully'));
});

const getMaintenanceReport = asyncHandler(async (req, res) => {
  const { hostelId, startDate, endDate } = req.query;

  let hostelFilter = { owner: req.user.id };
  if (hostelId) hostelFilter._id = hostelId;

  const hostels = await Hostel.find(hostelFilter);
  const hostelIds = hostels.map(h => h._id);

  let matchFilter = { hostel: { $in: hostelIds } };

  // Only apply date filter if BOTH startDate and endDate are provided
  if (startDate && endDate) {
    matchFilter.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }

  // Status-wise breakdown
  const statusBreakdown = await Maintenance.aggregate([
    { $match: matchFilter },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalCost: { $sum: '$actualCost' }
      }
    }
  ]);

  // Category-wise breakdown
  const categoryBreakdown = await Maintenance.aggregate([
    { $match: matchFilter },
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        totalCost: { $sum: '$actualCost' },
        avgCost: { $avg: '$actualCost' }
      }
    },
    { $sort: { count: -1 } }
  ]);

  // Priority-wise breakdown
  const priorityBreakdown = await Maintenance.aggregate([
    { $match: matchFilter },
    {
      $group: {
        _id: '$priority',
        count: { $sum: 1 },
        avgResolutionTime: {
          $avg: {
            $subtract: ['$completedAt', '$createdAt']
          }
        }
      }
    }
  ]);

  // Monthly trend
  const monthlyTrend = await Maintenance.aggregate([
    { $match: matchFilter },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        },
        totalRequests: { $sum: 1 },
        completedRequests: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
        },
        totalCost: { $sum: '$actualCost' }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } }
  ]);

  // Hostel-wise maintenance
  const hostelWiseMaintenance = await Maintenance.aggregate([
    { $match: matchFilter },
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
        totalRequests: { $sum: 1 },
        completedRequests: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
        },
        totalCost: { $sum: '$actualCost' },
        avgRating: { $avg: '$rating' }
      }
    },
    { $sort: { totalRequests: -1 } }
  ]);

  // Calculate totals from status breakdown
  const totals = statusBreakdown.reduce((acc, item) => {
    acc.totalRequests += item.count;
    acc.totalCost += item.totalCost || 0;
    if (item._id === 'pending') acc.pendingRequests = item.count;
    if (item._id === 'assigned') acc.assignedRequests = item.count;
    if (item._id === 'in_progress') acc.inProgressRequests = item.count;
    if (item._id === 'completed') acc.completedRequests = item.count;
    return acc;
  }, { totalRequests: 0, pendingRequests: 0, assignedRequests: 0, inProgressRequests: 0, completedRequests: 0, totalCost: 0 });

  // Calculate completion rate and average rating
  const completionRate = totals.totalRequests > 0 
    ? ((totals.completedRequests / totals.totalRequests) * 100).toFixed(2) 
    : 0;

  const avgRatingData = await Maintenance.aggregate([
    { $match: { ...matchFilter, rating: { $exists: true, $ne: null } } },
    { $group: { _id: null, avgRating: { $avg: '$rating' } } }
  ]);

  const averageRating = avgRatingData[0]?.avgRating?.toFixed(1) || 0;

  // Calculate average response time (in hours)
  const responseTimeData = await Maintenance.aggregate([
    { 
      $match: { 
        ...matchFilter, 
        assignedAt: { $exists: true },
        createdAt: { $exists: true }
      } 
    },
    {
      $project: {
        responseTime: {
          $divide: [
            { $subtract: ['$assignedAt', '$createdAt'] },
            1000 * 60 * 60 // Convert to hours
          ]
        }
      }
    },
    {
      $group: {
        _id: null,
        avgResponseTime: { $avg: '$responseTime' }
      }
    }
  ]);

  const averageResponseTime = responseTimeData[0]?.avgResponseTime?.toFixed(1) || 0;

  const responseData = {
    ...totals,
    completionRate: Number(completionRate),
    averageRating: Number(averageRating),
    averageResponseTime: Number(averageResponseTime),
    categoryWise: categoryBreakdown,
    statusBreakdown,
    priorityBreakdown,
    monthlyTrend,
    hostelWiseMaintenance
  };

  res.status(200).json(new ApiResponse(200, responseData, 'Maintenance report generated successfully'));
});

const getStudentReport = asyncHandler(async (req, res) => {
  const { hostelId } = req.query;

  let hostelFilter;
  let hostelIds;

  if (req.user.role === 'owner') {
    hostelFilter = { owner: req.user.id };
    if (hostelId) hostelFilter._id = hostelId;
    const hostels = await Hostel.find(hostelFilter);
    hostelIds = hostels.map(h => h._id);
  } else if (req.user.role === 'staff') {
    // Staff can only see students from their assigned hostel
    const staff = await User.findById(req.user.id);
    if (!staff || !staff.hostel) {
      return res.status(200).json(new ApiResponse(200, {
        students: [],
        totalStudents: 0,
        activeStudents: 0,
        totalRevenue: 0,
        pendingPayments: 0,
        monthlyCheckIns: [],
        studentPaymentStatus: []
      }, 'No assigned hostel found'));
    }
    hostelIds = [staff.hostel];
  }

  // Get confirmed bookings (students who paid)
  const confirmedBookings = await Booking.find({
    hostel: { $in: hostelIds },
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

  // Student check-ins by month
  const monthlyCheckIns = await Booking.aggregate([
    {
      $match: {
        hostel: { $in: hostelIds },
        status: 'confirmed',
        actualCheckIn: { $exists: true }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$actualCheckIn' },
          month: { $month: '$actualCheckIn' }
        },
        checkIns: { $sum: 1 }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } }
  ]);

  // Payment status of current students
  const studentPaymentStatus = await Payment.aggregate([
    {
      $match: {
        hostel: { $in: hostelIds },
        paymentType: 'monthly'
      }
    },
    {
      $group: {
        _id: '$student',
        totalPaid: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, '$amount', 0] }
        },
        totalPending: {
          $sum: { $cond: [{ $eq: ['$status', 'pending'] }, '$amount', 0] }
        },
        lastPayment: { $max: '$paidAt' }
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'student'
      }
    },
    { $unwind: '$student' },
    {
      $project: {
        studentName: '$student.name',
        studentEmail: '$student.email',
        totalPaid: 1,
        totalPending: 1,
        lastPayment: 1
      }
    }
  ]);

  // Calculate stats
  const totalRevenue = await Payment.aggregate([
    {
      $match: {
        hostel: { $in: hostelIds },
        status: 'completed'
      }
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$amount' }
      }
    }
  ]);

  const pendingPayments = await Payment.countDocuments({
    hostel: { $in: hostelIds },
    status: 'pending'
  });

  res.status(200).json(new ApiResponse(200, {
    students: currentStudents,
    totalStudents: currentStudents.length,
    activeStudents: currentStudents.filter(s => s.status === 'active').length,
    totalRevenue: totalRevenue[0]?.total || 0,
    pendingPayments,
    monthlyCheckIns,
    studentPaymentStatus
  }, 'Student report generated successfully'));
});

const exportReport = asyncHandler(async (req, res) => {
  const { reportType, format = 'json', ...filters } = req.query;

  let reportData = {};

  switch (reportType) {
    case 'revenue':
      reportData = await getRevenueReport(req, res);
      break;
    case 'occupancy':
      reportData = await getOccupancyReport(req, res);
      break;
    case 'maintenance':
      reportData = await getMaintenanceReport(req, res);
      break;
    case 'students':
      reportData = await getStudentReport(req, res);
      break;
    default:
      return res.status(400).json(new ApiResponse(400, null, 'Invalid report type'));
  }

  // For now, return JSON. In production, you might want to generate CSV/PDF
  res.status(200).json(new ApiResponse(200, reportData, `${reportType} report exported successfully`));
});

module.exports = {
  getOwnerDashboard,
  getRevenueReport,
  getOccupancyReport,
  getMaintenanceReport,
  getStudentReport,
  exportReport
};