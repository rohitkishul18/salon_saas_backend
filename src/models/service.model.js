const mongoose = require('mongoose');

const ServiceSchema = new mongoose.Schema({
  salonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Salon', required: true },
  locationIds: [
    { type: mongoose.Schema.Types.ObjectId, ref: 'Location' }
  ],
  name: { type: String, required: true },
  price: { type: Number, default: 0 },
  durationMinutes: { type: Number, default: 30 },
}, { timestamps: true });

module.exports = mongoose.model("Service", ServiceSchema);
