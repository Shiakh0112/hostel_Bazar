const express = require('express');
const router = express.Router();
const {
  createPaymentPlan,
  getStudentPaymentPlans,
  getOwnerPaymentPlans,
  approvePaymentPlan,
  payInstallment,
  getPaymentPlanDetails
} = require('../controllers/paymentPlan.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');

// Student routes
router.post('/create', authMiddleware, roleMiddleware(['student']), createPaymentPlan);
router.get('/my-plans', authMiddleware, roleMiddleware(['student']), getStudentPaymentPlans);
router.post('/:planId/pay/:installmentNumber', authMiddleware, roleMiddleware(['student']), payInstallment);

// Owner routes
router.get('/owner-plans', authMiddleware, roleMiddleware(['owner']), getOwnerPaymentPlans);
router.put('/:planId/approve', authMiddleware, roleMiddleware(['owner']), approvePaymentPlan);

// Common routes
router.get('/:planId', authMiddleware, getPaymentPlanDetails);

module.exports = router;