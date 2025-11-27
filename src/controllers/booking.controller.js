const Booking = require('../models/booking.model');
const Service = require('../models/service.model');
const Location = require('../models/location.model');
const Salon = require('../models/salon.model');
const { sendSuccess, sendError } = require('../utils/response');
const transporter = require('../config/email.config');


const sendBookingNotification = (salon, location, service, customerName, customerPhone, scheduledAt, notes, callback) => {
  if (!salon || !salon.contact?.email) {
    console.warn('No salon owner email found for notification');
    return callback(new Error('No email configured'), null);
  }

  const ownerEmail = salon.contact.email;
  const serviceName = service.name || 'Unknown Service';
  const formattedScheduledAt = new Date(scheduledAt).toLocaleString('en-IN', {
    timeZone: salon.settings?.timezone || 'Asia/Kolkata'
  });

  const mailOptions = {
    from: process.env.EMAIL_USER, // Sender email from env
    to: ownerEmail, // Salon owner
    subject: `New Booking Alert: ${customerName} at ${location.name}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <h2 style="color: #333; text-align: center;">New Appointment Booked! 🎉</h2>
        <div style="background: white; padding: 20px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <p><strong>Salon:</strong> ${salon.name}</p>
          <p><strong>Branch/Location:</strong> ${location.name}</p>
          <p><strong>Address:</strong> ${location.address || salon.contact.address}</p>
          
          <hr style="border: 1px solid #eee; margin: 20px 0;">
          
          <h3>Customer Details</h3>
          <p><strong>Name:</strong> ${customerName}</p>
          <p><strong>Phone:</strong> ${customerPhone}</p>
          
          <hr style="border: 1px solid #eee; margin: 20px 0;">
          
          <h3>Booking Details</h3>
          <p><strong>Service:</strong> ${serviceName}</p>
          <p><strong>Scheduled At:</strong> ${formattedScheduledAt}</p>
          ${notes ? `<p><strong>Notes:</strong> ${notes}</p>` : ''}
          
          <hr style="border: 1px solid #eee; margin: 20px 0;">
          
          <p style="text-align: center; color: #666;">This is an automated notification. Reply to this email if needed.</p>
        </div>
      </div>
    `,
  };

  console.log('Sending booking notification email to:', ownerEmail);
  // Send email using callback (non-blocking)
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Email notification failed:', error);
      return callback(error, null);
    } else {
      console.log('Booking email sent successfully:', info.messageId);
      return callback(null, info);
    }
  });
};

// Create booking (public) - Uses salonId from request body
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

    // Send success response immediately (non-blocking)
    sendSuccess(res, booking, 'Booked');

    // Fire-and-forget: Send email asynchronously without blocking the response
    (async () => {
      try {
        // Call the utility function with callback
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
            // No need to handle success here beyond logging (already in function)
          }
        );
      } catch (emailErr) {
        console.error('Error preparing booking email:', emailErr);
      }
    })(); // Immediate async execution
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

    // Get total count
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