const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  updateUserRole,
  bulkUserOperations,
  exportRevenueData,
  exportStudentData,
  exportMaintenanceData,
  createBackup,
  getBackupList,
  restoreBackup,
  deleteBackup,
  getBackupStatus,
  sendBulkSMS,
  getSMSSettings,
  getSystemStats
} = require('../controllers/system.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');

// User Management (Owner only)
router.get('/users', authMiddleware, roleMiddleware(['owner']), getAllUsers);
router.put('/users/:userId', authMiddleware, roleMiddleware(['owner']), updateUserRole);
router.post('/users/bulk', authMiddleware, roleMiddleware(['owner']), bulkUserOperations);

// Data Export (Owner only)
router.get('/export/revenue', authMiddleware, roleMiddleware(['owner']), exportRevenueData);
router.get('/export/students', authMiddleware, roleMiddleware(['owner']), exportStudentData);
router.get('/export/maintenance', authMiddleware, roleMiddleware(['owner']), exportMaintenanceData);

// Backup Management (Owner only)
router.post('/backup/create', authMiddleware, roleMiddleware(['owner']), createBackup);
router.get('/backup/list', authMiddleware, roleMiddleware(['owner']), getBackupList);
router.post('/backup/restore', authMiddleware, roleMiddleware(['owner']), restoreBackup);
router.delete('/backup/:filename', authMiddleware, roleMiddleware(['owner']), deleteBackup);
router.get('/backup/status', authMiddleware, roleMiddleware(['owner']), getBackupStatus);

// SMS Management (Owner only)
router.post('/sms/bulk', authMiddleware, roleMiddleware(['owner']), sendBulkSMS);
router.get('/sms/settings', authMiddleware, roleMiddleware(['owner']), getSMSSettings);

// System Statistics (Owner only)
router.get('/stats', authMiddleware, roleMiddleware(['owner']), getSystemStats);

module.exports = router;