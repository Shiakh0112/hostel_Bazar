const generateOTP = require('../utils/generateOTP');
const emailService = require('./email.service');

class OTPService {
  static async generateAndSendOTP(email, name, type = 'verification') {
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    try {
      if (type === 'verification') {
        await emailService.sendOTP(email, otp, name);
      } else if (type === 'password_reset') {
        await emailService.sendPasswordResetOTP(email, otp, name);
      }

      return {
        success: true,
        otp,
        otpExpiry
      };
    } catch (error) {
      console.error('OTP send error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  static validateOTP(userOTP, storedOTP, otpExpiry) {
    if (!userOTP || !storedOTP || !otpExpiry) {
      return {
        valid: false,
        message: 'Invalid OTP data'
      };
    }

    if (new Date() > otpExpiry) {
      return {
        valid: false,
        message: 'OTP has expired'
      };
    }

    if (userOTP !== storedOTP) {
      return {
        valid: false,
        message: 'Invalid OTP'
      };
    }

    return {
      valid: true,
      message: 'OTP verified successfully'
    };
  }

  static async resendOTP(email, name, type = 'verification') {
    return await this.generateAndSendOTP(email, name, type);
  }
}

module.exports = OTPService;