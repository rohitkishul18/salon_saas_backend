// controllers/auth.controller.js (FINAL FIX - Correct Token Payload)
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const bcrypt = require('bcryptjs');
const Salon = require('../models/salon.model');
const makeSlug = require('../utils/slugify');
const { sendSuccess, sendError } = require('../utils/response');
const { sendResetEmail } = require('../utils/forgot-password.util');

// Helper: Generate JWT token for authentication
const generateAuthToken = (userId, salonId, role) => {
  return jwt.sign(
    { id: userId, salonId: salonId, role: role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// Helper: Generate reset token - FIXED to use 'id' not 'userId'
const generateResetToken = (userId) => {
  return jwt.sign(
    { id: userId, model: 'salon-owner' }, // ✅ Changed from 'userId' to 'id'
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
};

const register = async (req, res, next) => {
  try {
    const { salonName, ownerName, email, phone, password } = req.body;
    
    // Validation
    if (!salonName || !ownerName || !email || !phone || !password) {
      return sendError(res, 400, 'All fields are required');
    }

    if (password.length < 6) {
      return sendError(res, 400, 'Password must be at least 6 characters');
    }

    // Check if salon name already exists
    const existingSalon = await Salon.findOne({ name: salonName.trim() });
    if (existingSalon) {
      return sendError(res, 400, 'Salon name already registered');
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return sendError(res, 400, 'Email already registered');
    }

    // Create unique slug
    const slug = makeSlug(salonName);
    let uniqueSlug = slug;
    let i = 1;

    while (await Salon.findOne({ slug: uniqueSlug })) {
      uniqueSlug = `${slug}-${i++}`;
    }

    // Create salon
    const salon = await Salon.create({
      name: salonName.trim(),
      slug: uniqueSlug,
      contact: { 
        phone: phone.trim(), 
        email: email.toLowerCase().trim() 
      }
    });

    // Create owner user
    const user = await User.create({
      name: ownerName.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      password,
      isActive: true,
      role: 'salon-owner',
      salonId: salon._id
    });

    // Generate and store auth token
    const token = generateAuthToken(user._id, salon._id, user.role);
    user.authToken = token;
    user.authTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    await user.save();

    return sendSuccess(
      res,
      {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isActive: user.isActive,
          salonId: salon._id
        },
        salon: {
          id: salon._id,
          name: salon.name,
          slug: salon.slug
        }
      },
      'Registration successful',
      201
    );
  } catch (err) {
    console.error('Registration Error:', err);
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendError(res, 400, 'Email and password are required');
    }

    // Fetch user
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return sendError(res, 401, 'Invalid credentials');
    }

    // Check if user is active
    if (user.isActive === false) {
      return sendError(
        res,
        403,
        'Your account has been deactivated by admin. Please contact support.'
      );
    }

    // Password check
    const match = await user.comparePassword(password);
    if (!match) {
      return sendError(res, 401, 'Invalid credentials');
    }

    // Check if token is still valid
    let token;
    if (user.authToken && user.authTokenExpiry && user.authTokenExpiry > new Date()) {
      // Reuse existing valid token
      token = user.authToken;
    } else {
      // Generate new token
      token = generateAuthToken(user._id, user.salonId, user.role);
      user.authToken = token;
      user.authTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      await user.save();
    }

    return sendSuccess(
      res,
      {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          salonId: user.salonId,
          isActive: user.isActive
        }
      },
      'Login successful',
      200
    );

  } catch (err) {
    console.error('Login Error:', err);
    next(err);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return sendError(res, 400, 'Email is required');
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return sendError(res, 400, 'Invalid email format');
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase().trim() }).populate('salonId', 'name');

    if (!user) {
      // Security: Don't reveal if email exists
      return sendSuccess(
        res,
        {},
        'If this email is registered, a password reset link has been sent. Please check your inbox and spam folder.',
        200
      );
    }

    // Generate reset token with correct payload
    const resetToken = generateResetToken(user._id);
    user.resetToken = resetToken;
    user.resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    // Get salon name for email branding
    let salonName = 'Admin Team';
    if (user.salonId && user.salonId.name) {
      salonName = user.salonId.name;
    }

    // Generate frontend reset URL
    const resetUrlBase = process.env.FRONTEND_URL 
      ? `${process.env.FRONTEND_URL}/reset-password`
      : 'http://localhost:4200/reset-password';

    // Send reset email (non-blocking)
    sendResetEmail(user, 'salon-owner', resetUrlBase, salonName)
      .then(() => {
        console.log(`✅ Password reset email sent to ${user.email}`);
      })
      .catch((err) => {
        console.error(`❌ Failed to send reset email to ${user.email}:`, err.message);
      });

    return sendSuccess(
      res,
      {},
      'If this email is registered, a password reset link has been sent. Please check your inbox and spam folder.',
      200
    );

  } catch (err) {
    console.error('Forgot Password Error:', err);
    return sendError(res, 500, 'An error occurred. Please try again later.');
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { token, email, newPassword } = req.body;

    if (!token || !email || !newPassword) {
      return sendError(res, 400, 'Token, email, and new password are required');
    }

    // Validate password
    if (newPassword.length < 6) {
      return sendError(res, 400, 'Password must be at least 6 characters long');
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    
    if (!user) {
      return sendError(res, 404, 'User not found');
    }

    // Check if reset token exists
    if (!user.resetToken || !user.resetTokenExpiry) {
      return sendError(res, 400, 'Invalid or expired reset token');
    }

    // Check if token matches
    if (user.resetToken !== token) {
      return sendError(res, 400, 'Invalid reset token');
    }

    // Check if token is expired
    if (Date.now() > user.resetTokenExpiry.getTime()) {
      user.resetToken = undefined;
      user.resetTokenExpiry = undefined;
      await user.save();
      return sendError(res, 400, 'Reset token has expired. Please request a new one.');
    }

    // Verify JWT token
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // ✅ FIXED: Check decoded.userId (matches payload from email utility)
      if (decoded.userId !== user._id.toString()) {
        return sendError(res, 400, 'Token does not match user');
      }

      if (decoded.model !== 'salon-owner') {
        return sendError(res, 400, 'Invalid token type');
      }

    } catch (jwtError) {
      console.error('JWT Verification Error:', jwtError.message);
      return sendError(res, 400, 'Invalid or expired token');
    }

    // Update password
    user.password = newPassword;
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;

    // Generate new auth token after password reset
    const newAuthToken = generateAuthToken(user._id, user.salonId, user.role);
    user.authToken = newAuthToken;
    user.authTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await user.save();

    return sendSuccess(
      res,
      {
        token: newAuthToken,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          salonId: user.salonId
        }
      },
      'Password reset successful! You can now login with your new password.',
      200
    );

  } catch (err) {
    console.error('Reset Password Error:', err);
    next(err);
  }
};

module.exports = { 
  register, 
  login, 
  forgotPassword, 
  resetPassword 
};