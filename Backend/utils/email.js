const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

const sendBudgetAlertEmail = async (toEmail, subject, message) => {
  try {
    await transporter.sendMail({
      from: `"Jervis" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject,
      html: `
        <div style="font-family: sans-serif; background: #0a0a0f; color: #ffffff; padding: 24px; border-radius: 12px;">
          <h2 style="color: #a78bfa; margin-top: 0;">${subject}</h2>
          <p style="color: #d1d5db; line-height: 1.6;">${message}</p>
          <p style="color: #6b7280; font-size: 12px; margin-top: 24px;">— Jervis, your AI expense tracker</p>
        </div>
      `,
    });
    console.log('Budget alert email sent to', toEmail);
  } catch (err) {
    console.error('Failed to send email:', err.message);
  }
};

module.exports = { sendBudgetAlertEmail };