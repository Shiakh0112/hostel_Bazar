const mailConfig = require('../config/mail');

class EmailService {
  static async sendEmail({ to, subject, html }) {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      html
    };
    return await mailConfig.sendMail(mailOptions);
  }
  static async sendOTP(email, otp, name) {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Verify Your Account - Hostel Management System',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Welcome to Hostel Management System!</h2>
          <p>Hi ${name},</p>
          <p>Thank you for signing up. Please use the following OTP to verify your account:</p>
          <div style="background-color: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0;">
            <h1 style="color: #007bff; font-size: 32px; margin: 0;">${otp}</h1>
          </div>
          <p>This OTP will expire in 10 minutes.</p>
          <p>If you didn't create this account, please ignore this email.</p>
          <hr>
          <p style="color: #666; font-size: 12px;">
            This is an automated email. Please do not reply to this email.
          </p>
        </div>
      `
    };

    return await mailConfig.sendMail(mailOptions);
  }

  static async sendPasswordResetOTP(email, otp, name) {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset - Hostel Management System',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Password Reset Request</h2>
          <p>Hi ${name},</p>
          <p>You requested to reset your password. Please use the following OTP:</p>
          <div style="background-color: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0;">
            <h1 style="color: #dc3545; font-size: 32px; margin: 0;">${otp}</h1>
          </div>
          <p>This OTP will expire in 10 minutes.</p>
          <p>If you didn't request this, please ignore this email.</p>
          <hr>
          <p style="color: #666; font-size: 12px;">
            This is an automated email. Please do not reply to this email.
          </p>
        </div>
      `
    };

    return await mailConfig.sendMail(mailOptions);
  }

  static async sendBookingNotification(email, name, hostelName, status) {
    let subject, message, color;

    switch (status) {
      case 'approved':
        subject = 'Booking Approved';
        message = `Your booking request for ${hostelName} has been approved! Please make the advance payment to confirm your booking.`;
        color = '#28a745';
        break;
      case 'rejected':
        subject = 'Booking Rejected';
        message = `Unfortunately, your booking request for ${hostelName} has been rejected.`;
        color = '#dc3545';
        break;
      case 'confirmed':
        subject = 'Booking Confirmed';
        message = `Great news! Your booking for ${hostelName} has been confirmed. Room details will be shared soon.`;
        color = '#007bff';
        break;
      default:
        return;
    }

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: `${subject} - Hostel Management System`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: ${color};">${subject}</h2>
          <p>Hi ${name},</p>
          <p>${message}</p>
          <p>Login to your dashboard for more details.</p>
          <hr>
          <p style="color: #666; font-size: 12px;">
            This is an automated email. Please do not reply to this email.
          </p>
        </div>
      `
    };

    return await mailConfig.sendMail(mailOptions);
  }

  static async sendPaymentNotification(email, name, amount, status) {
    let subject, message, color;

    if (status === 'success') {
      subject = 'Payment Successful';
      message = `Your payment of ₹${amount} has been processed successfully.`;
      color = '#28a745';
    } else {
      subject = 'Payment Failed';
      message = `Your payment of ₹${amount} could not be processed. Please try again.`;
      color = '#dc3545';
    }

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: `${subject} - Hostel Management System`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: ${color};">${subject}</h2>
          <p>Hi ${name},</p>
          <p>${message}</p>
          <p>Check your dashboard for payment history and receipts.</p>
          <hr>
          <p style="color: #666; font-size: 12px;">
            This is an automated email. Please do not reply to this email.
          </p>
        </div>
      `
    };

    return await mailConfig.sendMail(mailOptions);
  }

  static async sendMaintenanceNotification(email, name, ticketNumber, status) {
    let subject, message, color;

    switch (status) {
      case 'assigned':
        subject = 'Maintenance Request Assigned';
        message = `Your maintenance request #${ticketNumber} has been assigned to our staff.`;
        color = '#ffc107';
        break;
      case 'completed':
        subject = 'Maintenance Request Completed';
        message = `Your maintenance request #${ticketNumber} has been completed.`;
        color = '#28a745';
        break;
      default:
        return;
    }

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: `${subject} - Hostel Management System`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: ${color};">${subject}</h2>
          <p>Hi ${name},</p>
          <p>${message}</p>
          <p>Login to your dashboard for more details.</p>
          <hr>
          <p style="color: #666; font-size: 12px;">
            This is an automated email. Please do not reply to this email.
          </p>
        </div>
      `
    };

    return await mailConfig.sendMail(mailOptions);
  }

  static async sendWelcomeEmail(email, name, role) {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Welcome to Hostel Management System',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #007bff;">Welcome to Hostel Management System!</h2>
          <p>Hi ${name},</p>
          <p>Welcome to our platform! Your account as a ${role} has been successfully created.</p>
          <p>You can now login and start using our services.</p>
          <p>If you have any questions, feel free to contact our support team.</p>
          <hr>
          <p style="color: #666; font-size: 12px;">
            This is an automated email. Please do not reply to this email.
          </p>
        </div>
      `
    };

    return await mailConfig.sendMail(mailOptions);
  }
}

module.exports = EmailService;