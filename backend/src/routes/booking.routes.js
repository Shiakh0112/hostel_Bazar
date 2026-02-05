const express = require('express');
const {
  createBookingRequest,
  getStudentBookings,
  getOwnerBookingRequests,
  approveBooking,
  rejectBooking,
  confirmBooking,
  allocateRoomManually,
  getBookingById,
  cancelBooking
} = require('../controllers/booking.controller');
const auth = require('../middlewares/auth.middleware');
const roleAuth = require('../middlewares/role.middleware');
const { validateBooking } = require('../validations/booking.validation');

const router = express.Router();

// Student routes
router.post('/request', auth, roleAuth(['student']), validateBooking, createBookingRequest);
router.get('/student/my-bookings', auth, roleAuth(['student']), getStudentBookings);
router.put('/:bookingId/cancel', auth, roleAuth(['student']), cancelBooking);

// Owner routes
router.get('/owner/requests', auth, roleAuth(['owner']), getOwnerBookingRequests);
router.put('/:bookingId/approve', auth, roleAuth(['owner']), approveBooking);
router.put('/:bookingId/reject', auth, roleAuth(['owner']), rejectBooking);
router.put('/:bookingId/confirm', auth, confirmBooking);
router.put('/:bookingId/allocate-room', auth, roleAuth(['owner']), allocateRoomManually);

// Common routes
router.get('/:id', auth, getBookingById);

module.exports = router;