const express = require('express');
const {
  createStaff,
  getOwnerStaff,
  getStaffById,
  updateStaff,
  deleteStaff,
  getStaffProfile,
  updateStaffProfile,
  changeStaffPassword,
  resetStaffPassword,
  getStaffStats,
  getStaffBookingRequests,
  getStaffSettings,
  updateStaffNotifications,
  updateStaffWorkPreferences,
  getStaffTaskReports,
  getStaffMaintenanceReports,
  getStaffStudentReports,
  getStaffActivities,
  exportStaffReport,
  getAssignedTasks,
  getAssignedHostels,
  getStaffStudents
} = require('../controllers/staff.controller');
const { getStaffMaintenanceRequests } = require('../controllers/maintenance.controller');
const auth = require('../middlewares/auth.middleware');
const roleAuth = require('../middlewares/role.middleware');
const upload = require('../middlewares/upload.middleware');

const router = express.Router();

// Staff routes (specific routes first)
router.get('/assigned-tasks', auth, roleAuth(['staff']), getStaffMaintenanceRequests);
router.get('/assigned-hostels', auth, roleAuth(['staff']), getAssignedHostels);
router.get('/students', auth, roleAuth(['staff']), getStaffStudents);
router.get('/profile', auth, getStaffProfile);
router.put('/profile', auth, upload.single('avatar'), updateStaffProfile);
router.put('/change-password', auth, changeStaffPassword);
router.get('/booking-requests', auth, roleAuth(['staff']), getStaffBookingRequests);
router.get('/settings', auth, roleAuth(['staff']), getStaffSettings);
router.put('/settings/notifications', auth, roleAuth(['staff']), updateStaffNotifications);
router.put('/settings/work-preferences', auth, roleAuth(['staff']), updateStaffWorkPreferences);
router.get('/reports/tasks', auth, roleAuth(['staff']), getStaffTaskReports);
router.get('/reports/maintenance', auth, roleAuth(['staff']), getStaffMaintenanceReports);
router.get('/reports/students', auth, roleAuth(['staff']), getStaffStudentReports);
router.get('/reports/activities', auth, roleAuth(['staff']), getStaffActivities);
router.get('/reports/export/:type', auth, roleAuth(['staff']), exportStaffReport);

// Owner routes (generic routes after specific ones)
router.post('/', auth, roleAuth(['owner']), createStaff);
router.get('/owner/my-staff', auth, roleAuth(['owner']), getOwnerStaff);
router.get('/owner/stats', auth, roleAuth(['owner']), getStaffStats);
router.get('/:id', auth, roleAuth(['owner']), getStaffById);
router.put('/:id', auth, roleAuth(['owner']), updateStaff);
router.put('/:id/reset-password', auth, roleAuth(['owner']), resetStaffPassword);
router.delete('/:id', auth, roleAuth(['owner']), deleteStaff);

module.exports = router;