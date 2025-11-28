const Booking = require('../models/booking.model');
const Service = require('../models/service.model');
const Location = require('../models/location.model');
const Salon = require('../models/salon.model');
const { sendSuccess, sendError } = require('../utils/response');
const transporter = require('../config/email.config');
const { sendBookingNotification } = require('../utils/booking-email.util');


const createBooking = async (req, res, next) => {
  try {
    const { salonId, locationId, serviceId, customerName, status, customerPhone, scheduledAt, notes } = req.body;
    if (!salonId || !locationId || !serviceId || !customerName || !customerPhone || !scheduledAt) {
      return sendError(res, 400, 'Missing fields');
    }

    // Fetch salon by ID
    const salon = await Salon.findById(salonId);
    console.log('Salon fetched for booking:', salonId, salon);
    if (!salon) return sendError(res, 404, 'Salon not found');

    // Ensure location belongs to salon
    const location = await Location.findOne({ _id: locationId, salonId });
    if (!location) return sendError(res, 400, 'Invalid salon location');

    // Ensure service belongs to salon
    const service = await Service.findOne({ _id: serviceId, salonId });
    if (!service) return sendError(res, 400, 'Invalid salon service');

    const booking = await Booking.create({
      salonId,
      locationId,
      serviceId,
      customerName,
      customerPhone,
      scheduledAt,
      status,
      notes
    });

    sendSuccess(res, booking, 'Booked');
    (async () => {
      try {
        sendBookingNotification(
          salon,
          location,
          service,
          customerName,
          customerPhone,
          scheduledAt,
          notes,
          (error, info) => {
            if (error) {
              console.error('Error in sendBookingNotification:', error);
            }
          }
        );
      } catch (emailErr) {
        console.error('Error preparing booking email:', emailErr);
      }
    })();
  } catch (err) {
    next(err);
  }
};





// Create booking (public)
// const createBooking = async (req, res, next) => {
//   try {
//     const { salonId, locationId, serviceId, customerName, status, customerPhone, scheduledAt, notes } = req.body;
//     if (!salonId || !locationId || !serviceId || !customerName || !customerPhone || !scheduledAt) {
//       return sendError(res, 400, 'Missing fields');
//     }

//     // Ensure location belongs to salon
//     const location = await Location.findOne({ _id: locationId, salonId });
//     if (!location) return sendError(res, 400, 'Invalid salon location');

//     // Ensure service belongs to salon
//     const service = await Service.findOne({ _id: serviceId, salonId });
//     if (!service) return sendError(res, 400, 'Invalid salon service');

//     const bk = await Booking.create({
//       salonId,
//       locationId,
//       serviceId,
//       customerName,
//       customerPhone,
//       scheduledAt,
//       status,
//       notes
//     });

//     sendSuccess(res, bk, 'Booked');
//   } catch (err) {
//     next(err);
//   }
// };

// Admin: list bookings of salon with pagination
const listBookings = async (req, res, next) => {
  try {
    const salonId = req.user.salonId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    const query = { salonId };
    const total = await Booking.countDocuments(query);

    // Get paginated bookings
    const bookings = await Booking.find(query)
      .skip(skip)
      .limit(limit)
      .populate('locationId', 'name address')
      .populate('serviceId', 'name durationMinutes price')
      .sort({ createdAt: -1 });

    const pagination = {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    };

    sendSuccess(res, { data: bookings, pagination });
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

module.exports = { createBooking, listBookings, updateBookingStatus ,deleteBooking , sendBookingNotification};