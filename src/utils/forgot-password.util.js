// utils/forgot-password.util.js (Updated - Dynamic Salon Name)
const jwt = require('jsonwebtoken');
const transporter = require('../config/email.config'); // Your Nodemailer config

const sendResetEmail = async (user, modelName, resetUrlBase, salonName='Unknown Salon') => { // Added salonName param with fallback
  try {
    // Generate reset token (JWT, expires in 1 hour)
    const resetToken = jwt.sign(
      { userId: user._id, model: modelName },
      process.env.JWT_SECRET || 'fallback-secret-change-this',
      { expiresIn: '1h' }
    );

    // Save token and expiry to user
    user.resetToken = resetToken;
    user.resetTokenExpiry = Date.now() + 3600000; // 1 hour in ms
    await user.save();

    // Build reset URL
    const resetUrl = `${resetUrlBase}?token=${resetToken}&email=${user.email}`;

    // Dynamic email content using salonName
    const message = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <h2 style="color: #333; text-align: center;">Password Reset Request</h2>
        <div style="background: white; padding: 20px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <p>Hello ${user.name || user.fullName || 'admin'},</p>
          <p>You requested a password reset for your ${modelName} account. Click the link below:</p>
          <a href="${resetUrl}" style="display: inline-block; background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 20px 0;">Reset Password</a>
          <p>This link expires in 1 hour. If you didn't request this, ignore this email.</p>
          <hr style="border: 1px solid #eee; margin: 20px 0;">
          <p style="text-align: center; color: #666;">Best, ${salonName} Team</p>  <!-- Dynamic salon name here -->
        </div>
      </div>
    `;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: `Password Reset - ${salonName}`,  // Dynamic subject
      html: message,
    };

    console.log(`Sending ${modelName} reset email to:`, user.email);

    // Send email (non-blocking callback)
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error(`${modelName} reset email failed:`, error);
      } else {
        console.log(`${modelName} reset email sent:`, info.messageId);
      }
    });

    return { success: true, message: `Reset link sent to your email from ${salonName}!` };
  } catch (err) {
    console.error('Error in sendResetEmail:', err);
    throw new Error('Failed to send reset email');
  }
};

module.exports = { sendResetEmail };