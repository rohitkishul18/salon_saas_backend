const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  salonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Salon', required: true },
  locationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Location', required: true },
  serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
  customerName: { type: String, required: true },
  customerPhone: { type: String, required: true },
  scheduledAt: { type: Date, required: true },
  status: { type: String, enum: ['pending','confirmed','cancelled','done'], default: 'confirmed' },
  notes: String
}, { timestamps: true });

module.exports = mongoose.model('Booking', BookingSchema);
