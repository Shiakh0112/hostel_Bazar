const Hostel = require('../models/Hostel.model');
const Booking = require('../models/Booking.model');
const Payment = require('../models/Payment.model');
const Maintenance = require('../models/Maintenance.model');
const Bed = require('../models/Bed.model');
const User = require('../models/User.model');
const moment = require('moment');

class ReportService {
  static async generateDashboardData(ownerId, filters = {}) {
    try {
      const { hostelId, period = '30' } = filters;
      
      // Get owner's hostels
      let hostelFilter = { owner: ownerId };
      if (hostelId) hostelFilter._id = hostelId;

      const hostels = await Hostel.find(hostelFilter);
      const hostelIds = hostels.map(h => h._id);

      const startDate = moment().subtract(Number(period), 'days').toDate();

      // Basic metrics
      const metrics = await this.getBasicMetrics(hostelIds, startDate);
      
      // Revenue data
      const revenueData = await this.getRevenueData(hostelIds, startDate);
      
      // Occupancy data
      const occupancyData = await this.getOccupancyData(hostelIds);
      
      // Booking trends
      const bookingTrends = await this.getBookingTrends(hostelIds, startDate);
      
      // Maintenance overview
      const maintenanceOverview = await this.getMaintenanceOverview(hostelIds, startDate);

      return {
        success: true,
        data: {
          metrics,
          revenue: revenueData,
          occupancy: occupancyData,
          bookings: bookingTrends,
          maintenance: maintenanceOverview,
          period: Number(period),
          hostels: hostels.length
        }
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  static async getBasicMetrics(hostelIds, startDate) {
    const totalBeds = await Bed.countDocuments({ hostel: { $in: hostelIds } });
    const occupiedBeds = await Bed.countDocuments({ 
      hostel: { $in: hostelIds }, 
      isOccupied: true 
    });
    
    const totalBookings = await Booking.countDocuments({ 
      hostel: { $in: hostelIds },
      createdAt: { $gte: startDate }
    });
    
    const pendingBookings = await Booking.countDocuments({ 
      hostel: { $in: hostelIds },
      status: 'pending'
    });

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
          totalPayments: { $sum: 1 }
        }
      }
    ]);

    const revenue = revenueStats[0] || { totalRevenue: 0, totalPayments: 0 };

