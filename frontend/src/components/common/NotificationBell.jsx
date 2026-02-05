import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Bell, X, Check, CheckCheck, Trash2 } from 'lucide-react';
import { 
  getUserNotifications, 
  markAsRead, 
  markAllAsRead, 
  deleteNotification 
} from '../../app/slices/notificationSlice';
import socketService from '../../services/socket.service';
import { formatDistanceToNow } from 'date-fns';

const NotificationBell = () => {
  const dispatch = useDispatch();
  const { notifications, unreadCount, isLoading } = useSelector(state => state.notifications);
  const { token } = useSelector(state => state.auth);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    // Connect to Socket.IO when component mounts
    if (token) {
      socketService.connect(token);
    }

    // Fetch initial notifications
    dispatch(getUserNotifications());

    return () => {
      // Disconnect when component unmounts
      socketService.disconnect();
    };
  }, [dispatch, token]);

  const handleMarkAsRead = async (notificationId) => {
    await dispatch(markAsRead(notificationId));
    socketService.acknowledgeNotification(notificationId);
  };

  const handleMarkAllAsRead = async () => {
    await dispatch(markAllAsRead());
  };

  const handleDeleteNotification = async (notificationId) => {
    await dispatch(deleteNotification(notificationId));
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'payment_success':
        return '💰';
      case 'payment_due':
        return '⏰';
      case 'maintenance_completed':
        return '🔧';
      case 'room_allocated':
        return '🏠';
      case 'booking_approved':
        return '✅';
      case 'booking_rejected':
        return '❌';
      default:
        return '📢';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500 bg-red-50';
      case 'medium':
        return 'border-l-blue-500 bg-blue-50';
      case 'low':
        return 'border-l-gray-500 bg-gray-50';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  };

  return (
    <div className="relative">
      {/* Notification Bell Button */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {showDropdown && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 max-h-96 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-100">
            <h3 className="text-lg font-bold text-slate-900">
              Notifications {unreadCount > 0 && `(${unreadCount})`}
            </h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
                  title="Mark all as read"
                >
                  <CheckCheck className="w-4 h-4" />
                  Mark all read
                </button>
              )}
              <button
                onClick={() => setShowDropdown(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center p-8 text-slate-500">
                <Bell className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                <p className="font-medium">No notifications yet</p>
                <p className="text-sm">You're all caught up!</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {notifications.map((notification) => (
                  <div
                    key={notification._id}
                    className={`p-4 hover:bg-slate-50 transition-colors border-l-4 ${getPriorityColor(notification.priority)} ${
                      !notification.isRead ? 'bg-blue-50/50' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-2xl flex-shrink-0">
                        {getNotificationIcon(notification.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <h4 className={`text-sm font-semibold ${
                              !notification.isRead ? 'text-slate-900' : 'text-slate-700'
                            }`}>
                              {notification.title}
                            </h4>
                            <p className="text-sm text-slate-600 mt-1 line-clamp-2">
                              {notification.message}
                            </p>
                            <p className="text-xs text-slate-400 mt-2">
                              {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                            </p>
                          </div>
                          
                          <div className="flex items-center gap-1 flex-shrink-0">
                            {!notification.isRead && (
                              <button
                                onClick={() => handleMarkAsRead(notification._id)}
                                className="text-blue-600 hover:text-blue-700 p-1"
                                title="Mark as read"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteNotification(notification._id)}
                              className="text-red-600 hover:text-red-700 p-1"
                              title="Delete notification"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-slate-100 text-center">
              <button
                onClick={() => {
                  setShowDropdown(false);
                  // Navigate to notifications page if exists
                }}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                View all notifications
              </button>
            </div>
          )}
        </div>
      )}

      {/* Backdrop */}
      {showDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowDropdown(false)}
        />
      )}
    </div>
  );
};

export default NotificationBell;