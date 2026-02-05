const cron = require('node-cron');
const BillingService = require('./billing.service');
const Hostel = require('../models/Hostel.model');

class CronService {
  static initializeCronJobs() {
    // Run monthly invoice generation on 1st of every month at 9:00 AM
    cron.schedule('0 9 1 * *', async () => {
      console.log('🔄 Running monthly invoice generation...');
      await this.generateMonthlyInvoices();
    });

    // Run late fee calculation daily at 6:00 AM
    cron.schedule('0 6 * * *', async () => {
      console.log('🔄 Running late fee calculation...');
      await this.calculateLateFees();
    });

    console.log('✅ Cron jobs initialized');
  }

  static async generateMonthlyInvoices() {
    try {
      const currentDate = new Date();
      const month = String(currentDate.getMonth() + 1).padStart(2, '0');
      const year = currentDate.getFullYear();

      console.log(`📅 Generating invoices for ${month}/${year}`);

      const hostels = await Hostel.find({ isActive: true });
      let totalGenerated = 0;
      let totalErrors = 0;

      for (const hostel of hostels) {
        try {
          const result = await BillingService.generateMonthlyInvoices(
            hostel._id,
            month,
            year
          );

          if (result.success) {
            totalGenerated += result.generated;
            totalErrors += result.errors.length;
            console.log(`✅ ${hostel.name}: Generated ${result.generated} invoices`);
          } else {
            console.error(`❌ ${hostel.name}: ${result.message}`);
            totalErrors++;
          }
        } catch (error) {
          console.error(`❌ Error generating invoices for ${hostel.name}:`, error.message);
          totalErrors++;
        }
      }

      console.log(`📊 Monthly invoice generation completed:`);
      console.log(`   - Total invoices generated: ${totalGenerated}`);
      console.log(`   - Total errors: ${totalErrors}`);

      return {
        success: true,
        totalGenerated,
        totalErrors
      };
    } catch (error) {
      console.error('❌ Monthly invoice generation failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  static async calculateLateFees() {
    try {
      const Invoice = require('../models/Invoice.model');
      
      // Get all pending invoices that are past due date
      const overdueInvoices = await Invoice.find({
        status: 'pending',
        dueDate: { $lt: new Date() }
      });

      let updatedCount = 0;

      for (const invoice of overdueInvoices) {
        try {
          const updatedInvoice = await BillingService.updateInvoiceWithLateFee(invoice._id);
          
          if (updatedInvoice.lateFee > 0) {
            // Update status to overdue
            updatedInvoice.status = 'overdue';
            await updatedInvoice.save();
            updatedCount++;
          }
        } catch (error) {
          console.error(`❌ Error calculating late fee for invoice ${invoice._id}:`, error.message);
        }
      }

      console.log(`📊 Late fee calculation completed: ${updatedCount} invoices updated`);

      return {
        success: true,
        updatedCount
      };
    } catch (error) {
      console.error('❌ Late fee calculation failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Manual trigger for testing
  static async triggerMonthlyInvoiceGeneration() {
    console.log('🔄 Manually triggering monthly invoice generation...');
    return await this.generateMonthlyInvoices();
  }

  static async triggerLateFeeCalculation() {
    console.log('🔄 Manually triggering late fee calculation...');
    return await this.calculateLateFees();
  }
}

module.exports = CronService;