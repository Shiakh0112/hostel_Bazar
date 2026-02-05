const Hostel = require('../models/Hostel.model');
const Floor = require('../models/Floor.model');
const Room = require('../models/Room.model');
const Bed = require('../models/Bed.model');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/apiResponse');
const cloudinary = require('../config/cloudinary');

const createHostel = asyncHandler(async (req, res) => {
  console.log('Creating hostel with data:', req.body);
  console.log('Files received:', req.files?.length || 0);
  
  // Convert string values to numbers
  const hostelData = {
    ...req.body,
    owner: req.user.id,
    structure: {
      ...req.body.structure,
      totalFloors: Number(req.body.structure.totalFloors),
      roomsPerFloor: Number(req.body.structure.roomsPerFloor),
      bedsPerRoom: Number(req.body.structure.bedsPerRoom),
      attachedBathroom: req.body.structure.attachedBathroom === 'true'
    },
    pricing: {
      ...req.body.pricing,
      monthlyRent: Number(req.body.pricing.monthlyRent),
      securityDeposit: Number(req.body.pricing.securityDeposit),
      maintenanceCharges: Number(req.body.pricing.maintenanceCharges),
      electricityCharges: Number(req.body.pricing.electricityCharges),
      advancePayment: Number(req.body.pricing.advancePayment)
    }
  };

  // Handle image uploads
  if (req.files && req.files.length > 0) {
    const images = [];
    let mainImageUrl = null;

    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];
      console.log(`Uploading image ${i + 1}:`, file.originalname);
      
      try {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: 'hostels',
          resource_type: 'image'
        });

        const imageType = req.body[`imageType_${i}`] || 'building';
        
        images.push({
          url: result.secure_url,
          type: imageType
        });

        // First image becomes main image
        if (i === 0) {
          mainImageUrl = result.secure_url;
        }
        
        console.log(`Image ${i + 1} uploaded successfully:`, result.secure_url);
      } catch (uploadError) {
        console.error(`Image ${i + 1} upload failed:`, uploadError);
        return res.status(500).json(new ApiResponse(500, null, `Image upload failed: ${uploadError.message}`));
      }
    }

    hostelData.images = images;
    hostelData.mainImage = mainImageUrl;
    console.log('Images processed:', images.length);
  }

  try {
    const hostel = await Hostel.create(hostelData);
    console.log('Hostel created successfully:', hostel._id);

    // Auto generate floors, rooms, and beds based on hostel structure
    await generateHostelRooms(hostel);
    
    // Send response immediately after hostel creation
    const responseData = new ApiResponse(201, hostel, 'Hostel created successfully');
    console.log('Sending success response to frontend');
    res.status(201).json(responseData);
    
    return;
  } catch (error) {
    console.error('Hostel creation error:', error);
    return res.status(500).json(new ApiResponse(500, null, `Failed to create hostel: ${error.message}`));
  }
});

// Helper function to generate rooms for a hostel
const generateHostelRooms = async (hostel) => {
  const { totalFloors, roomsPerFloor, bedsPerRoom } = hostel.structure;
  console.log(`Generating rooms for ${hostel.name}: ${totalFloors} floors × ${roomsPerFloor} rooms × ${bedsPerRoom} beds`);

  for (let floorNum = 1; floorNum <= totalFloors; floorNum++) {
    const floor = await Floor.create({
      hostel: hostel._id,
      floorNumber: floorNum,
      totalRooms: roomsPerFloor,
      totalBeds: roomsPerFloor * bedsPerRoom,
      availableRooms: roomsPerFloor,
      availableBeds: roomsPerFloor * bedsPerRoom
    });

    for (let roomNum = 1; roomNum <= roomsPerFloor; roomNum++) {
      const roomNumber = floorNum * 100 + roomNum; // 101, 102, 103, 104, 201, 202, etc.
      
      const room = await Room.create({
        hostel: hostel._id,
        floor: floor._id,
        roomNumber,
        floorNumber: floorNum,
        roomType: hostel.structure.roomType,
        totalBeds: bedsPerRoom,
        availableBeds: bedsPerRoom,
        occupiedBeds: 0,
        isActive: true,
        isFull: false,
        attachedBathroom: hostel.structure.attachedBathroom,
        monthlyRent: hostel.pricing.monthlyRent,
        amenities: hostel.amenities || []
      });

      for (let bedNum = 1; bedNum <= bedsPerRoom; bedNum++) {
        const bedNumber = `${roomNumber}-${bedNum}`;
        
        await Bed.create({
          hostel: hostel._id,
          floor: floor._id,
          room: room._id,
          bedNumber,
          roomNumber,
          floorNumber: floorNum,
          monthlyRent: hostel.pricing.monthlyRent
        });
      }
    }
  }

  console.log('Rooms generated successfully');
};

