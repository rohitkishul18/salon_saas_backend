const Booking = require('../models/booking.model');
const Service = require('../models/service.model');
const Location = require('../models/location.model');
const { sendSuccess, sendError } = require('../utils/response');

// Create booking (public)
const createBooking = async (req, res, next) => {
  try {
    const { salonId, locationId, serviceId, customerName, customerPhone, scheduledAt, notes } = req.body;
    if (!salonId || !locationId || !serviceId || !customerName || !customerPhone || !scheduledAt) {
      return sendError(res, 400, 'Missing fields');
    }
    // basic validation that service and location belong to salon can be added
    const bk = await Booking.create({ salonId, locationId, serviceId, customerName, customerPhone, scheduledAt, notes });
    sendSuccess(res, bk, 'Booked');
  } catch (err) { next(err); }
};

// Admin: list bookings of salon
const listBookings = async (req, res, next) => {
  try {
    const salonId = req.user.salonId;
    const bookings = await Booking.find({ salonId }).sort({ createdAt: -1 }).limit(200);
    sendSuccess(res, bookings);
  } catch (err) { next(err); }
};

const updateBookingStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const salonId = req.user.salonId;
    const { status } = req.body;
    const updated = await Booking.findOneAndUpdate({ _id: id, salonId }, { status }, { new: true });
    if (!updated) return sendError(res, 404, 'Booking not found');
    sendSuccess(res, updated, 'Updated');
  } catch (err) { next(err); }
};

module.exports = { createBooking, listBookings, updateBookingStatus };
