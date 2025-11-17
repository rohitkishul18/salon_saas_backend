const mongoose = require('mongoose');

const ServiceSchema = new mongoose.Schema({
  salonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Salon', required: true },
  locationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Location', required: true },
  name: { type: String, required: true },
  description: { type: String, default: '' },
  price: { type: Number, default: 0 },
  durationMinutes: { type: Number, default: 30 },
  imageUrl: { type: String, default: null }
}, { timestamps: true });

module.exports = mongoose.model('Service', ServiceSchema);
