// models/user.model.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: { 
    type: String, 
    unique: true, 
    required: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  password: { 
    type: String, 
    required: true,
    minlength: 6
  },
  role: { 
    type: String, 
    enum: ['salon-owner', 'superadmin'], 
    default: 'salon-owner' 
  },
  salonId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Salon',
    index: true
  },
  isActive: { 
    type: Boolean, 
    default: true 
  },
  
  // Auth token for active sessions (7 days)
  authToken: { 
    type: String, 
    default: null 
  },
  authTokenExpiry: { 
    type: Date, 
    default: null 
  },
  
  // Reset token for password recovery (1 hour)
  resetToken: { 
    type: String, 
    default: null 
  },
  resetTokenExpiry: { 
    type: Date, 
    default: null 
  },

  // Optional: Refresh token for extended sessions
  // refreshToken: { 
  //   type: String, 
  //   default: null 
  // }
}, { 
  timestamps: true 
});

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
UserSchema.methods.comparePassword = function(password) {
  return bcrypt.compare(password, this.password);
};

// Indexes for faster queries
UserSchema.index({ email: 1 });
UserSchema.index({ salonId: 1 });
UserSchema.index({ role: 1 });

module.exports = mongoose.model('User', UserSchema);