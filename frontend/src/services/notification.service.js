import api from './api'

const notificationService = {
  // Get user notifications
  getUserNotifications: async (filters = {}) => {
    const params = new URLSearchParams()
    Object.keys(filters).forEach(key => {
      if (filters[key]) {
        params.append(key, filters[key])
      }
    })
    return await api.get(`/notifications?${params.toString()}`)
  },

  // Mark notification as read
  markAsRead: async (notificationId) => {
    return await api.put(`/notifications/${notificationId}/read`)
  },

  // Mark all notifications as read
  markAllAsRead: async () => {
    return await api.put('/notifications/mark-all-read')
  },

  // Delete notification
  deleteNotification: async (notificationId) => {
    return await api.delete(`/notifications/${notificationId}`)
  },

  // Delete all notifications
  deleteAllNotifications: async () => {
    return await api.delete('/notifications')
  },

  // Create notification (owner/staff)
  createNotification: async (notificationData) => {
    return await api.post('/notifications', notificationData)
  },

  // Get notification statistics
  getNotificationStats: async () => {
    return await api.get('/notifications/stats')
  },

  // Get notification settings
  getNotificationSettings: async () => {
    return await api.get('/notifications/settings')
  },

  // Update notification settings
  updateNotificationSettings: async (settings) => {
    return await api.put('/notifications/settings', settings)
  },
}

export default notificationService