    return {
      totalBeds,
      occupiedBeds,
      availableBeds: totalBeds - occupiedBeds,
      occupancyRate: totalBeds > 0 ? ((occupiedBeds / totalBeds) * 100).toFixed(2) : 0,
      totalBookings,
      pendingBookings,
      totalRevenue: revenue.totalRevenue,
      totalPayments: revenue.totalPayments
    };
  }

  static async getRevenueData(hostelIds, startDate) {
    // Monthly revenue trend
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
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Payment type breakdown
    const paymentTypeBreakdown = await Payment.aggregate([
      {
        $match: {
          hostel: { $in: hostelIds },
          status: 'completed',
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$paymentType',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    return {
      monthlyTrend: monthlyRevenue,
      paymentTypes: paymentTypeBreakdown
    };
  }

  static async getOccupancyData(hostelIds) {
    const occupancyByHostel = await Promise.all(
      hostelIds.map(async (hostelId) => {
        const hostel = await Hostel.findById(hostelId);
        const totalBeds = await Bed.countDocuments({ hostel: hostelId });
        const occupiedBeds = await Bed.countDocuments({ 
          hostel: hostelId, 
          isOccupied: true 
        });

        return {
          hostelId,
          hostelName: hostel.name,
          totalBeds,
          occupiedBeds,
          occupancyRate: totalBeds > 0 ? ((occupiedBeds / totalBeds) * 100).toFixed(2) : 0
        };
      })
    );

    return {
      byHostel: occupancyByHostel
    };
  }

  static async getBookingTrends(hostelIds, startDate) {
    // Daily booking trend
    const dailyBookings = await Booking.aggregate([
      {
        $match: {
          hostel: { $in: hostelIds },
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Status breakdown
    const statusBreakdown = await Booking.aggregate([
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

    return {
      dailyTrend: dailyBookings,
      statusBreakdown
    };
  }

  static async getMaintenanceOverview(hostelIds, startDate) {
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
          count: { $sum: 1 },
          totalCost: { $sum: '$actualCost' }
        }
      }
    ]);

    const categoryBreakdown = await Maintenance.aggregate([
      {
        $match: {
          hostel: { $in: hostelIds },
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalCost: { $sum: '$actualCost' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    return {
      statusBreakdown: maintenanceStats,
      categoryBreakdown
    };
  }

  static async generateDetailedReport(ownerId, reportType, filters = {}) {
    try {
      let reportData = {};

      switch (reportType) {
        case 'revenue':
          reportData = await this.generateRevenueReport(ownerId, filters);
          break;
        case 'occupancy':
          reportData = await this.generateOccupancyReport(ownerId, filters);
          break;
        case 'maintenance':
          reportData = await this.generateMaintenanceReport(ownerId, filters);
          break;
        case 'students':
          reportData = await this.generateStudentReport(ownerId, filters);
          break;
        case 'performance':
          reportData = await this.generatePerformanceReport(ownerId, filters);
          break;
        default:
          throw new Error('Invalid report type');
      }

      return {
        success: true,
        reportType,
        generatedAt: new Date(),
        filters,
        data: reportData
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  static async generateRevenueReport(ownerId, filters) {
    const { hostelId, startDate, endDate, groupBy = 'month' } = filters;

    let hostelFilter = { owner: ownerId };
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

    // Revenue by time period
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
    }

    const revenueByPeriod = await Payment.aggregate([
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

    // Revenue by hostel
    const revenueByHostel = await Payment.aggregate([
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
          totalPayments: { $sum: 1 },
          avgPayment: { $avg: '$amount' }
        }
      },
      { $sort: { totalRevenue: -1 } }
    ]);

    return {
      summary: {
        totalRevenue: revenueByPeriod.reduce((sum, item) => sum + item.totalRevenue, 0),
        totalPayments: revenueByPeriod.reduce((sum, item) => sum + item.totalPayments, 0)
      },
      byPeriod: revenueByPeriod,
      byHostel: revenueByHostel
    };
  }

  static async generateOccupancyReport(ownerId, filters) {
    const { hostelId } = filters;

    let hostelFilter = { owner: ownerId };
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

        return {
          hostelId: hostel._id,
          hostelName: hostel.name,
          totalBeds,
          occupiedBeds,
          availableBeds: totalBeds - occupiedBeds,
          occupancyRate: totalBeds > 0 ? ((occupiedBeds / totalBeds) * 100).toFixed(2) : 0,
          floorWiseOccupancy
        };
      })
    );

    return {
      hostels: occupancyData,
      overall: {
        totalBeds: occupancyData.reduce((sum, h) => sum + h.totalBeds, 0),
        occupiedBeds: occupancyData.reduce((sum, h) => sum + h.occupiedBeds, 0)
      }
    };
  }

  static async generateMaintenanceReport(ownerId, filters) {
    const { hostelId, startDate, endDate } = filters;

    let hostelFilter = { owner: ownerId };
    if (hostelId) hostelFilter._id = hostelId;

    const hostels = await Hostel.find(hostelFilter);
    const hostelIds = hostels.map(h => h._id);

    let matchFilter = { hostel: { $in: hostelIds } };

    if (startDate && endDate) {
      matchFilter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const maintenanceStats = await Maintenance.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: null,
          totalRequests: { $sum: 1 },
          completedRequests: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          totalCost: { $sum: '$actualCost' },
          avgCost: { $avg: '$actualCost' },
          avgRating: { $avg: '$rating' }
        }
      }
    ]);

    const categoryBreakdown = await Maintenance.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalCost: { $sum: '$actualCost' },
          avgCost: { $avg: '$actualCost' },
          completedCount: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          }
        }
      },
      { $sort: { count: -1 } }
    ]);

    return {
      overview: maintenanceStats[0] || {
        totalRequests: 0,
        completedRequests: 0,
        totalCost: 0,
        avgCost: 0,
        avgRating: 0
      },
      categoryBreakdown
    };
  }

  static async generateStudentReport(ownerId, filters) {
    const { hostelId } = filters;

    let hostelFilter = { owner: ownerId };
    if (hostelId) hostelFilter._id = hostelId;

    const hostels = await Hostel.find(hostelFilter);
    const hostelIds = hostels.map(h => h._id);

    // Current students
    const currentStudents = await Bed.aggregate([
      {
        $match: {
          hostel: { $in: hostelIds },
          isOccupied: true
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'occupant',
          foreignField: '_id',
          as: 'student'
        }
      },
      { $unwind: '$student' },
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
        $project: {
          studentId: '$student._id',
          studentName: '$student.name',
          studentEmail: '$student.email',
          studentMobile: '$student.mobile',
          hostelName: '$hostelInfo.name',
          roomNumber: 1,
          bedNumber: 1,
          occupiedFrom: 1,
          monthlyRent: 1
        }
      }
    ]);

    return {
      currentStudents,
      totalCurrentStudents: currentStudents.length
    };
  }

  static async generatePerformanceReport(ownerId, filters) {
    const dashboardData = await this.generateDashboardData(ownerId, filters);
    
    if (!dashboardData.success) {
      throw new Error('Failed to generate performance data');
    }

    const { metrics, revenue, occupancy } = dashboardData.data;

    // Calculate performance indicators
    const performanceScore = this.calculatePerformanceScore(metrics);
    const recommendations = this.generateRecommendations(metrics, revenue, occupancy);

    return {
      performanceScore,
      metrics,
      recommendations,
      trends: {
        occupancyTrend: metrics.occupancyRate > 80 ? 'excellent' : 
                       metrics.occupancyRate > 60 ? 'good' : 'needs_improvement',
        revenueTrend: revenue.monthlyTrend.length > 1 ? 
                     this.calculateTrend(revenue.monthlyTrend) : 'stable'
      }
    };
  }

  static calculatePerformanceScore(metrics) {
    let score = 0;
    
    // Occupancy rate (40% weight)
    score += (metrics.occupancyRate / 100) * 40;
    
    // Revenue per bed (30% weight)
    const revenuePerBed = metrics.totalBeds > 0 ? metrics.totalRevenue / metrics.totalBeds : 0;
    score += Math.min(revenuePerBed / 5000, 1) * 30; // Assuming 5000 as benchmark
    
    // Booking conversion (30% weight)
    const conversionRate = metrics.totalBookings > 0 ? 
      ((metrics.totalBookings - metrics.pendingBookings) / metrics.totalBookings) : 0;
    score += conversionRate * 30;

    return Math.round(score);
  }

  static generateRecommendations(metrics, revenue, occupancy) {
    const recommendations = [];

    if (metrics.occupancyRate < 70) {
      recommendations.push({
        type: 'occupancy',
        priority: 'high',
        message: 'Low occupancy rate. Consider marketing campaigns or pricing adjustments.'
      });
    }

    if (metrics.pendingBookings > 5) {
      recommendations.push({
        type: 'bookings',
        priority: 'medium',
        message: 'Multiple pending bookings. Review and process them quickly.'
      });
    }

    if (revenue.paymentTypes.length === 0) {
      recommendations.push({
        type: 'revenue',
        priority: 'low',
        message: 'No recent payments. Follow up on outstanding dues.'
      });
    }

    return recommendations;
  }

  static calculateTrend(data) {
    if (data.length < 2) return 'stable';
    
    const recent = data.slice(-3);
    const older = data.slice(-6, -3);
    
    const recentAvg = recent.reduce((sum, item) => sum + item.revenue, 0) / recent.length;
    const olderAvg = older.reduce((sum, item) => sum + item.revenue, 0) / older.length;
    
    if (recentAvg > olderAvg * 1.1) return 'increasing';
    if (recentAvg < olderAvg * 0.9) return 'decreasing';
    return 'stable';
  }
}

module.exports = ReportService;