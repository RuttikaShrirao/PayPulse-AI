// backend/services/emailService.js
const nodemailer = require('nodemailer');

const sendRecoveryEmail = async (toEmail, userName, aiMessage) => {
  try {
    let transporter;

    // 👨‍🏫 DUAL SETUP:
    // If you provided Gmail credentials in .env, we use them (Production).
    // Otherwise, we use Ethereal (Test Mode).
    if (process.env.GMAIL_USER && process.env.GMAIL_PASS) {
      console.log("🚀 [EMAIL] Sending REAL email via Gmail...");
      transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_PASS,
        },
      });
    } else {
      console.log("🧪 [EMAIL] Using Ethereal Test Mode...");
      let testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
    }

    // Format the AI message so HTML understands the line breaks
    const formattedAiMessage = aiMessage.replace(/\n/g, '<br/>');

    const mailOptions = {
      from: `"PayPulse AI 🏋️‍♂️" <${process.env.GMAIL_USER || 'recovery@paypulse.ai'}>`,
      to: toEmail,
      subject: `Gym Membership Update for ${userName}`,
      html: `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; background-color: #f9f9f9;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 40px; border-radius: 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); border: 1px solid #eee;">
            <h1 style="color: #4f46e5; margin-bottom: 20px; font-size: 24px;">Hello ${userName},</h1>
            <p style="font-size: 16px; color: #4b5563; line-height: 1.6;">${formattedAiMessage}</p>
            <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #f3f4f6; color: #9ca3af; font-size: 12px; text-align: center;">
              This is an AI-powered recovery assistant from <strong>PayPulse-AI</strong>.
            </div>
          </div>
        </div>
      `,
    };

    let info = await transporter.sendMail(mailOptions);
    
    if (!process.env.GMAIL_USER) {
      console.log(`🔗 [EMAIL] PREVIEW URL: ${nodemailer.getTestMessageUrl(info)}`);
    } else {
      console.log(`✅ [EMAIL] Successfully delivered to ${toEmail}`);
    }

    return info;
  } catch (error) {
    console.error("❌ Nodemailer Error:", error);
    throw error;
  }
};

module.exports = { sendRecoveryEmail };
