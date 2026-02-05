const Notification = require('../models/Notification.model');
const emailService = require('./email.service');
const smsService = require('./sms.service');
const socketService = require('./socket.service');

class NotificationService {
  static async sendNotification(notificationData) {
    try {
      const {
        recipient,
        sender = null,
        type,
        title,
        message,
        data = {},
        priority = 'medium',
        actionUrl = null,
        expiresAt = null,
        sendSMS = false
      } = notificationData;

      // Create in-app notification
      const notification = await Notification.create({
        recipient,
        sender,
        type,
        title,
        message,
        data,
        priority,
        actionUrl,
        expiresAt
      });

      // Send email notification based on type and user preferences
      await this.sendEmailNotification(type, recipient, title, message, data);

      // Send SMS notification if requested and user has mobile
      if (sendSMS) {
        await this.sendSMSNotification(type, recipient, title, message, data);
      }

      // Send real-time notification via Socket.IO
      socketService.sendRealTimeNotification(recipient, notification);

      return {
        success: true,
        notification
      };
    } catch (error) {
      console.error('Notification send error:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }

  static async sendEmailNotification(type, recipientId, title, message, data) {
    try {
      const User = require('../models/User.model');
      const user = await User.findById(recipientId);
      
      if (!user) return;

      // Check if user wants email notifications for this type
      const shouldSendEmail = this.shouldSendEmailForType(type, user);
      
      if (!shouldSendEmail) return;

      let emailContent = {
        to: user.email,
        subject: title,
        html: this.generateEmailTemplate(title, message, data, user.name)
      };

      await emailService.sendEmail(emailContent);
    } catch (error) {
      console.error('Email notification error:', error);
    }
  }

  static shouldSendEmailForType(type, user) {
    // In a real app, you would check user's notification preferences
    // For now, we'll send emails for important notifications
    const emailTypes = [
      'booking_approved',
      'booking_rejected',
      'payment_success',
      'maintenance_completed',
      'room_allocated'
    ];

    return emailTypes.includes(type);
  }

  static async sendSMSNotification(type, recipientId, title, message, data) {
    try {
      const User = require('../models/User.model');
      const user = await User.findById(recipientId);
      
      if (!user || !user.mobile) return;

      // Check if user wants SMS notifications for this type
      const shouldSendSMS = this.shouldSendSMSForType(type, user);
      
      if (!shouldSendSMS) return;

      // Send appropriate SMS based on notification type
      switch (type) {
        case 'booking_approved':
          await smsService.sendBookingConfirmationSMS(
            user.mobile, 
            user.name, 
            data.hostelName || 'Your Hostel', 
            data.roomNumber || 'TBD'
          );
          break;
        
        case 'payment_due':
          await smsService.sendPaymentReminderSMS(
            user.mobile,
            user.name,
            data.amount || 0,
            data.dueDate || 'Soon'
          );
          break;
        
        case 'maintenance_completed':
          await smsService.sendMaintenanceUpdateSMS(
            user.mobile,
            user.name,
            'completed',
            data.description || 'Your request'
          );
          break;
        
        case 'checkout_approved':
          await smsService.sendCheckoutApprovalSMS(
            user.mobile,
            user.name,
            data.checkoutDate || 'Soon'
          );
          break;
        
        case 'room_transfer_approved':
          await smsService.sendRoomTransferSMS(
            user.mobile,
            user.name,
            'approved',
            data.newRoom || 'New Room'
          );
          break;
        
        case 'emergency_alert':
          await smsService.sendEmergencyAlertSMS(
            user.mobile,
            user.name,
            message
          );
          break;
        
        default:
          // Generic SMS for other types
          await smsService.sendSMS(user.mobile, `${title}: ${message}`);
      }
    } catch (error) {
      console.error('SMS notification error:', error);
    }
  }

  static shouldSendSMSForType(type, user) {
    // SMS for urgent/important notifications
    const smsTypes = [
      'booking_approved',
      'payment_due',
      'maintenance_completed',
      'checkout_approved',
      'room_transfer_approved',
      'emergency_alert'
    ];

    return smsTypes.includes(type);
  }

  static generateEmailTemplate(title, message, data, userName) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #007bff; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">Hostel Management System</h1>
        </div>
        
        <div style="background-color: #f8f9fa; padding: 20px;">
          <h2 style="color: #333; margin-top: 0;">${title}</h2>
          <p>Hi ${userName},</p>
          <p>${message}</p>
          
          ${data.actionUrl ? `
            <div style="text-align: center; margin: 30px 0;">
              <a href="${data.actionUrl}" 
                 style="background-color: #007bff; color: white; padding: 12px 24px; 
                        text-decoration: none; border-radius: 5px; display: inline-block;">
                View Details
              </a>
            </div>
          ` : ''}
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
          
          <p style="color: #666; font-size: 14px;">
            You received this notification because you have an account with our Hostel Management System.
            <br>
            If you have any questions, please contact our support team.
          </p>
          
          <p style="color: #999; font-size: 12px;">
            This is an automated email. Please do not reply to this email.
          </p>
        </div>
      </div>
    `;
  }

  static async sendBulkNotification(recipients, notificationData) {
    try {
      const results = [];
      
      for (const recipientId of recipients) {
        const result = await this.sendNotification({
          ...notificationData,
          recipient: recipientId
        });
        
        results.push({
          recipientId,
          success: result.success,
          notificationId: result.notification?._id
        });
      }

      return {
        success: true,
        results,
        sent: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  static async markAsRead(notificationId, userId) {
    try {
      const notification = await Notification.findOne({
        _id: notificationId,
        recipient: userId
      });

      if (!notification) {
        throw new Error('Notification not found');
      }

      notification.isRead = true;
      notification.readAt = new Date();
      await notification.save();

      return {
        success: true,
        notification
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  static async markAllAsRead(userId) {
    try {
      await Notification.updateMany(
        { recipient: userId, isRead: false },
        { 
          isRead: true, 
          readAt: new Date() 
        }
      );

      return {
        success: true,
        message: 'All notifications marked as read'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  static async getUnreadCount(userId) {
    try {
      const count = await Notification.countDocuments({
        recipient: userId,
        isRead: false
      });

      return {
        success: true,
        count
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  static async cleanupExpiredNotifications() {
    try {
      const result = await Notification.deleteMany({
        expiresAt: { $lt: new Date() }
      });

      return {
        success: true,
        deletedCount: result.deletedCount
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  static async sendBookingNotifications(bookingId, type, additionalData = {}) {
    try {
      const Booking = require('../models/Booking.model');
      const booking = await Booking.findById(bookingId)
        .populate('student owner hostel');

      if (!booking) {
        throw new Error('Booking not found');
      }

      let notifications = [];

      switch (type) {
        case 'request_created':
          notifications.push({
            recipient: booking.owner._id,
            type: 'booking_request',
            title: 'New Booking Request',
            message: `New booking request from ${booking.student.name} for ${booking.hostel.name}`,
            data: { bookingId: booking._id, hostelId: booking.hostel._id }
          });
          break;

        case 'approved':
          notifications.push({
            recipient: booking.student._id,
            type: 'booking_approved',
            title: 'Booking Approved',
            message: `Your booking request for ${booking.hostel.name} has been approved. Please make advance payment.`,
            data: { bookingId: booking._id, ...additionalData }
          });
          break;

        case 'rejected':
          notifications.push({
            recipient: booking.student._id,
            type: 'booking_rejected',
            title: 'Booking Rejected',
            message: `Your booking request for ${booking.hostel.name} has been rejected.`,
            data: { bookingId: booking._id, reason: additionalData.reason }
          });
          break;

        case 'confirmed':
          notifications.push({
            recipient: booking.student._id,
            type: 'booking_confirmed',
            title: 'Booking Confirmed',
            message: `Your booking for ${booking.hostel.name} has been confirmed.`,
            data: { bookingId: booking._id, ...additionalData }
          });
          break;
      }

      const results = [];
      for (const notificationData of notifications) {
        const result = await this.sendNotification(notificationData);
        results.push(result);
      }

      return {
        success: true,
        results
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  static async sendPaymentNotifications(paymentId, type) {
    try {
      const Payment = require('../models/Payment.model');
      const payment = await Payment.findById(paymentId)
        .populate('student hostel');

      if (!payment) {
        throw new Error('Payment not found');
      }

      let notificationData = {};

      switch (type) {
        case 'success':
          notificationData = {
            recipient: payment.student._id,
            type: 'payment_success',
            title: 'Payment Successful',
            message: `Your payment of ₹${payment.amount} has been processed successfully.`,
            data: { paymentId: payment._id, amount: payment.amount }
          };
          break;

        case 'failed':
          notificationData = {
            recipient: payment.student._id,
            type: 'payment_failed',
            title: 'Payment Failed',
            message: `Your payment of ₹${payment.amount} could not be processed. Please try again.`,
            data: { paymentId: payment._id, amount: payment.amount }
          };
          break;

        case 'due_reminder':
          notificationData = {
            recipient: payment.student._id,
            type: 'payment_due',
            title: 'Payment Due Reminder',
            message: `Your payment of ₹${payment.amount} is due. Please make the payment to avoid late fees.`,
            data: { paymentId: payment._id, amount: payment.amount },
            priority: 'high'
          };
          break;
      }

      return await this.sendNotification(notificationData);
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  static async sendMaintenanceNotifications(maintenanceId, type, additionalData = {}) {
    try {
      const Maintenance = require('../models/Maintenance.model');
      const maintenance = await Maintenance.findById(maintenanceId)
        .populate('student assignedTo hostel');

      if (!maintenance) {
        throw new Error('Maintenance request not found');
      }

      let notifications = [];

      switch (type) {
        case 'request_created':
          notifications.push({
            recipient: maintenance.hostel.owner,
            type: 'maintenance_request',
            title: 'New Maintenance Request',
            message: `New ${maintenance.category} maintenance request from Room ${maintenance.room?.roomNumber || 'N/A'}`,
            data: { maintenanceId: maintenance._id }
          });
          break;

        case 'assigned':
          if (maintenance.assignedTo) {
            notifications.push({
              recipient: maintenance.assignedTo._id,
              type: 'maintenance_assigned',
              title: 'Maintenance Task Assigned',
              message: `New ${maintenance.category} task assigned: ${maintenance.title}`,
              data: { maintenanceId: maintenance._id }
            });
          }
          break;

        case 'completed':
          notifications.push({
            recipient: maintenance.student._id,
            type: 'maintenance_completed',
            title: 'Maintenance Completed',
            message: `Your maintenance request "${maintenance.title}" has been completed.`,
            data: { maintenanceId: maintenance._id }
          });
          break;
      }

      const results = [];
      for (const notificationData of notifications) {
        const result = await this.sendNotification(notificationData);
        results.push(result);
      }

      return {
        success: true,
        results
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }
}

module.exports = NotificationService;