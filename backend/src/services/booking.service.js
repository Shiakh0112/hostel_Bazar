const Booking = require('../models/Booking.model');
const Hostel = require('../models/Hostel.model');
const User = require('../models/User.model');
const emailService = require('./email.service');
const notificationService = require('./notification.service');

class BookingService {
  static async createBookingRequest(studentId, hostelId, bookingDetails) {
    try {
      const hostel = await Hostel.findById(hostelId).populate('owner');
      if (!hostel) {
        throw new Error('Hostel not found');
      }

      if (hostel.availableBeds === 0) {
        throw new Error('No beds available');
      }

      // Check for existing active booking
      const existingBooking = await Booking.findOne({
        student: studentId,
        hostel: hostelId,
        status: { $in: ['pending', 'approved', 'confirmed'] }
      });

      if (existingBooking) {
        throw new Error('You already have an active booking for this hostel');
      }

      const booking = await Booking.create({
        student: studentId,
        hostel: hostelId,
        owner: hostel.owner._id,
        bookingDetails
      });

      // Send notification to owner
      await notificationService.sendNotification({
        recipient: hostel.owner._id,
        type: 'booking_request',
        title: 'New Booking Request',
        message: `New booking request from ${bookingDetails.fullName} for ${hostel.name}`,
        data: { bookingId: booking._id, hostelId: hostel._id }
      });

      return {
        success: true,
        booking,
        message: 'Booking request submitted successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  static async approveBooking(bookingId, ownerId) {
    try {
      const booking = await Booking.findOne({ _id: bookingId, owner: ownerId })
        .populate('student')
        .populate('hostel');

      if (!booking) {
        throw new Error('Booking not found');
      }

      if (booking.status !== 'pending') {
        throw new Error('Booking already processed');
      }

      const hostel = booking.hostel;
      if (hostel.availableBeds === 0) {
        throw new Error('No beds available');
      }

      booking.status = 'approved';
      booking.approvalDetails = {
        approvedBy: ownerId,
        approvedAt: new Date()
      };
      booking.advancePayment.amount = hostel.pricing.monthlyRent;

      await booking.save();

      // Send notifications
      await Promise.all([
        notificationService.sendNotification({
          recipient: booking.student._id,
          type: 'booking_approved',
          title: 'Booking Approved',
          message: `Your booking request for ${hostel.name} has been approved. Please make advance payment.`,
          data: { bookingId: booking._id }
        }),
        emailService.sendBookingNotification(
          booking.student.email,
          booking.student.name,
          hostel.name,
          'approved'
        )
      ]);

      return {
        success: true,
        booking,
        message: 'Booking approved successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  static async rejectBooking(bookingId, ownerId, reason) {
    try {
      const booking = await Booking.findOne({ _id: bookingId, owner: ownerId })
        .populate('student')
        .populate('hostel');

      if (!booking) {
        throw new Error('Booking not found');
      }

      if (booking.status !== 'pending') {
        throw new Error('Booking already processed');
      }

      booking.status = 'rejected';
      booking.approvalDetails = {
        approvedBy: ownerId,
        approvedAt: new Date(),
        rejectionReason: reason
      };

      await booking.save();

      // Send notifications
      await Promise.all([
        notificationService.sendNotification({
          recipient: booking.student._id,
          type: 'booking_rejected',
          title: 'Booking Rejected',
          message: `Your booking request for ${booking.hostel.name} has been rejected. Reason: ${reason}`,
          data: { bookingId: booking._id }
        }),
        emailService.sendBookingNotification(
          booking.student.email,
          booking.student.name,
          booking.hostel.name,
          'rejected'
        )
      ]);

      return {
        success: true,
        booking,
        message: 'Booking rejected successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  static async getBookingStats(ownerId, hostelId = null) {
    try {
      let matchFilter = { owner: ownerId };
      if (hostelId) matchFilter.hostel = hostelId;

      const stats = await Booking.aggregate([
        { $match: matchFilter },
        {
          $group: {
            _id: null,
            totalBookings: { $sum: 1 },
            pendingBookings: {
              $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
            },
            approvedBookings: {
              $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] }
            },
            confirmedBookings: {
              $sum: { $cond: [{ $eq: ['$status', 'confirmed'] }, 1, 0] }
            },
            rejectedBookings: {
              $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] }
            }
          }
        }
      ]);

      return stats[0] || {
        totalBookings: 0,
        pendingBookings: 0,
        approvedBookings: 0,
        confirmedBookings: 0,
        rejectedBookings: 0
      };
    } catch (error) {
      throw new Error('Failed to fetch booking statistics');
    }
  }

  static async cancelBooking(bookingId, studentId) {
    try {
      const booking = await Booking.findOne({
        _id: bookingId,
        student: studentId,
        status: { $in: ['pending', 'approved'] }
      });

      if (!booking) {
        throw new Error('Booking not found or cannot be cancelled');
      }

      booking.status = 'cancelled';
      await booking.save();

      return {
        success: true,
        booking,
        message: 'Booking cancelled successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }
}

module.exports = BookingService;