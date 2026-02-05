const nodemailer = require("nodemailer");

// Create transporter without immediate verification
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false
    }
  });
};

// Export a function that creates transporter when needed
module.exports = {
  sendMail: async (mailOptions) => {
    try {
      const transporter = createTransporter();
      return await transporter.sendMail(mailOptions);
    } catch (error) {
      console.log('Email send error:', error.message);
      throw error;
    }
  }
};
