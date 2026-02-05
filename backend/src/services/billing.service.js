const Invoice = require('../models/Invoice.model');
const Booking = require('../models/Booking.model');
const Hostel = require('../models/Hostel.model');
const Payment = require('../models/Payment.model');
const moment = require('moment');

class BillingService {
  static async generateMonthlyInvoices(hostelId, month, year) {
    try {
      const hostel = await Hostel.findById(hostelId);
      if (!hostel) {
        throw new Error('Hostel not found');
      }

      // Get all confirmed bookings for the hostel
      const bookings = await Booking.find({
        hostel: hostelId,
        status: 'confirmed',
        actualCheckIn: { $exists: true }
      }).populate('student allocatedBed');

      const invoices = [];
      const errors = [];

      for (const booking of bookings) {
        try {
          // Check if invoice already exists
          const existingInvoice = await Invoice.findOne({
            student: booking.student._id,
            hostel: hostelId,
            booking: booking._id,
            month,
            year
          });

          if (existingInvoice) {
            continue; // Skip if invoice already exists
          }

          // Calculate invoice items
          const items = [];
          let subtotal = 0;

          // Monthly rent
          const monthlyRent = booking.allocatedBed?.monthlyRent || hostel.pricing.monthlyRent;
          items.push({
            description: 'Monthly Rent',
            amount: monthlyRent,
            type: 'rent'
          });
          subtotal += monthlyRent;

          // Check for completed maintenance requests in this month
          const Maintenance = require('../models/Maintenance.model');
          const startOfMonth = new Date(year, month - 1, 1);
          const endOfMonth = new Date(year, month, 0, 23, 59, 59);
          
          const completedMaintenance = await Maintenance.find({
            hostel: hostelId,
            student: booking.student._id,
            status: 'completed',
            completedAt: {
              $gte: startOfMonth,
              $lte: endOfMonth
            }
          });

          // Add maintenance charges only if there were completed maintenance requests
          if (completedMaintenance.length > 0 && hostel.pricing.maintenanceCharges > 0) {
            const totalMaintenanceCost = completedMaintenance.reduce((sum, maintenance) => {
              return sum + (maintenance.actualCost || 0);
            }, 0);
            
            // Use actual cost if available, otherwise use standard maintenance charges
            const maintenanceAmount = totalMaintenanceCost > 0 ? totalMaintenanceCost : hostel.pricing.maintenanceCharges;
            
            items.push({
              description: `Maintenance Charges (${completedMaintenance.length} requests)`,
              amount: maintenanceAmount,
              type: 'maintenance',
              details: completedMaintenance.map(m => ({
                ticketNumber: m.ticketNumber,
                title: m.title,
                cost: m.actualCost || 0
              }))
            });
            subtotal += maintenanceAmount;
          }

          // Always add electricity charges
          if (hostel.pricing.electricityCharges > 0) {
            items.push({
              description: 'Electricity Charges',
              amount: hostel.pricing.electricityCharges,
              type: 'electricity'
            });
            subtotal += hostel.pricing.electricityCharges;
          }

          // Calculate due date (15th of next month)
          const dueDate = moment(`${year}-${month}-01`).add(1, 'month').date(15).toDate();

          // Create invoice
          const invoice = await Invoice.create({
            student: booking.student._id,
            hostel: hostelId,
            booking: booking._id,
            month,
            year,
            items,
            subtotal,
            totalAmount: subtotal,
            dueDate
          });

          invoices.push(invoice);
        } catch (error) {
          errors.push({
            bookingId: booking._id,
            studentName: booking.student.name,
            error: error.message
          });
        }
      }

      return {
        success: true,
        generated: invoices.length,
        errors: errors.length,
        invoices,
        errors
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  static async calculateLateFee(invoiceId) {
    try {
      const invoice = await Invoice.findById(invoiceId);
      if (!invoice) {
        throw new Error('Invoice not found');
      }

      if (invoice.status === 'paid') {
        return 0; // No late fee for paid invoices
      }

      const currentDate = new Date();
      const dueDate = new Date(invoice.dueDate);

      if (currentDate <= dueDate) {
        return 0; // No late fee before due date
      }

      const daysLate = Math.ceil((currentDate - dueDate) / (1000 * 60 * 60 * 24));
      
      // Calculate late fee: 2% of total amount for first 7 days, then 1% per day
      let lateFee = 0;
      if (daysLate <= 7) {
        lateFee = invoice.totalAmount * 0.02; // 2% for first week
      } else {
        lateFee = invoice.totalAmount * 0.02; // 2% for first week
        lateFee += (daysLate - 7) * (invoice.totalAmount * 0.01); // 1% per day after
      }

      // Cap late fee at 50% of original amount
      const maxLateFee = invoice.totalAmount * 0.5;
      lateFee = Math.min(lateFee, maxLateFee);

      return Math.round(lateFee);
    } catch (error) {
      throw new Error('Failed to calculate late fee');
    }
  }

  static async updateInvoiceWithLateFee(invoiceId) {
    try {
      const invoice = await Invoice.findById(invoiceId);
      if (!invoice) {
        throw new Error('Invoice not found');
      }

      const lateFee = await this.calculateLateFee(invoiceId);
      
      if (lateFee > 0 && lateFee !== invoice.lateFee) {
        invoice.lateFee = lateFee;
        invoice.totalAmount = invoice.subtotal - invoice.discount + invoice.lateFee;
        await invoice.save();
      }

      return invoice;
    } catch (error) {
      throw new Error('Failed to update late fee');
    }
  }

  static async markInvoiceAsPaid(invoiceId, paymentId) {
    try {
      const invoice = await Invoice.findById(invoiceId);
      if (!invoice) {
        throw new Error('Invoice not found');
      }

      invoice.status = 'paid';
      invoice.paidAt = new Date();
      invoice.paymentId = paymentId;
      await invoice.save();

      return invoice;
    } catch (error) {
      throw new Error('Failed to mark invoice as paid');
    }
  }

  static async getInvoiceStats(hostelId, startDate, endDate) {
    try {
      let matchFilter = { hostel: hostelId };

      if (startDate && endDate) {
        matchFilter.createdAt = {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        };
      }

      const stats = await Invoice.aggregate([
        { $match: matchFilter },
        {
          $group: {
            _id: null,
            totalInvoices: { $sum: 1 },
            totalAmount: { $sum: '$totalAmount' },
            paidInvoices: {
              $sum: { $cond: [{ $eq: ['$status', 'paid'] }, 1, 0] }
            },
            paidAmount: {
              $sum: { $cond: [{ $eq: ['$status', 'paid'] }, '$totalAmount', 0] }
            },
            pendingInvoices: {
              $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
            },
            pendingAmount: {
              $sum: { $cond: [{ $eq: ['$status', 'pending'] }, '$totalAmount', 0] }
            },
            overdueInvoices: {
              $sum: { $cond: [{ $eq: ['$status', 'overdue'] }, 1, 0] }
            },
            overdueAmount: {
              $sum: { $cond: [{ $eq: ['$status', 'overdue'] }, '$totalAmount', 0] }
            },
            totalLateFees: { $sum: '$lateFee' }
          }
        }
      ]);

      const monthlyStats = await Invoice.aggregate([
        { $match: matchFilter },
        {
          $group: {
            _id: {
              year: '$year',
              month: '$month'
            },
            invoiceCount: { $sum: 1 },
            totalAmount: { $sum: '$totalAmount' },
            paidAmount: {
              $sum: { $cond: [{ $eq: ['$status', 'paid'] }, '$totalAmount', 0] }
            }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ]);

      return {
        overview: stats[0] || {
          totalInvoices: 0,
          totalAmount: 0,
          paidInvoices: 0,
          paidAmount: 0,
          pendingInvoices: 0,
          pendingAmount: 0,
          overdueInvoices: 0,
          overdueAmount: 0,
          totalLateFees: 0
        },
        monthlyBreakdown: monthlyStats
      };
    } catch (error) {
      throw new Error('Failed to fetch invoice statistics');
    }
  }

  static async processRecurringBilling() {
    try {
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1;
      const currentYear = currentDate.getFullYear();

      // Get all active hostels
      const hostels = await Hostel.find({ isActive: true });

      const results = [];

      for (const hostel of hostels) {
        const result = await this.generateMonthlyInvoices(
          hostel._id,
          currentMonth.toString().padStart(2, '0'),
          currentYear
        );
        
        results.push({
          hostelId: hostel._id,
          hostelName: hostel.name,
          ...result
        });
      }

      return {
        success: true,
        processedHostels: results.length,
        results
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  static async applyDiscount(invoiceId, discountAmount, reason) {
    try {
      const invoice = await Invoice.findById(invoiceId);
      if (!invoice) {
        throw new Error('Invoice not found');
      }

      if (invoice.status === 'paid') {
        throw new Error('Cannot apply discount to paid invoice');
      }

      invoice.discount = discountAmount;
      invoice.totalAmount = invoice.subtotal - invoice.discount + invoice.lateFee;
      invoice.notes = `Discount applied: ${reason}`;
      await invoice.save();

      return invoice;
    } catch (error) {
      throw new Error('Failed to apply discount');
    }
  }
}

module.exports = BillingService;