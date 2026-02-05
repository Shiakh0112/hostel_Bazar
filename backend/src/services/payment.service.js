const Payment = require('../models/Payment.model');
const Booking = require('../models/Booking.model');
const Invoice = require('../models/Invoice.model');
const razorpay = require('../config/razorpay');
const crypto = require('crypto');
const emailService = require('./email.service');
const notificationService = require('./notification.service');
const billingService = require('./billing.service');

class PaymentService {
  static async createRazorpayOrder(amount, currency = 'INR', receipt = null) {
    try {
      const options = {
        amount: amount * 100, // Convert to paise
        currency,
        receipt: receipt || `payment_${Date.now()}`,
        payment_capture: 1
      };

      const order = await razorpay.orders.create(options);
      return {
        success: true,
        order
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  static verifyRazorpaySignature(orderId, paymentId, signature) {
    try {
      const body = orderId + '|' + paymentId;
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest('hex');

      return expectedSignature === signature;
    } catch (error) {
      return false;
    }
  }

  static async processPayment(paymentData) {
    try {
      const {
        studentId,
        hostelId,
        bookingId,
        invoiceId,
        paymentType,
        amount,
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature
      } = paymentData;

      // Verify signature
      const isValidSignature = this.verifyRazorpaySignature(
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature
      );

      if (!isValidSignature) {
        throw new Error('Invalid payment signature');
      }

      // Create payment record
      const payment = await Payment.create({
        student: studentId,
        hostel: hostelId,
        booking: bookingId,
        invoice: invoiceId,
        paymentType,
        amount,
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
        status: 'completed',
        paidAt: new Date()
      });

      // Update related records based on payment type
      if (paymentType === 'advance' && bookingId) {
        await this.handleAdvancePayment(bookingId, payment);
      } else if (paymentType === 'monthly' && invoiceId) {
        await this.handleMonthlyPayment(invoiceId, payment);
      }

      return {
        success: true,
        payment,
        message: 'Payment processed successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  static async handleAdvancePayment(bookingId, payment) {
    try {
      const booking = await Booking.findById(bookingId)
        .populate('student hostel');

      if (!booking) {
        throw new Error('Booking not found');
      }

      // Update booking payment status
      booking.advancePayment.status = 'paid';
      booking.advancePayment.paymentId = payment.razorpayPaymentId;
      booking.advancePayment.paidAt = payment.paidAt;
      await booking.save();

      // Send notifications
      await Promise.all([
        notificationService.sendNotification({
          recipient: booking.owner,
          type: 'payment_success',
          title: 'Payment Received',
          message: `Advance payment of ₹${payment.amount} received from ${booking.student.name}`,
          data: { bookingId: booking._id, paymentId: payment._id }
        }),
        emailService.sendPaymentNotification(
          booking.student.email,
          booking.student.name,
          payment.amount,
          'success'
        )
      ]);

      return {
        success: true,
        message: 'Advance payment processed successfully'
      };
    } catch (error) {
      throw new Error(`Failed to handle advance payment: ${error.message}`);
    }
  }

  static async handleMonthlyPayment(invoiceId, payment) {
    try {
      const invoice = await Invoice.findById(invoiceId)
        .populate('student hostel');

      if (!invoice) {
        throw new Error('Invoice not found');
      }

      // Mark invoice as paid
      await billingService.markInvoiceAsPaid(invoiceId, payment._id);

      // Send notifications
      await Promise.all([
        notificationService.sendNotification({
          recipient: invoice.student._id,
          type: 'payment_success',
          title: 'Payment Successful',
          message: `Monthly payment of ₹${payment.amount} processed successfully`,
          data: { invoiceId: invoice._id, paymentId: payment._id }
        }),
        emailService.sendPaymentNotification(
          invoice.student.email,
          invoice.student.name,
          payment.amount,
          'success'
        )
      ]);

      return {
        success: true,
        message: 'Monthly payment processed successfully'
      };
    } catch (error) {
      throw new Error(`Failed to handle monthly payment: ${error.message}`);
    }
  }

  static async getPaymentHistory(userId, role, filters = {}) {
    try {
      let matchFilter = {};

      if (role === 'student') {
        matchFilter.student = userId;
      } else if (role === 'owner') {
        // Get owner's hostels and filter payments
        const Hostel = require('../models/Hostel.model');
        const hostels = await Hostel.find({ owner: userId }).select('_id');
        matchFilter.hostel = { $in: hostels.map(h => h._id) };
      }

      // Apply additional filters
      if (filters.status) matchFilter.status = filters.status;
      if (filters.paymentType) matchFilter.paymentType = filters.paymentType;
      if (filters.startDate && filters.endDate) {
        matchFilter.createdAt = {
          $gte: new Date(filters.startDate),
          $lte: new Date(filters.endDate)
        };
      }

      const payments = await Payment.find(matchFilter)
        .populate('student', 'name email')
        .populate('hostel', 'name')
        .populate('booking', 'bookingDetails.fullName')
        .populate('invoice', 'invoiceNumber month year')
        .sort({ createdAt: -1 })
        .limit(filters.limit || 50);

      return {
        success: true,
        payments
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  static async generatePaymentStats(userId, role, period = '30') {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - Number(period));

      let matchFilter = {
        createdAt: { $gte: startDate }
      };

      if (role === 'student') {
        matchFilter.student = userId;
      } else if (role === 'owner') {
        const Hostel = require('../models/Hostel.model');
        const hostels = await Hostel.find({ owner: userId }).select('_id');
        matchFilter.hostel = { $in: hostels.map(h => h._id) };
      }

      const stats = await Payment.aggregate([
        { $match: matchFilter },
        {
          $group: {
            _id: null,
            totalPayments: { $sum: 1 },
            totalAmount: { $sum: '$amount' },
            completedPayments: {
              $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
            },
            completedAmount: {
              $sum: { $cond: [{ $eq: ['$status', 'completed'] }, '$amount', 0] }
            },
            pendingPayments: {
              $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
            },
            pendingAmount: {
              $sum: { $cond: [{ $eq: ['$status', 'pending'] }, '$amount', 0] }
            },
            failedPayments: {
              $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] }
            }
          }
        }
      ]);

      const typeBreakdown = await Payment.aggregate([
        { $match: matchFilter },
        {
          $group: {
            _id: '$paymentType',
            count: { $sum: 1 },
            totalAmount: { $sum: '$amount' }
          }
        }
      ]);

      const dailyStats = await Payment.aggregate([
        { $match: matchFilter },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
            },
            count: { $sum: 1 },
            amount: { $sum: '$amount' }
          }
        },
        { $sort: { _id: 1 } }
      ]);

      return {
        success: true,
        overview: stats[0] || {
          totalPayments: 0,
          totalAmount: 0,
          completedPayments: 0,
          completedAmount: 0,
          pendingPayments: 0,
          pendingAmount: 0,
          failedPayments: 0
        },
        typeBreakdown,
        dailyTrend: dailyStats
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  static async processRefund(paymentId, refundAmount, reason) {
    try {
      const payment = await Payment.findById(paymentId);
      if (!payment) {
        throw new Error('Payment not found');
      }

      if (payment.status !== 'completed') {
        throw new Error('Can only refund completed payments');
      }

      // Process refund through Razorpay
      const refund = await razorpay.payments.refund(payment.razorpayPaymentId, {
        amount: refundAmount * 100, // Convert to paise
        notes: { reason }
      });

      // Update payment status
      payment.status = 'refunded';
      await payment.save();

      return {
        success: true,
        refund,
        message: 'Refund processed successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }
}

module.exports = PaymentService;