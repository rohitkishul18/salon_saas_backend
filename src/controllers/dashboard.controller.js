const Booking = require("../models/booking.model");
const Service = require("../models/service.model");
const Location = require("../models/location.model");
const Salon = require("../models/salon.model");

// GET /api/salon/dashboard
exports.getDashboard = async (req, res) => {
  try {
    const salonId = req.user.salonId; 
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);
    const [
      todayBookings,
      upcoming,
      servicesCount,
      locationsCount
    ] = await Promise.all([
      Booking.countDocuments({
        salonId,
        scheduledAt: { $gte: todayStart, $lte: todayEnd },
      }),

      Booking.countDocuments({
        salonId,
        scheduledAt: { $gt: new Date() },
        status: { $in: ["pending", "confirmed"] }
      }),

      Service.countDocuments({ salonId }),
      Location.countDocuments({ salonId })
    ]);
    const next = await Booking.findOne({
      salonId,
      scheduledAt: { $gt: new Date() }
    })
      .sort({ scheduledAt: 1 })
      .populate("serviceId", "name")
      .populate("locationId", "name");

    let nextAppointment = null;

    if (next) {
      nextAppointment = {
        customer: next.customerName,
        service: next.serviceId?.name || "Unknown",
        time: next.scheduledAt
          ? next.scheduledAt.toLocaleString()
          : "N/A",
        location: next.locationId?.name || "Unknown"
      };
    }
    const recent = await Booking.find({ salonId })
      .sort({ createdAt: -1 })
      .limit(3)
      .populate("serviceId", "name");

    const recentBookings = recent.map(b => ({
      customer: b.customerName,
      service: b.serviceId?.name || "Unknown",
      date: b.scheduledAt
        ? b.scheduledAt.toLocaleDateString()
        : (b.createdAt
            ? b.createdAt.toLocaleDateString()
            : "N/A"
          )
    }));
    const salon = await Salon.findById(salonId);

    const status = {
      info: !!salon,
      services: servicesCount > 0,
      gallery: salon?.gallery?.length > 0,
      locations: locationsCount > 0
    };

    return res.json({
      stats: {
        todayBookings,
        upcoming,
        services: servicesCount,
        locations: locationsCount
      },  
      nextAppointment,
      recentBookings,
      status
    });

  } catch (err) {
    console.error("Dashboard Error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
