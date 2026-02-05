import { io } from 'socket.io-client';
import { store } from '../app/store';
import { addNotification, updateNotificationCount } from '../app/slices/notificationSlice';
import toast from 'react-hot-toast';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
  }

  connect(token) {
    if (this.socket) {
      this.disconnect();
    }

    const serverUrl = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';
    
    this.socket = io(serverUrl, {
      auth: {
        token: token
      },
      transports: ['websocket', 'polling']
    });

    this.socket.on('connect', () => {
      console.log('Connected to server');
      this.isConnected = true;
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server');
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      this.isConnected = false;
    });

    // Listen for real-time notifications
    this.socket.on('new_notification', (notification) => {
      console.log('New notification received:', notification);
      
      // Add to Redux store
      store.dispatch(addNotification(notification));
      store.dispatch(updateNotificationCount());
      
      // Show toast notification
      this.showToastNotification(notification);
    });

    // Listen for payment updates
    this.socket.on('payment_update', (paymentData) => {
      console.log('Payment update received:', paymentData);
      
      if (paymentData.status === 'completed') {
        toast.success(`Payment of ₹${paymentData.amount} completed successfully!`);
      } else if (paymentData.status === 'failed') {
        toast.error(`Payment of ₹${paymentData.amount} failed. Please try again.`);
      }
    });

    // Listen for maintenance updates
    this.socket.on('maintenance_update', (maintenanceData) => {
      console.log('Maintenance update received:', maintenanceData);
      
      if (maintenanceData.status === 'completed') {
        toast.success(`Maintenance request "${maintenanceData.title}" has been completed!`);
      } else if (maintenanceData.status === 'assigned') {
        toast.info(`Your maintenance request has been assigned to staff.`);
      }
    });

    // Listen for room allocation
    this.socket.on('room_allocated', (roomData) => {
      console.log('Room allocation received:', roomData);
      toast.success(`Room ${roomData.roomNumber}, Bed ${roomData.bedNumber} has been allocated to you!`);
    });

    // Listen for booking updates
    this.socket.on('booking_update', (bookingData) => {
      console.log('Booking update received:', bookingData);
      
      if (bookingData.status === 'approved') {
        toast.success('Your booking has been approved! Please make advance payment.');
      } else if (bookingData.status === 'rejected') {
        toast.error('Your booking has been rejected.');
      } else if (bookingData.status === 'confirmed') {
        toast.success('Your booking has been confirmed!');
      }
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  showToastNotification(notification) {
    const options = {
      duration: 5000,
      position: 'top-right',
    };

    switch (notification.priority) {
      case 'high':
        toast.error(notification.message, options);
        break;
      case 'medium':
        toast.success(notification.message, options);
        break;
      case 'low':
        toast(notification.message, options);
        break;
      default:
        toast(notification.message, options);
    }
  }

  // Emit events
  emit(event, data) {
    if (this.socket && this.isConnected) {
      this.socket.emit(event, data);
    }
  }

  // Acknowledge notification received
  acknowledgeNotification(notificationId) {
    this.emit('notification_received', { notificationId });
  }

  // Typing indicators (for future chat feature)
  startTyping(roomId) {
    this.emit('typing_start', { roomId });
  }

  stopTyping(roomId) {
    this.emit('typing_stop', { roomId });
  }

  // Check connection status
  isSocketConnected() {
    return this.isConnected;
  }
}

// Export singleton instance
export default new SocketService();