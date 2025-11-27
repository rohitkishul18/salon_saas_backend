// models/customer.model.js
const mongoose = require("mongoose");
const bcrypt = require('bcryptjs');

const customerSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
    },

    salonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Salon",
      required: true, 
    },

    // Auth token for login sessions (30 days validity)
    authToken: { 
      type: String,
      default: null
    },
    
    authTokenExpiry: { 
      type: Date,
      default: null
    },

    // Reset token for password recovery (1 hour validity)
    resetToken: { 
      type: String,
      default: null
    },
    
    resetTokenExpiry: { 
      type: Date,
      default: null
    },

    // Optional: For refresh token implementation
    // refreshToken: { 
    //   type: String, 
    //   default: null 
    // }
  },
  { 
    timestamps: true 
  }
);

// Hash password before saving
customerSchema.pre('save', async function(next) {
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
customerSchema.methods.comparePassword = function(password) {
  return bcrypt.compare(password, this.password);
};

// Index for faster email lookups
customerSchema.index({ email: 1 });

// Index for salon-based queries
customerSchema.index({ salonId: 1 });

module.exports = mongoose.model("Customer", customerSchema);