const mongoose = require('mongoose');
const Room = require('../src/models/Room');
const Hostel = require('../src/models/Hostel');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI);

async function addMissingRooms() {
  try {
    // Get all hostels that need room fixes
    const hostels = await Hostel.find({});
    
    for (const hostel of hostels) {
      console.log(`\n🏨 Processing hostel: ${hostel.name}`);
      console.log(`Structure: ${hostel.structure.totalFloors} floors × ${hostel.structure.roomsPerFloor} rooms`);

      // Get existing rooms for this hostel
      const existingRooms = await Room.find({ hostel: hostel._id });
      const existingRoomNumbers = existingRooms.map(room => room.roomNumber);
      
      console.log(`Existing rooms (${existingRooms.length}): ${existingRoomNumbers.sort((a,b) => a-b).join(', ')}`);

      let addedCount = 0;
      const expectedTotal = hostel.structure.totalFloors * hostel.structure.roomsPerFloor;

      // Generate all expected room numbers
      for (let floor = 1; floor <= hostel.structure.totalFloors; floor++) {
        for (let roomNum = 1; roomNum <= hostel.structure.roomsPerFloor; roomNum++) {
          const roomNumber = floor * 100 + roomNum; // 101, 102, 103, 104, 201, etc.
          
          // Check if room already exists
          if (!existingRoomNumbers.includes(roomNumber)) {
            const newRoom = new Room({
              roomNumber: roomNumber,
              floorNumber: floor,
              roomType: hostel.structure.roomType || 'single',
              totalBeds: hostel.structure.bedsPerRoom || 1,
              occupiedBeds: 0,
              availableBeds: hostel.structure.bedsPerRoom || 1,
              monthlyRent: hostel.pricing.monthlyRent || 0,
              attachedBathroom: hostel.structure.attachedBathroom || false,
              isActive: true,
              isFull: false,
              hostel: hostel._id,
              amenities: hostel.amenities || []
            });

            await newRoom.save();
            console.log(`✅ Added room ${roomNumber}`);
            addedCount++;
          }
        }
      }

      console.log(`🎉 Added ${addedCount} missing rooms for ${hostel.name}`);
      console.log(`Total rooms now: ${existingRooms.length + addedCount}/${expectedTotal}`);
    }
    
  } catch (error) {
    console.error('❌ Error adding rooms:', error);
  } finally {
    mongoose.connection.close();
    console.log('\n✅ Database connection closed');
  }
}

// Run the script
console.log('🚀 Starting room creation script...');
addMissingRooms();