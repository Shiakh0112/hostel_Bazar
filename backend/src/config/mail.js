const nodemailer = require("nodemailer");

const createTransporter = () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('⚠️ Email credentials not configured');
    return null;
  }

  return nodemailer.createTransporter({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    }
  });
};

module.exports = {
  sendMail: async (mailOptions) => {
    try {
      const transporter = createTransporter();
      if (!transporter) {
        console.log('Email service not available');
        return null;
      }
      const info = await transporter.sendMail(mailOptions);
      console.log('✅ Email sent successfully:', info.messageId);
      return info;
    } catch (error) {
      console.error('❌ Email send failed:', error.message);
      throw error;
    }
  }
};
