const express = require('express');
const {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
  createNotification,
  getNotificationStats,
  getNotificationSettings,
  updateNotificationSettings
} = require('../controllers/notification.controller');
const auth = require('../middlewares/auth.middleware');
const roleAuth = require('../middlewares/role.middleware');

const router = express.Router();

// User notifications
router.get('/', auth, getUserNotifications);
router.put('/:notificationId/read', auth, markAsRead);
router.put('/mark-all-read', auth, markAllAsRead);
router.delete('/:notificationId', auth, deleteNotification);
router.delete('/', auth, deleteAllNotifications);

// Notification management
router.post('/', auth, roleAuth(['owner', 'staff']), createNotification);
router.get('/stats', auth, getNotificationStats);

// Notification settings
router.get('/settings', auth, getNotificationSettings);
router.put('/settings', auth, updateNotificationSettings);

module.exports = router;