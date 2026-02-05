const mongoose = require('mongoose');
const Hostel = require('../models/Hostel.model');

const addAdvancePaymentField = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hostel-management');
    
    console.log('Connected to MongoDB');
    
    // Find all hostels that don't have advancePayment field
    const hostels = await Hostel.find({
      'pricing.advancePayment': { $exists: false }
    });
    
    console.log(`Found ${hostels.length} hostels without advance payment field`);
    
    for (const hostel of hostels) {
      // Set advance payment to 3000 as default (you can change this)
      hostel.pricing.advancePayment = 3000;
      await hostel.save();
      console.log(`Updated ${hostel.name} - set advance payment to ₹3000`);
    }
    
    console.log('Migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

// Run if called directly
if (require.main === module) {
  addAdvancePaymentField();
}

module.exports = addAdvancePaymentField;