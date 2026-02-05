const express = require('express');
const {
  getHostelRooms,
  getRoomById,
  getFloorWiseRooms,
  updateRoom,
  getRoomAvailability,
  getStudentRoom
} = require('../controllers/room.controller');
const auth = require('../middlewares/auth.middleware');
const roleAuth = require('../middlewares/role.middleware');

const router = express.Router();

// Public routes
router.get('/hostel/:hostelId', getHostelRooms);
router.get('/hostel/:hostelId/availability', getRoomAvailability);
router.get('/hostel/:hostelId/floors', getFloorWiseRooms);

// Protected routes
router.get('/student/my-room', auth, roleAuth(['student']), getStudentRoom);
router.get('/:id', auth, getRoomById);
router.put('/:id', auth, roleAuth(['owner', 'staff']), updateRoom);
router.put('/:id/status', auth, roleAuth(['owner', 'staff']), updateRoom);

module.exports = router;