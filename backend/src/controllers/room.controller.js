const Room = require('../models/Room.model');
const Bed = require('../models/Bed.model');
const Floor = require('../models/Floor.model');
const Hostel = require('../models/Hostel.model');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/apiResponse');

const getHostelRooms = asyncHandler(async (req, res) => {
  const { hostelId } = req.params;
  const { floor, status, page = 1, limit = 20 } = req.query;

  const filter = { hostel: hostelId };
  if (floor) filter.floorNumber = Number(floor);

  const skip = (page - 1) * limit;

  const rooms = await Room.find(filter)
    .populate('floor', 'floorNumber')
    .sort({ floorNumber: 1, roomNumber: 1 })
    .skip(skip)
    .limit(Number(limit));

  // Get bed details for each room
  const roomsWithBeds = await Promise.all(
    rooms.map(async (room) => {
      const beds = await Bed.find({ room: room._id })
        .populate('occupant', 'name email mobile')
        .populate('booking', 'status');

      return {
        ...room.toObject(),
        beds
      };
    })
  );

  const total = await Room.countDocuments(filter);

  res.status(200).json(new ApiResponse(200, {
    rooms: roomsWithBeds,
    pagination: {
      current: Number(page),
      total: Math.ceil(total / limit),
      count: rooms.length,
      totalRecords: total
    }
  }, 'Rooms fetched successfully'));
});

const getRoomById = asyncHandler(async (req, res) => {
  const room = await Room.findById(req.params.id)
    .populate('hostel', 'name owner')
    .populate('floor', 'floorNumber');

  if (!room) {
    return res.status(404).json(new ApiResponse(404, null, 'Room not found'));
  }

  const beds = await Bed.find({ room: room._id })
    .populate('occupant', 'name email mobile')
    .populate('booking', 'status checkInDate expectedCheckOutDate');

  res.status(200).json(new ApiResponse(200, {
    ...room.toObject(),
    beds
  }, 'Room details fetched successfully'));
});

const getFloorWiseRooms = asyncHandler(async (req, res) => {
  const { hostelId } = req.params;

  const floors = await Floor.find({ hostel: hostelId }).sort({ floorNumber: 1 });

  const floorData = await Promise.all(
    floors.map(async (floor) => {
      const rooms = await Room.find({ floor: floor._id }).sort({ roomNumber: 1 });
      
      const roomsWithBeds = await Promise.all(
        rooms.map(async (room) => {
          const beds = await Bed.find({ room: room._id })
            .populate('occupant', 'name')
            .select('bedNumber isOccupied occupant');

          return {
            ...room.toObject(),
            beds
          };
        })
      );

      return {
        ...floor.toObject(),
        rooms: roomsWithBeds
      };
    })
  );

  res.status(200).json(new ApiResponse(200, floorData, 'Floor-wise rooms fetched successfully'));
});

const updateRoom = asyncHandler(async (req, res) => {
  const room = await Room.findById(req.params.id).populate('hostel');

  if (!room) {
    return res.status(404).json(new ApiResponse(404, null, 'Room not found'));
  }

  if (room.hostel.owner.toString() !== req.user.id) {
    return res.status(403).json(new ApiResponse(403, null, 'Access denied'));
  }

  const updatedRoom = await Room.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );

  res.status(200).json(new ApiResponse(200, updatedRoom, 'Room updated successfully'));
});

const getRoomAvailability = asyncHandler(async (req, res) => {
  const { hostelId } = req.params;

  const hostel = await Hostel.findById(hostelId);
  if (!hostel) {
    return res.status(404).json(new ApiResponse(404, null, 'Hostel not found'));
  }

  const totalRooms = await Room.countDocuments({ hostel: hostelId });
  const occupiedRooms = await Room.countDocuments({ hostel: hostelId, isFull: true });
  const availableRooms = totalRooms - occupiedRooms;

  const totalBeds = await Bed.countDocuments({ hostel: hostelId });
  const occupiedBeds = await Bed.countDocuments({ hostel: hostelId, isOccupied: true });
  const availableBeds = totalBeds - occupiedBeds;

  const floorWiseData = await Floor.aggregate([
    { $match: { hostel: hostel._id } },
    {
      $lookup: {
        from: 'rooms',
        localField: '_id',
        foreignField: 'floor',
        as: 'rooms'
      }
    },
    {
      $lookup: {
        from: 'beds',
        localField: '_id',
        foreignField: 'floor',
        as: 'beds'
      }
    },
    {
      $project: {
        floorNumber: 1,
        totalRooms: { $size: '$rooms' },
        occupiedRooms: {
          $size: {
            $filter: {
              input: '$rooms',
              cond: { $eq: ['$$this.isFull', true] }
            }
          }
        },
        totalBeds: { $size: '$beds' },
        occupiedBeds: {
          $size: {
            $filter: {
              input: '$beds',
              cond: { $eq: ['$$this.isOccupied', true] }
            }
          }
        }
      }
    },
    {
      $addFields: {
        availableRooms: { $subtract: ['$totalRooms', '$occupiedRooms'] },
        availableBeds: { $subtract: ['$totalBeds', '$occupiedBeds'] },
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

  res.status(200).json(new ApiResponse(200, {
    overall: {
      totalRooms,
      occupiedRooms,
      availableRooms,
      totalBeds,
      occupiedBeds,
      availableBeds,
      occupancyRate: Number(occupancyRate)
    },
    floorWise: floorWiseData
  }, 'Room availability fetched successfully'));
});

const getStudentRoom = asyncHandler(async (req, res) => {
  const bed = await Bed.findOne({ occupant: req.user.id })
    .populate('room', 'roomNumber floorNumber amenities images')
    .populate('hostel', 'name address contact')
    .populate('floor', 'floorNumber facilities');

  if (!bed) {
    return res.status(404).json(new ApiResponse(404, null, 'No room allocated'));
  }

  // Get roommates
  const roommates = await Bed.find({ 
    room: bed.room._id, 
    isOccupied: true,
    occupant: { $ne: req.user.id }
  }).populate('occupant', 'name email mobile');

  res.status(200).json(new ApiResponse(200, {
    bed,
    roommates
  }, 'Student room details fetched successfully'));
});

module.exports = {
  getHostelRooms,
  getRoomById,
  getFloorWiseRooms,
  updateRoom,
  getRoomAvailability,
  getStudentRoom
};