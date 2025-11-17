const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  salonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Salon', required: true },
  locationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Location' },
  rating: { type: Number, min: 1, max: 5 },
  comment: String,
  customerName: String
}, { timestamps: true });

module.exports = mongoose.model('Review', ReviewSchema);
