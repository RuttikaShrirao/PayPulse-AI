// backend/services/emailService.js
const nodemailer = require('nodemailer');

// 👨‍🏫 This function sends the AI-generated recovery email.
const sendRecoveryEmail = async (toEmail, userName, aiMessage) => {
  try {
    // 1. Create a "Test Account" on the fly using Ethereal
    // In a production app, you would replace this with real Gmail/SendGrid credentials.
    let testAccount = await nodemailer.createTestAccount();

    // 2. Setup the transporter (The "Postal Truck")
    let transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: testAccount.user, // generated ethereal user
        pass: testAccount.pass, // generated ethereal password
      },
    });

    // 3. Define the Email Content
    const mailOptions = {
      from: '"PayPulse AI 🏋️‍♂️" <recovery@paypulse.ai>',
      to: toEmail,
      subject: `Gym Membership Update for ${userName}`,
      text: aiMessage, // Plain text version
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #3399cc;">Hello ${userName},</h2>
          <p style="font-size: 16px; color: #555;">${aiMessage}</p>
          <hr/>
          <p style="font-size: 12px; color: #999;">This is an automated recovery message from PayPulse-AI.</p>
        </div>
      `,
    };

    // 4. Send the mail
    let info = await transporter.sendMail(mailOptions);

    console.log(`\n📬 [EMAIL] Message sent to: ${toEmail}`);
    console.log(`🔗 [EMAIL] PREVIEW URL: ${nodemailer.getTestMessageUrl(info)}`);
    
    return info;
  } catch (error) {
    console.error("❌ Nodemailer Error:", error);
    throw error;
  }
};

module.exports = { sendRecoveryEmail };
