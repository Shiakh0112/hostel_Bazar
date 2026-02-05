const express = require('express');
const router = express.Router();
const {
  requestRoomTransfer,
  getStudentTransfers,
  getOwnerTransfers,
  approveTransfer,
  rejectTransfer,
  completeTransfer,
  getAvailableRooms,
  getStaffTransferRequests
} = require('../controllers/roomTransfer.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');

// Student routes
router.post('/request', authMiddleware, roleMiddleware(['student']), requestRoomTransfer);
router.get('/my-transfers', authMiddleware, roleMiddleware(['student']), getStudentTransfers);

// Owner routes
router.get('/staff-requests', authMiddleware, roleMiddleware(['staff']), getStaffTransferRequests);
router.get('/requests', authMiddleware, roleMiddleware(['owner', 'staff']), getOwnerTransfers);
router.put('/:transferId/approve', authMiddleware, roleMiddleware(['owner', 'staff']), approveTransfer);
router.put('/:transferId/reject', authMiddleware, roleMiddleware(['owner', 'staff']), rejectTransfer);
router.put('/:transferId/complete', authMiddleware, roleMiddleware(['owner', 'staff']), completeTransfer);

// Common routes
router.get('/available-rooms', authMiddleware, getAvailableRooms);

module.exports = router;