// Function to fix missing rooms for existing hostels
const fixMissingRooms = asyncHandler(async (req, res) => {
  try {
    let hostels;
    
    // If user is staff, only fix rooms for their assigned hostel
    if (req.user.role === 'staff') {
      // Get staff profile to find assigned hostel
      const Staff = require('../models/Staff.model');
      const staff = await Staff.findOne({ user: req.user.id }).populate('hostel');
      
      if (!staff || !staff.hostel) {
        return res.status(400).json(new ApiResponse(400, null, 'No hostel assigned to staff'));
      }
      
      hostels = [staff.hostel];
    } else {
      // Admin/Owner can fix all hostels
      hostels = await Hostel.find({ isActive: true });
    }
    
    let totalFixed = 0;
    
    for (const hostel of hostels) {
      const expectedRooms = hostel.structure.totalFloors * hostel.structure.roomsPerFloor;
      const existingRooms = await Room.find({ hostel: hostel._id });
      
      if (existingRooms.length < expectedRooms) {
        console.log(`Fixing ${hostel.name}: Expected ${expectedRooms}, Found ${existingRooms.length}`);
        
        const existingRoomNumbers = existingRooms.map(room => room.roomNumber);
        let addedCount = 0;
        
        // Generate missing rooms
        for (let floor = 1; floor <= hostel.structure.totalFloors; floor++) {
          for (let roomNum = 1; roomNum <= hostel.structure.roomsPerFloor; roomNum++) {
            const roomNumber = floor * 100 + roomNum;
            
            if (!existingRoomNumbers.includes(roomNumber)) {
              // Find or create floor
              let floorDoc = await Floor.findOne({ hostel: hostel._id, floorNumber: floor });
              if (!floorDoc) {
                floorDoc = await Floor.create({
                  hostel: hostel._id,
                  floorNumber: floor,
                  totalRooms: hostel.structure.roomsPerFloor,
                  totalBeds: hostel.structure.roomsPerFloor * hostel.structure.bedsPerRoom,
                  availableRooms: hostel.structure.roomsPerFloor,
                  availableBeds: hostel.structure.roomsPerFloor * hostel.structure.bedsPerRoom
                });
              }
              
              // Create missing room
              const room = await Room.create({
                hostel: hostel._id,
                floor: floorDoc._id,
                roomNumber,
                floorNumber: floor,
                roomType: hostel.structure.roomType,
                totalBeds: hostel.structure.bedsPerRoom,
                availableBeds: hostel.structure.bedsPerRoom,
                occupiedBeds: 0,
                isActive: true,
                isFull: false,
                attachedBathroom: hostel.structure.attachedBathroom,
                monthlyRent: hostel.pricing.monthlyRent,
                amenities: hostel.amenities || []
              });
              
              // Create beds for the room
              for (let bedNum = 1; bedNum <= hostel.structure.bedsPerRoom; bedNum++) {
                const bedNumber = `${roomNumber}-${bedNum}`;
                
                await Bed.create({
                  hostel: hostel._id,
                  floor: floorDoc._id,
                  room: room._id,
                  bedNumber,
                  roomNumber,
                  floorNumber: floor,
                  monthlyRent: hostel.pricing.monthlyRent
                });
              }
              
              addedCount++;
              totalFixed++;
            }
          }
        }
        
        console.log(`Added ${addedCount} rooms for ${hostel.name}`);
      }
    }
    
    res.status(200).json(new ApiResponse(200, { totalFixed }, `Successfully added ${totalFixed} missing rooms`));
  } catch (error) {
    console.error('Error fixing rooms:', error);
    res.status(500).json(new ApiResponse(500, null, `Failed to fix rooms: ${error.message}`));
  }
});

