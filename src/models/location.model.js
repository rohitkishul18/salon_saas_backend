const mongoose = require('mongoose');

const LocationSchema = new mongoose.Schema({
  salonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Salon', required: true },
  name: { type: String, required: true }, // e.g. Bandra
  slug: { type: String, required: true },
  address: String,
  phone: String,
  openingHours: Object // e.g. { from: '10:00', to: '18:00' }
}, { timestamps: true });

LocationSchema.index({ salonId: 1, slug: 1 }, { unique: true });

module.exports = mongoose.model('Location', LocationSchema);
