const twilio = require('twilio');

class SMSService {
  constructor() {
    // Only initialize Twilio if credentials are provided
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
      this.client = twilio(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN
      );
      this.fromNumber = process.env.TWILIO_PHONE_NUMBER;
    } else {
      console.log('⚠️ Twilio credentials not configured - SMS service disabled');
      this.client = null;
      this.fromNumber = null;
    }
  }

  async sendSMS(to, message) {
    try {
      if (!this.client || !this.fromNumber) {
        console.log('SMS service not configured, skipping SMS:', message);
        return { success: false, message: 'SMS service not configured' };
      }

      const result = await this.client.messages.create({
        body: message,
        from: this.fromNumber,
        to: to
      });

      console.log('SMS sent successfully:', result.sid);
      return { success: true, messageId: result.sid };
    } catch (error) {
      console.error('SMS sending failed:', error.message);
      return { success: false, error: error.message };
    }
  }

  async sendBookingConfirmationSMS(mobile, studentName, hostelName, roomNumber) {
    const message = `Hi ${studentName}, your booking at ${hostelName} is confirmed! Room: ${roomNumber}. Welcome to your new home!`;
    return await this.sendSMS(mobile, message);
  }

  async sendPaymentReminderSMS(mobile, studentName, amount, dueDate) {
    const message = `Hi ${studentName}, your payment of ₹${amount} is due on ${dueDate}. Please pay to avoid late fees.`;
    return await this.sendSMS(mobile, message);
  }

  async sendMaintenanceUpdateSMS(mobile, studentName, status, description) {
    const message = `Hi ${studentName}, your maintenance request "${description}" status: ${status.toUpperCase()}. Thank you!`;
    return await this.sendSMS(mobile, message);
  }

  async sendCheckoutApprovalSMS(mobile, studentName, checkoutDate) {
    const message = `Hi ${studentName}, your checkout request for ${checkoutDate} has been approved. Please complete the inspection process.`;
    return await this.sendSMS(mobile, message);
  }

  async sendEmergencyAlertSMS(mobile, studentName, message) {
    const alertMessage = `URGENT: Hi ${studentName}, ${message}. Please contact hostel management immediately.`;
    return await this.sendSMS(mobile, alertMessage);
  }

  async sendRoomTransferSMS(mobile, studentName, status, newRoom) {
    let message = `Hi ${studentName}, your room transfer request status: ${status.toUpperCase()}.`;
    if (status === 'approved' && newRoom) {
      message += ` New room: ${newRoom}`;
    }
    return await this.sendSMS(mobile, message);
  }

  async sendBulkSMS(recipients, message) {
    const results = [];
    
    for (const recipient of recipients) {
      const result = await this.sendSMS(recipient.mobile, message.replace('{name}', recipient.name));
      results.push({
        mobile: recipient.mobile,
        name: recipient.name,
        ...result
      });
    }

    return results;
  }
}

module.exports = new SMSService();