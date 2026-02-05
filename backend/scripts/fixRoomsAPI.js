// Add this to your backend routes (e.g., in routes/admin.js or create new route)

const express = require('express');
const router = express.Router();
const Room = require('../models/Room');
const Hostel = require('../models/Hostel');

// POST /api/admin/fix-rooms
router.post('/fix-rooms', async (req, res) => {
  try {
    const hostels = await Hostel.find({});
    let totalAdded = 0;
    
    for (const hostel of hostels) {
      const existingRooms = await Room.find({ hostel: hostel._id });
      const existingRoomNumbers = existingRooms.map(room => room.roomNumber);
      
      let addedCount = 0;
      
      // Generate missing rooms
      for (let floor = 1; floor <= hostel.structure.totalFloors; floor++) {
        for (let roomNum = 1; roomNum <= hostel.structure.roomsPerFloor; roomNum++) {
          const roomNumber = floor * 100 + roomNum;
          
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
            addedCount++;
            totalAdded++;
          }
        }
      }
      
      console.log(`Added ${addedCount} rooms for ${hostel.name}`);
    }
    
    res.json({
      success: true,
      message: `Successfully added ${totalAdded} missing rooms`,
      totalAdded
    });
    
  } catch (error) {
    console.error('Error fixing rooms:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fix rooms',
      error: error.message
    });
  }
});

module.exports = router;