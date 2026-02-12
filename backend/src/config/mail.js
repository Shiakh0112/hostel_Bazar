const { Resend } = require('resend');

let resend = null;
if (process.env.RESEND_API_KEY) {
  resend = new Resend(process.env.RESEND_API_KEY);
}

module.exports = {
  sendMail: async (mailOptions) => {
    try {
      if (!resend) {
        console.log('⚠️ Resend API key not configured');
        return null;
      }

      const { data, error } = await resend.emails.send({
        from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
        to: mailOptions.to,
        subject: mailOptions.subject,
        html: mailOptions.html,
      });

      if (error) {
        console.error('❌ Email send failed:', error);
        throw error;
      }

      console.log('✅ Email sent successfully:', data.id);
      return data;
    } catch (error) {
      console.error('❌ Email send error:', error.message);
      throw error;
    }
  }
};
