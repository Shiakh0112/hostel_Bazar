const Payment = require('../models/Payment.model');
const Hostel = require('../models/Hostel.model');
const moment = require('moment');

class LateFeeService {
  static async calculateLateFee(payment, hostel) {
    if (payment.status !== 'pending' || payment.lateFeeApplied) {
      return 0;
    }

    const dueDate = moment(payment.dueDate);
    const now = moment();
    
    if (!now.isAfter(dueDate)) {
      return 0; // Not overdue yet
    }

    const daysOverdue = now.diff(dueDate, 'days');
    const lateFeeSettings = hostel.lateFeeSettings || {
      enabled: true,
      type: 'fixed',
      amount: 100,
      gracePeriod: 3,
      maxLateFee: 1000
    };

    if (!lateFeeSettings.enabled || daysOverdue <= lateFeeSettings.gracePeriod) {
      return 0;
    }

    let lateFee = 0;
    
    if (lateFeeSettings.type === 'fixed') {
      lateFee = lateFeeSettings.amount;
    } else if (lateFeeSettings.type === 'percentage') {
      lateFee = (payment.amount * lateFeeSettings.percentage) / 100;
    } else if (lateFeeSettings.type === 'daily') {
      const effectiveDays = daysOverdue - lateFeeSettings.gracePeriod;
      lateFee = effectiveDays * lateFeeSettings.dailyAmount;
    }

    // Apply maximum late fee limit
    if (lateFeeSettings.maxLateFee && lateFee > lateFeeSettings.maxLateFee) {
      lateFee = lateFeeSettings.maxLateFee;
    }

    return Math.round(lateFee);
  }

  static async applyLateFees() {
    try {
      const overduePayments = await Payment.find({
        status: 'pending',
        dueDate: { $lt: new Date() },
        lateFeeApplied: false,
        paymentType: 'monthly'
      }).populate('hostel');

      const results = [];

      for (const payment of overduePayments) {
        const lateFee = await this.calculateLateFee(payment, payment.hostel);
        
        if (lateFee > 0) {
          payment.lateFee = lateFee;
          payment.lateFeeApplied = true;
          payment.isOverdue = true;
          payment.overdueDate = new Date();
          await payment.save();

          results.push({
            paymentId: payment._id,
            lateFeeApplied: lateFee,
            student: payment.student
          });
        }
      }

      return {
        success: true,
        processed: results.length,
        results
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  static async getOverduePayments(hostelIds) {
    return await Payment.find({
      hostel: { $in: hostelIds },
      status: 'pending',
      dueDate: { $lt: new Date() }
    })
    .populate('student', 'name email mobile')
    .populate('hostel', 'name')
    .sort({ dueDate: 1 });
  }
}

module.exports = LateFeeService;