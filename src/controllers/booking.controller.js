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

    // Ensure location belongs to salon
    const location = await Location.findOne({ _id: locationId, salonId });
    if (!location) return sendError(res, 400, 'Invalid salon location');

    // Ensure service belongs to salon
    const service = await Service.findOne({ _id: serviceId, salonId });
    if (!service) return sendError(res, 400, 'Invalid salon service');

    const bk = await Booking.create({
      salonId,
      locationId,
      serviceId,
      customerName,
      customerPhone,
      scheduledAt,
      notes
    });

    sendSuccess(res, bk, 'Booked');
  } catch (err) {
    next(err);
  }
};

// Admin: list bookings of salon
const listBookings = async (req, res, next) => {
  try {
    const salonId = req.user.salonId;

    const bookings = await Booking.find({ salonId })
      .populate('locationId', 'name')
      .populate('serviceId', 'title price')
      .sort({ createdAt: -1 });

    sendSuccess(res, bookings);
  } catch (err) {
    next(err);
  }
};

// Update booking status
const updateBookingStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const salonId = req.user.salonId;
    const { status } = req.body;

    const updated = await Booking.findOneAndUpdate(
      { _id: id, salonId },
      { status },
      { new: true }
    );

    if (!updated) return sendError(res, 404, 'Booking not found');

    sendSuccess(res, updated, 'Updated');
  } catch (err) {
    next(err);
  }
};

const deleteBooking = async (req, res, next) => {
  try {
    // perticular user booking booking Deleted
    const { id } = req.params;
    const salonId = req.user.salonId;
    await Booking.findOneAndDelete({ _id: id, salonId });
    sendSuccess(res, {}, 'Deleted');
  } catch (err) {
    next(err);
  }
};

module.exports = { createBooking, listBookings, updateBookingStatus ,deleteBooking};
