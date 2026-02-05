const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/User.model');

class SocketService {
  constructor() {
    this.io = null;
    this.connectedUsers = new Map(); // userId -> socketId mapping
  }

  initialize(server) {
    this.io = socketIo(server, {
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true
      }
    });

    // Authentication middleware
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
          return next(new Error('Authentication error'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        
        if (!user) {
          return next(new Error('User not found'));
        }

        socket.userId = user._id.toString();
        socket.userRole = user.role;
        next();
      } catch (error) {
        next(new Error('Authentication error'));
      }
    });

    this.io.on('connection', (socket) => {
      console.log(`User ${socket.userId} connected with socket ${socket.id}`);
      
      // Store user connection
      this.connectedUsers.set(socket.userId, socket.id);
      
      // Join user to their personal room
      socket.join(`user_${socket.userId}`);
      
      // Join role-based rooms
      socket.join(`role_${socket.userRole}`);

      // Handle disconnection
      socket.on('disconnect', () => {
        console.log(`User ${socket.userId} disconnected`);
        this.connectedUsers.delete(socket.userId);
      });

      // Handle notification acknowledgment
      socket.on('notification_received', (data) => {
        console.log(`Notification ${data.notificationId} received by user ${socket.userId}`);
      });

      // Handle typing indicators for chat (if implemented)
      socket.on('typing_start', (data) => {
        socket.to(data.roomId).emit('user_typing', {
          userId: socket.userId,
          typing: true
        });
      });

      socket.on('typing_stop', (data) => {
        socket.to(data.roomId).emit('user_typing', {
          userId: socket.userId,
          typing: false
        });
      });
    });

    console.log('Socket.IO server initialized');
  }

  // Send notification to specific user
  sendToUser(userId, event, data) {
    if (this.io) {
      this.io.to(`user_${userId}`).emit(event, data);
      console.log(`Sent ${event} to user ${userId}`);
    }
  }

  // Send notification to all users with specific role
  sendToRole(role, event, data) {
    if (this.io) {
      this.io.to(`role_${role}`).emit(event, data);
      console.log(`Sent ${event} to all ${role}s`);
    }
  }

  // Send notification to all connected users
  sendToAll(event, data) {
    if (this.io) {
      this.io.emit(event, data);
      console.log(`Sent ${event} to all users`);
    }
  }

  // Send real-time notification
  sendRealTimeNotification(userId, notification) {
    this.sendToUser(userId, 'new_notification', {
      id: notification._id,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      data: notification.data,
      priority: notification.priority,
      createdAt: notification.createdAt
    });
  }

  // Send payment status update
  sendPaymentUpdate(userId, paymentData) {
    this.sendToUser(userId, 'payment_update', paymentData);
  }

  // Send maintenance status update
  sendMaintenanceUpdate(userId, maintenanceData) {
    this.sendToUser(userId, 'maintenance_update', maintenanceData);
  }

  // Send room allocation notification
  sendRoomAllocation(userId, roomData) {
    this.sendToUser(userId, 'room_allocated', roomData);
  }

  // Send booking status update
  sendBookingUpdate(userId, bookingData) {
    this.sendToUser(userId, 'booking_update', bookingData);
  }

  // Get online users count
  getOnlineUsersCount() {
    return this.connectedUsers.size;
  }

  // Check if user is online
  isUserOnline(userId) {
    return this.connectedUsers.has(userId);
  }

  // Get all online users
  getOnlineUsers() {
    return Array.from(this.connectedUsers.keys());
  }
}

// Export singleton instance
module.exports = new SocketService();