const express = require('express');
const router = express.Router();
const {
  requestCheckout,
  getStudentCheckouts,
  getOwnerCheckouts,
  approveCheckout,
  rejectCheckout,
  conductDamageAssessment,
  completeCheckout
} = require('../controllers/checkout.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');

// Student routes
router.post('/request', authMiddleware, roleMiddleware(['student']), requestCheckout);
router.get('/my-requests', authMiddleware, roleMiddleware(['student']), getStudentCheckouts);

// Owner routes
router.get('/requests', authMiddleware, roleMiddleware(['owner', 'staff']), getOwnerCheckouts);
router.put('/:checkoutId/approve', authMiddleware, roleMiddleware(['owner']), approveCheckout);
router.put('/:checkoutId/reject', authMiddleware, roleMiddleware(['owner']), rejectCheckout);
router.put('/:checkoutId/assess', authMiddleware, roleMiddleware(['owner', 'staff']), conductDamageAssessment);
router.put('/:checkoutId/complete', authMiddleware, roleMiddleware(['owner']), completeCheckout);

module.exports = router;