const getAllHostels = asyncHandler(async (req, res) => {
  const { 
    search, 
    city, 
    hostelType, 
    roomType, 
    minPrice, 
    maxPrice, 
    amenities,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    page = 1,
    limit = 10
  } = req.query;

  const filter = { isActive: true };

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { 'address.area': { $regex: search, $options: 'i' } }
    ];
  }

  if (city) {
    filter['address.city'] = { $regex: city, $options: 'i' };
  }

  if (hostelType) {
    filter.hostelType = hostelType;
  }

  if (roomType) {
    filter['structure.roomType'] = roomType;
  }

  if (minPrice || maxPrice) {
    filter['pricing.monthlyRent'] = {};
    if (minPrice) filter['pricing.monthlyRent'].$gte = Number(minPrice);
    if (maxPrice) filter['pricing.monthlyRent'].$lte = Number(maxPrice);
  }

  if (amenities) {
    const amenityArray = amenities.split(',');
    filter.amenities = { $in: amenityArray };
  }

  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

  const skip = (page - 1) * limit;

  const hostels = await Hostel.find(filter)
    .populate('owner', 'name email mobile')
    .sort(sortOptions)
    .skip(skip)
    .limit(Number(limit));

  const total = await Hostel.countDocuments(filter);

  res.status(200).json(new ApiResponse(200, {
    hostels,
    pagination: {
      current: Number(page),
      total: Math.ceil(total / limit),
      count: hostels.length,
      totalRecords: total
    }
  }, 'Hostels fetched successfully'));
});

const getHostelById = asyncHandler(async (req, res) => {
  const hostel = await Hostel.findById(req.params.id)
    .populate('owner', 'name email mobile');

  if (!hostel) {
    return res.status(404).json(new ApiResponse(404, null, 'Hostel not found'));
  }

  // Get availability data
  const floors = await Floor.find({ hostel: hostel._id });
  const rooms = await Room.find({ hostel: hostel._id });
  const beds = await Bed.find({ hostel: hostel._id });

  const availabilityData = {
    totalFloors: floors.length,
    totalRooms: rooms.length,
    totalBeds: beds.length,
    availableBeds: beds.filter(bed => !bed.isOccupied).length,
    occupiedBeds: beds.filter(bed => bed.isOccupied).length,
    occupancyRate: ((beds.filter(bed => bed.isOccupied).length / beds.length) * 100).toFixed(2)
  };

  res.status(200).json(new ApiResponse(200, {
    ...hostel.toObject(),
    availability: availabilityData
  }, 'Hostel details fetched successfully'));
});

const getOwnerHostels = asyncHandler(async (req, res) => {
  const hostels = await Hostel.find({ owner: req.user.id });
  res.status(200).json(new ApiResponse(200, hostels, 'Owner hostels fetched successfully'));
});

const updateHostel = asyncHandler(async (req, res) => {
  const hostel = await Hostel.findOne({ _id: req.params.id, owner: req.user.id });

  if (!hostel) {
    return res.status(404).json(new ApiResponse(404, null, 'Hostel not found'));
  }

  const updatedHostel = await Hostel.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );

  res.status(200).json(new ApiResponse(200, updatedHostel, 'Hostel updated successfully'));
});

const uploadHostelImages = asyncHandler(async (req, res) => {
  const hostel = await Hostel.findOne({ _id: req.params.id, owner: req.user.id });

  if (!hostel) {
    return res.status(404).json(new ApiResponse(404, null, 'Hostel not found'));
  }

  const images = [];
  
  for (const file of req.files) {
    const result = await cloudinary.uploader.upload(file.path, {
      folder: 'hostels',
      resource_type: 'image'
    });
    
    images.push({
      url: result.secure_url,
      type: req.body.imageType || 'building'
    });
  }

  hostel.images.push(...images);
  await hostel.save();

  res.status(200).json(new ApiResponse(200, images, 'Images uploaded successfully'));
});

const deleteHostel = asyncHandler(async (req, res) => {
  const hostel = await Hostel.findOne({ _id: req.params.id, owner: req.user.id });

  if (!hostel) {
    return res.status(404).json(new ApiResponse(404, null, 'Hostel not found'));
  }

  hostel.isActive = false;
  await hostel.save();

  res.status(200).json(new ApiResponse(200, null, 'Hostel deleted successfully'));
});

module.exports = {
  createHostel,
  getAllHostels,
  getHostelById,
  getOwnerHostels,
  updateHostel,
  uploadHostelImages,
  deleteHostel,
  fixMissingRooms
};