const Salon = require("../models/salon.model");
const Location = require("../models/location.model");
const Service = require("../models/service.model");
const Booking = require("../models/booking.model");
const User = require("../models/user.model");
const { sendSuccess, sendError } = require("../utils/response");

exports.getDashboardStats = async (req, res) => {
  try {
    // Total salons
    const totalSalons = await Salon.countDocuments();

    // Active/Deactive based on OWNER user
    const activeOwners = await User.countDocuments({ role: "salon-owner", isActive: true });
    const deactiveOwners = await User.countDocuments({ role: "salon-owner", isActive: false });

    // Locations & Services
    const totalLocations = await Location.countDocuments();
    const totalServices = await Service.countDocuments();

    // Bookings
    const totalBookings = await Booking.countDocuments();

    // Today bookings
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayBookings = await Booking.countDocuments({
      createdAt: { $gte: today }
    });

    // ⭐ Recent salons with real active status
    const salons = await Salon.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    const ownerUsers = await User.find({ role: "salon-owner" }).lean();

    const recentSalons = salons.map(salon => {
      const owner = ownerUsers.find(u => String(u.salonId) === String(salon._id));

      return {
        id: salon._id,
        name: salon.name,
        ownerName: owner?.name || salon.ownerName,
        isActive: owner?.isActive ?? false, // ✔ FIXED
        createdAt: salon.createdAt
      };
    });


    return res.status(200).json({
      success: true,
      message: "Dashboard stats fetched successfully",
      data: {
        salon: {
          total: totalSalons,
          active: activeOwners,      // ✔ FIXED
          deactive: deactiveOwners,  // ✔ FIXED
        },
        locations: totalLocations,
        services: totalServices,
        bookings: {
          total: totalBookings,
          today: todayBookings
        },
        recentSalons: recentSalons  // ✔ FIXED
      }
    });

  } catch (error) {
    console.error("Dashboard Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
};




exports.getAllSalons = async (req, res, next) => {
  try {
    const salons = await Salon.find().sort({ createdAt: -1 }).lean();
    const ownerUsers = await User.find({ role: "salon-owner" }).lean();

    const data = salons.map(salon => {
      const owner = ownerUsers.find(u => String(u.salonId) === String(salon._id));

      return {
        id: salon._id,
        name: salon.name,
        ownerName: owner?.name || "Unknown",
        email: owner?.email || salon.contact?.email,
        phone: owner?.phone || salon.contact?.phone,
        ownerActive: owner?.isActive ?? false,  // FIXED
        createdAt: salon.createdAt
      };
    });

    return sendSuccess(res, data, "Salons fetched");
  } catch (err) {
    next(err);
  }
};



exports.updateOwnerStatus = async (req, res, next) => {
  try {
    const { isActive } = req.body;

    await User.findOneAndUpdate(
      { salonId: req.params.id, role: "salon-owner" },
      { isActive }
    );

    return sendSuccess(res, null, "Status updated");
  } catch (err) {
    next(err);
  }
};

