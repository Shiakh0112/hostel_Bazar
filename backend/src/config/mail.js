const SibApiV3Sdk = require('sib-api-v3-sdk');

const client = SibApiV3Sdk.ApiClient.instance;

if (!process.env.BREVO_API_KEY) {
  console.log("❌ BREVO_API_KEY missing in environment variables");
}

client.authentications['api-key'].apiKey = process.env.BREVO_API_KEY;

const emailApi = new SibApiV3Sdk.TransactionalEmailsApi();

module.exports = {
  sendMail: async ({ to, subject, html }) => {
    try {
      const response = await emailApi.sendTransacEmail({
        sender: {
          name: "Hostel Management System",
          email: process.env.BREVO_SENDER_EMAIL,
        },
        to: [{ email: to }],
        subject,
        htmlContent: html,
      });

      console.log("✅ Email sent via Brevo");
      return response;
    } catch (error) {
      console.error(
        "❌ Brevo Email Error:",
        error.response?.body || error.message
      );
      throw error;
    }
  },
};
