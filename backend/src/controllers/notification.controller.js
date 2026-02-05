const Notification = require('../models/Notification.model');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/apiResponse');

const getUserNotifications = asyncHandler(async (req, res) => {
  const { isRead, type, page = 1, limit = 20 } = req.query;

  const filter = { recipient: req.user.id };
  if (isRead !== undefined) filter.isRead = isRead === 'true';
  if (type) filter.type = type;

  // Remove expired notifications
  await Notification.deleteMany({
    recipient: req.user.id,
    expiresAt: { $lt: new Date() }
  });

  const skip = (page - 1) * limit;

  const notifications = await Notification.find(filter)
    .populate('sender', 'name')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  const total = await Notification.countDocuments(filter);
  const unreadCount = await Notification.countDocuments({
    recipient: req.user.id,
    isRead: false
  });

  res.status(200).json(new ApiResponse(200, {
    notifications,
    unreadCount,
    pagination: {
      current: Number(page),
      total: Math.ceil(total / limit),
      count: notifications.length,
      totalRecords: total
    }
  }, 'Notifications fetched successfully'));
});

const markAsRead = asyncHandler(async (req, res) => {
  const { notificationId } = req.params;

  const notification = await Notification.findOne({
    _id: notificationId,
    recipient: req.user.id
  });

  if (!notification) {
    return res.status(404).json(new ApiResponse(404, null, 'Notification not found'));
  }

  notification.isRead = true;
  notification.readAt = new Date();
  await notification.save();

  res.status(200).json(new ApiResponse(200, notification, 'Notification marked as read'));
});

const markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { recipient: req.user.id, isRead: false },
    { 
      isRead: true, 
      readAt: new Date() 
    }
  );

  res.status(200).json(new ApiResponse(200, null, 'All notifications marked as read'));
});

const deleteNotification = asyncHandler(async (req, res) => {
  const { notificationId } = req.params;

  const notification = await Notification.findOneAndDelete({
    _id: notificationId,
    recipient: req.user.id
  });

  if (!notification) {
    return res.status(404).json(new ApiResponse(404, null, 'Notification not found'));
  }

  res.status(200).json(new ApiResponse(200, null, 'Notification deleted successfully'));
});

const deleteAllNotifications = asyncHandler(async (req, res) => {
  await Notification.deleteMany({ recipient: req.user.id });

  res.status(200).json(new ApiResponse(200, null, 'All notifications deleted successfully'));
});

const createNotification = asyncHandler(async (req, res) => {
  const { recipient, type, title, message, data, priority, actionUrl, expiresAt } = req.body;

  const notification = await Notification.create({
    recipient,
    sender: req.user.id,
    type,
    title,
    message,
    data,
    priority: priority || 'medium',
    actionUrl,
    expiresAt
  });

  res.status(201).json(new ApiResponse(201, notification, 'Notification created successfully'));
});

const getNotificationStats = asyncHandler(async (req, res) => {
  const stats = await Notification.aggregate([
    { $match: { recipient: req.user.id } },
    {
      $group: {
        _id: null,
        totalNotifications: { $sum: 1 },
        unreadNotifications: {
          $sum: { $cond: [{ $eq: ['$isRead', false] }, 1, 0] }
        },
        readNotifications: {
          $sum: { $cond: [{ $eq: ['$isRead', true] }, 1, 0] }
        }
      }
    }
  ]);

  const typeStats = await Notification.aggregate([
    { $match: { recipient: req.user.id } },
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 },
        unreadCount: {
          $sum: { $cond: [{ $eq: ['$isRead', false] }, 1, 0] }
        }
      }
    },
    { $sort: { count: -1 } }
  ]);

  const result = {
    overview: stats[0] || {
      totalNotifications: 0,
      unreadNotifications: 0,
      readNotifications: 0
    },
    typeBreakdown: typeStats
  };

  res.status(200).json(new ApiResponse(200, result, 'Notification statistics fetched successfully'));
});

const getNotificationSettings = asyncHandler(async (req, res) => {
  // In a real app, you might have a separate NotificationSettings model
  // For now, we'll return default settings
  const settings = {
    email: {
      bookingRequests: true,
      paymentReminders: true,
      maintenanceUpdates: true,
      generalUpdates: false
    },
    push: {
      bookingRequests: true,
      paymentReminders: true,
      maintenanceUpdates: true,
      generalUpdates: true
    },
    sms: {
      bookingRequests: false,
      paymentReminders: true,
      maintenanceUpdates: false,
      generalUpdates: false
    }
  };

  res.status(200).json(new ApiResponse(200, settings, 'Notification settings fetched successfully'));
});

const updateNotificationSettings = asyncHandler(async (req, res) => {
  const settings = req.body;

  // In a real app, you would save these settings to a database
  // For now, we'll just return the updated settings
  
  res.status(200).json(new ApiResponse(200, settings, 'Notification settings updated successfully'));
});

module.exports = {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
  createNotification,
  getNotificationStats,
  getNotificationSettings,
  updateNotificationSettings
};