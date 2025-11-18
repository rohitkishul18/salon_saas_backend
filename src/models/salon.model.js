const mongoose = require('mongoose');

const SalonSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },

  description: String,

  ownerName: { type: String },

  contact: {
    phone: String,
    email: String,
    address: String
  },

  settings: {
    currency: { type: String, default: 'INR' },
    timezone: { type: String, default: 'Asia/Kolkata' }
  }
}, { timestamps: true });

module.exports = mongoose.model('Salon', SalonSchema);
