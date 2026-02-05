const mongoose = require('mongoose');
const Payment = require('../models/Payment.model');
const Booking = require('../models/Booking.model');

const updateExistingPayments = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hostel-management');
    
    console.log('🔄 Updating existing monthly payments...');
    
    // Find all monthly payments that don't have breakdown
    const monthlyPayments = await Payment.find({
      paymentType: 'monthly',
      baseRent: { $exists: false }
    }).populate({
      path: 'booking',
      populate: {
        path: 'hostel',
        select: 'pricing'
      }
    });
    
    console.log(`Found ${monthlyPayments.length} payments to update`);
    
    for (const payment of monthlyPayments) {
      if (payment.booking && payment.booking.hostel) {
        const hostel = payment.booking.hostel;
        const monthlyRent = hostel.pricing.monthlyRent;
        const electricityCharges = hostel.pricing.electricityCharges || 0;
        const maintenanceCharges = hostel.pricing.maintenanceCharges || 0;
        
        // Update payment with breakdown
        payment.baseRent = monthlyRent;
        payment.electricityCharges = electricityCharges;
        payment.maintenanceCharges = maintenanceCharges;
        
        // Update total amount if needed
        const newTotal = monthlyRent + electricityCharges + maintenanceCharges;
        if (payment.amount !== newTotal) {
          payment.amount = newTotal;
        }
        
        await payment.save();
        console.log(`✅ Updated payment ${payment._id} - Total: ₹${newTotal}`);
      }
    }
    
    console.log('✅ All existing payments updated successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating payments:', error);
    process.exit(1);
  }
};

// Run if called directly
if (require.main === module) {
  updateExistingPayments();
}

module.exports = updateExistingPayments;