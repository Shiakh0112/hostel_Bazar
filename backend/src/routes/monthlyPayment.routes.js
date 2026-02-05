const express = require('express');
const {
  generateMonthlyRents,
  getStudentMonthlyPayments,
  getStaffMonthlyPayments,
  getOwnerMonthlyPayments,
  calculateMonthlyCharges,
  updatePaymentWithMaintenance
} = require('../controllers/monthlyPayment.controller');
const auth = require('../middlewares/auth.middleware');
const roleAuth = require('../middlewares/role.middleware');

const router = express.Router();

// Student routes
router.post('/generate', auth, roleAuth(['student']), generateMonthlyRents);
router.get('/student', auth, roleAuth(['student']), getStudentMonthlyPayments);

// Staff routes
router.get('/staff', auth, roleAuth(['staff']), getStaffMonthlyPayments);

// Owner routes
router.get('/owner', auth, roleAuth(['owner']), getOwnerMonthlyPayments);

// Calculate monthly charges
router.post('/calculate-charges', auth, roleAuth(['student']), calculateMonthlyCharges);

// Update payment with maintenance charges
router.put('/update-maintenance', auth, roleAuth(['staff', 'owner']), updatePaymentWithMaintenance);

module.exports = router;
