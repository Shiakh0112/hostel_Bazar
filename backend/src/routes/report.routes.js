const express = require('express');
const {
  getOwnerDashboard,
  getRevenueReport,
  getOccupancyReport,
  getMaintenanceReport,
  getStudentReport,
  exportReport
} = require('../controllers/report.controller');
const auth = require('../middlewares/auth.middleware');
const roleAuth = require('../middlewares/role.middleware');

const router = express.Router();

// Owner dashboard and reports
router.get('/dashboard', auth, roleAuth(['owner']), getOwnerDashboard);
router.get('/revenue', auth, roleAuth(['owner']), getRevenueReport);
router.get('/occupancy', auth, roleAuth(['owner']), getOccupancyReport);
router.get('/maintenance', auth, roleAuth(['owner']), getMaintenanceReport);
router.get('/students', auth, roleAuth(['owner', 'staff']), getStudentReport);
router.get('/export', auth, roleAuth(['owner']), exportReport);

module.exports = router;