const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
  // For development, use ethereal email (fake SMTP)
  // For production, use real SMTP credentials from .env
  
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS && process.env.EMAIL_USER !== 'vh@iiitdmj.ac.in') {
    // Production: Use real email
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: process.env.EMAIL_PORT || 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  } else {
    // Development: Use console logging
    return {
      sendMail: async (mailOptions) => {
        console.log('\n=== EMAIL WOULD BE SENT ===');
        console.log('To:', mailOptions.to);
        console.log('Subject:', mailOptions.subject);
        console.log('Content:', mailOptions.text || mailOptions.html);
        console.log('===========================\n');
        return { messageId: 'dev-mode-' + Date.now() };
      }
    };
  }
};

const sendPasswordResetEmail = async (email, resetToken, req) => {
  const transporter = createTransporter();
  
  const resetUrl = `${req.protocol}://${req.get('host')}/reset-password/${resetToken}`;
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const frontendResetUrl = `${frontendUrl}/reset-password/${resetToken}`;
  
  const mailOptions = {
    from: process.env.EMAIL_FROM || 'noreply@vh.iiitdmj.ac.in',
    to: email,
    subject: 'Password Reset Request - IIITDMJ Visitors Hostel',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2C5282;">Password Reset Request</h2>
        <p>You have requested to reset your password for IIITDMJ Visitors' Hostel.</p>
        <p>Click the button below to reset your password. This link will expire in 1 hour.</p>
        <div style="margin: 30px 0;">
          <a href="${frontendResetUrl}" 
             style="background-color: #3182CE; color: white; padding: 12px 30px; 
                    text-decoration: none; border-radius: 5px; display: inline-block;">
            Reset Password
          </a>
        </div>
        <p style="color: #666; font-size: 14px;">
          Or copy and paste this link in your browser:<br>
          <a href="${frontendResetUrl}">${frontendResetUrl}</a>
        </p>
        <p style="color: #666; font-size: 12px; margin-top: 30px;">
          If you didn't request this, please ignore this email.
        </p>
        <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;">
        <p style="color: #999; font-size: 12px;">
          IIIT Design & Manufacturing Jabalpur<br>
          Visitors' Hostel Management System
        </p>
      </div>
    `,
    text: `
      Password Reset Request
      
      You have requested to reset your password for IIITDMJ Visitors' Hostel.
      
      Click the link below to reset your password. This link will expire in 1 hour.
      ${frontendResetUrl}
      
      If you didn't request this, please ignore this email.
      
      IIIT Design & Manufacturing Jabalpur
      Visitors' Hostel Management System
    `
  };
  
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Password reset email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Email sending failed:', error.message);
    throw error;
  }
};

module.exports = {
  sendPasswordResetEmail
};
