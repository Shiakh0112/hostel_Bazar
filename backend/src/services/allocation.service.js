const Bed = require('../models/Bed.model');
const Room = require('../models/Room.model');
const Floor = require('../models/Floor.model');
const Hostel = require('../models/Hostel.model');

class AllocationService {
  static async allocateBed(hostelId, studentId, bookingId = null) {
    try {
      // Find the first available bed (lowest floor, lowest room, lowest bed number)
      const availableBed = await Bed.findOne({
        hostel: hostelId,
        isOccupied: false,
        isActive: true
      })
      .populate('room floor')
      .sort({ floorNumber: 1, roomNumber: 1, bedNumber: 1 });

      if (!availableBed) {
        return {
          success: false,
          message: 'No beds available'
        };
      }

      // Allocate the bed
      availableBed.isOccupied = true;
      availableBed.occupant = studentId;
      availableBed.booking = bookingId;
      availableBed.occupiedFrom = new Date();
      await availableBed.save();

      // Update room occupancy
      const room = await Room.findById(availableBed.room._id);
      room.occupiedBeds += 1;
      room.availableBeds -= 1;
      if (room.occupiedBeds >= room.totalBeds) {
        room.isFull = true;
      }
      await room.save();

      // Update floor occupancy
      const floor = await Floor.findById(availableBed.floor._id);
      floor.occupiedBeds += 1;
      floor.availableBeds -= 1;
      
      // Check if room is now full
      if (room.isFull) {
        floor.occupiedRooms += 1;
        floor.availableRooms -= 1;
      }
      await floor.save();

      // Update hostel occupancy
      const hostel = await Hostel.findById(hostelId);
      hostel.occupiedBeds += 1;
      hostel.availableBeds -= 1;
      await hostel.save();

      return {
        success: true,
        bed: availableBed._id,
        room: availableBed.room._id,
        roomNumber: availableBed.roomNumber,
        bedNumber: availableBed.bedNumber,
        floorNumber: availableBed.floorNumber,
        message: 'Bed allocated successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  static async deallocateBed(bedId) {
    try {
      const bed = await Bed.findById(bedId).populate('room floor hostel');
      
      if (!bed || !bed.isOccupied) {
        return {
          success: false,
          message: 'Bed not found or not occupied'
        };
      }

      // Deallocate the bed
      bed.isOccupied = false;
      bed.occupant = null;
      bed.booking = null;
      bed.occupiedFrom = null;
      bed.occupiedTill = new Date();
      await bed.save();

      // Update room occupancy
      const room = bed.room;
      room.occupiedBeds -= 1;
      room.availableBeds += 1;
      room.isFull = false;
      await room.save();

      // Update floor occupancy
      const floor = bed.floor;
      floor.occupiedBeds -= 1;
      floor.availableBeds += 1;
      
      // If room was full before, update room count
      if (room.occupiedBeds === room.totalBeds - 1) {
        floor.occupiedRooms -= 1;
        floor.availableRooms += 1;
      }
      await floor.save();

      // Update hostel occupancy
      const hostel = bed.hostel;
      hostel.occupiedBeds -= 1;
      hostel.availableBeds += 1;
      await hostel.save();

      return {
        success: true,
        message: 'Bed deallocated successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  static async getAvailabilityStats(hostelId) {
    try {
      const hostel = await Hostel.findById(hostelId);
      if (!hostel) {
        throw new Error('Hostel not found');
      }

      const totalBeds = await Bed.countDocuments({ hostel: hostelId });
      const occupiedBeds = await Bed.countDocuments({ 
        hostel: hostelId, 
        isOccupied: true 
      });
      const availableBeds = totalBeds - occupiedBeds;

      const totalRooms = await Room.countDocuments({ hostel: hostelId });
      const fullRooms = await Room.countDocuments({ 
        hostel: hostelId, 
        isFull: true 
      });
      const availableRooms = totalRooms - fullRooms;

      const totalFloors = await Floor.countDocuments({ hostel: hostelId });

      // Floor-wise availability
      const floorStats = await Floor.aggregate([
        { $match: { hostel: hostel._id } },
        {
          $project: {
            floorNumber: 1,
            totalBeds: 1,
            occupiedBeds: 1,
            availableBeds: 1,
            totalRooms: 1,
            occupiedRooms: 1,
            availableRooms: 1,
            occupancyRate: {
              $multiply: [
                { $divide: ['$occupiedBeds', '$totalBeds'] },
                100
              ]
            }
          }
        },
        { $sort: { floorNumber: 1 } }
      ]);

      const occupancyRate = totalBeds > 0 ? ((occupiedBeds / totalBeds) * 100).toFixed(2) : 0;

      return {
        success: true,
        data: {
          overall: {
            totalBeds,
            occupiedBeds,
            availableBeds,
            totalRooms,
            fullRooms,
            availableRooms,
            totalFloors,
            occupancyRate: Number(occupancyRate)
          },
          floorWise: floorStats
        }
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  static async findOptimalBed(hostelId, preferences = {}) {
    try {
      let query = {
        hostel: hostelId,
        isOccupied: false,
        isActive: true
      };

      // Add preference filters
      if (preferences.floorNumber) {
        query.floorNumber = preferences.floorNumber;
      }

      if (preferences.roomType) {
        const rooms = await Room.find({ 
          hostel: hostelId, 
          roomType: preferences.roomType 
        }).select('_id');
        query.room = { $in: rooms.map(r => r._id) };
      }

      const availableBeds = await Bed.find(query)
        .populate('room floor')
        .sort({ floorNumber: 1, roomNumber: 1, bedNumber: 1 });

      if (availableBeds.length === 0) {
        return {
          success: false,
          message: 'No beds available matching preferences'
        };
      }

      // Return the first (optimal) bed
      return {
        success: true,
        bed: availableBeds[0],
        alternatives: availableBeds.slice(1, 5) // Return up to 4 alternatives
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  static async transferBed(currentBedId, newBedId, studentId) {
    try {
      // Deallocate current bed
      const deallocationResult = await this.deallocateBed(currentBedId);
      if (!deallocationResult.success) {
        return deallocationResult;
      }

      // Allocate new bed
      const newBed = await Bed.findById(newBedId);
      if (!newBed || newBed.isOccupied) {
        // Re-allocate the old bed if new allocation fails
        await this.allocateBed(newBed.hostel, studentId);
        return {
          success: false,
          message: 'New bed not available'
        };
      }

      const allocationResult = await this.allocateBed(newBed.hostel, studentId);
      
      return {
        success: true,
        message: 'Bed transfer completed successfully',
        newBed: allocationResult
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }
}

module.exports = AllocationService;