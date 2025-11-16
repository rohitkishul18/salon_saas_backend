const mongoose = require('mongoose');

const ServiceSchema = new mongoose.Schema({
  salonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Salon', required: true },
  locationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Location', required: true },
  name: { type: String, required: true },
  description: String,
  price: { type: Number, default: 0 },
  durationMinutes: { type: Number, default: 30 },
  imageUrl: String
}, { timestamps: true });

module.exports = mongoose.model('Service', ServiceSchema);
