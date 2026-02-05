import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import notificationService from '../../services/notification.service'
import toast from 'react-hot-toast'

// Async thunks
export const getUserNotifications = createAsyncThunk(
  'notifications/getUserNotifications',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const response = await notificationService.getUserNotifications(filters)
      return response.data
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch notifications'
      return rejectWithValue(message)
    }
  }
)

export const markAsRead = createAsyncThunk(
  'notifications/markAsRead',
  async (notificationId, { rejectWithValue }) => {
    try {
      const response = await notificationService.markAsRead(notificationId)
      return response.data
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to mark as read'
      return rejectWithValue(message)
    }
  }
)

export const markAllAsRead = createAsyncThunk(
  'notifications/markAllAsRead',
  async (_, { rejectWithValue }) => {
    try {
      await notificationService.markAllAsRead()
      toast.success('All notifications marked as read!')
      return true
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to mark all as read'
      toast.error(message)
      return rejectWithValue(message)
    }
  }
)

export const deleteNotification = createAsyncThunk(
  'notifications/deleteNotification',
  async (notificationId, { rejectWithValue }) => {
    try {
      await notificationService.deleteNotification(notificationId)
      toast.success('Notification deleted!')
      return notificationId
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete notification'
      toast.error(message)
      return rejectWithValue(message)
    }
  }
)

export const deleteAllNotifications = createAsyncThunk(
  'notifications/deleteAllNotifications',
  async (_, { rejectWithValue }) => {
    try {
      await notificationService.deleteAllNotifications()
      toast.success('All notifications deleted!')
      return true
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete all notifications'
      toast.error(message)
      return rejectWithValue(message)
    }
  }
)

export const createNotification = createAsyncThunk(
  'notifications/createNotification',
  async (notificationData, { rejectWithValue }) => {
    try {
      const response = await notificationService.createNotification(notificationData)
      toast.success('Notification sent successfully!')
      return response.data
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to send notification'
      toast.error(message)
      return rejectWithValue(message)
    }
  }
)

export const getNotificationStats = createAsyncThunk(
  'notifications/getNotificationStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await notificationService.getNotificationStats()
      return response.data
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch notification stats'
      return rejectWithValue(message)
    }
  }
)

export const getNotificationSettings = createAsyncThunk(
  'notifications/getNotificationSettings',
  async (_, { rejectWithValue }) => {
    try {
      const response = await notificationService.getNotificationSettings()
      return response.data
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch notification settings'
      return rejectWithValue(message)
    }
  }
)

export const updateNotificationSettings = createAsyncThunk(
  'notifications/updateNotificationSettings',
  async (settings, { rejectWithValue }) => {
    try {
      const response = await notificationService.updateNotificationSettings(settings)
      toast.success('Notification settings updated!')
      return response.data
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update notification settings'
      toast.error(message)
      return rejectWithValue(message)
    }
  }
)

const initialState = {
  notifications: [],
  unreadCount: 0,
  notificationStats: null,
  notificationSettings: null,
  isLoading: false,
  error: null,
  pagination: {
    current: 1,
    total: 0,
    count: 0,
    totalRecords: 0
  },
  filters: {
    isRead: '',
    type: '',
    page: 1,
    limit: 20
  }
}

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    clearFilters: (state) => {
      state.filters = initialState.filters
    },
    decrementUnreadCount: (state) => {
      if (state.unreadCount > 0) {
        state.unreadCount -= 1
      }
    },
    addNotification: (state, action) => {
      state.notifications.unshift(action.payload)
      if (!action.payload.isRead) {
        state.unreadCount += 1
      }
    },
    updateNotificationCount: (state) => {
      state.unreadCount = state.notifications.filter(n => !n.isRead).length
    }
  },
  extraReducers: (builder) => {
    builder
      // Get User Notifications
      .addCase(getUserNotifications.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(getUserNotifications.fulfilled, (state, action) => {
        state.isLoading = false
        state.notifications = action.payload.notifications
        state.unreadCount = action.payload.unreadCount
        state.pagination = action.payload.pagination
      })
      .addCase(getUserNotifications.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Mark As Read
      .addCase(markAsRead.pending, (state) => {
        state.error = null
      })
      .addCase(markAsRead.fulfilled, (state, action) => {
        const index = state.notifications.findIndex(n => n._id === action.payload._id)
        if (index !== -1) {
          state.notifications[index] = action.payload
          if (!action.payload.isRead) {
            state.unreadCount -= 1
          }
        }
      })
      .addCase(markAsRead.rejected, (state, action) => {
        state.error = action.payload
      })
      
      // Mark All As Read
      .addCase(markAllAsRead.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(markAllAsRead.fulfilled, (state) => {
        state.isLoading = false
        state.notifications = state.notifications.map(n => ({ ...n, isRead: true }))
        state.unreadCount = 0
      })
      .addCase(markAllAsRead.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Delete Notification
      .addCase(deleteNotification.pending, (state) => {
        state.error = null
      })
      .addCase(deleteNotification.fulfilled, (state, action) => {
        const deletedNotification = state.notifications.find(n => n._id === action.payload)
        state.notifications = state.notifications.filter(n => n._id !== action.payload)
        if (deletedNotification && !deletedNotification.isRead) {
          state.unreadCount -= 1
        }
      })
      .addCase(deleteNotification.rejected, (state, action) => {
        state.error = action.payload
      })
      
      // Delete All Notifications
      .addCase(deleteAllNotifications.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(deleteAllNotifications.fulfilled, (state) => {
        state.isLoading = false
        state.notifications = []
        state.unreadCount = 0
      })
      .addCase(deleteAllNotifications.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Create Notification
      .addCase(createNotification.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(createNotification.fulfilled, (state) => {
        state.isLoading = false
      })
      .addCase(createNotification.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Get Notification Stats
      .addCase(getNotificationStats.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(getNotificationStats.fulfilled, (state, action) => {
        state.isLoading = false
        state.notificationStats = action.payload
      })
      .addCase(getNotificationStats.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Get Notification Settings
      .addCase(getNotificationSettings.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(getNotificationSettings.fulfilled, (state, action) => {
        state.isLoading = false
        state.notificationSettings = action.payload
      })
      .addCase(getNotificationSettings.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Update Notification Settings
      .addCase(updateNotificationSettings.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateNotificationSettings.fulfilled, (state, action) => {
        state.isLoading = false
        state.notificationSettings = action.payload
      })
      .addCase(updateNotificationSettings.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
  }
})

export const { 
  clearError, 
  setFilters, 
  clearFilters, 
  decrementUnreadCount,
  addNotification,
  updateNotificationCount
} = notificationSlice.actions

export default notificationSlice.reducer