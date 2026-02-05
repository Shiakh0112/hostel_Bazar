const express = require('express');
const {
  createMaintenanceRequest,
  uploadMaintenanceImages,
  getStudentMaintenanceRequests,
  getOwnerMaintenanceRequests,
  getStaffMaintenanceRequests,
  assignMaintenanceRequest,
  updateMaintenanceStatus,
  addMaintenanceNote,
  rateMaintenanceService,
  bulkUpdateMaintenanceStatus,
  getMaintenanceStats
} = require('../controllers/maintenance.controller');
const auth = require('../middlewares/auth.middleware');
const roleAuth = require('../middlewares/role.middleware');
const upload = require('../middlewares/upload.middleware');

const router = express.Router();

// Student routes
router.post('/request', auth, roleAuth(['student']), createMaintenanceRequest);
router.post('/:requestId/upload-images', auth, upload.array('images', 5), uploadMaintenanceImages);
router.get('/student/my-requests', auth, roleAuth(['student']), getStudentMaintenanceRequests);
router.post('/:requestId/rate', auth, roleAuth(['student']), rateMaintenanceService);

// Owner routes
router.get('/owner/requests', auth, roleAuth(['owner']), getOwnerMaintenanceRequests);
router.put('/:requestId/assign', auth, roleAuth(['owner']), assignMaintenanceRequest);
router.put('/bulk-update', auth, roleAuth(['owner', 'staff']), bulkUpdateMaintenanceStatus);

// Staff routes
router.get('/staff/assigned', auth, roleAuth(['staff']), getStaffMaintenanceRequests);
router.get('/staff-requests', auth, roleAuth(['staff']), getStaffMaintenanceRequests);

// Common routes
router.put('/:requestId/status', auth, updateMaintenanceStatus);
router.post('/:requestId/notes', auth, addMaintenanceNote);
router.get('/stats', auth, getMaintenanceStats);

module.exports = router;