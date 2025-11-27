const Salon = require("../models/salon.model");
const Location = require("../models/location.model");
const Review = require("../models/review.model");
const Service = require("../models/service.model");

exports.getHomeData = async (req, res) => {
  try {
    const { salonSlug } = req.params;

    // 1️⃣ Get salon
    const salon = await Salon.findOne({ slug: salonSlug });
    if (!salon) {
      return res.status(404).json({
        success: false,
        message: "Salon not found"
      });
    }

    // 2️⃣ Get all locations / branches
    const locations = await Location.find({ salonId: salon._id }).lean();

    // 3️⃣ Get all reviews for rating calculation
    const reviews = await Review.find({ salonId: salon._id });

    const avgRating = 0;

    // 4️⃣ Get services count
    const serviceCount = await Service.countDocuments({ salonId: salon._id });

    return res.status(200).json({
      success: true,
      data: {
        salon,
        branches: locations,
        stats: {
          reviewCount: reviews.length,
          rating: avgRating,
          serviceCount: serviceCount,
          branchCount: locations.length
        }
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching home data",
      error: error.message
    });
  }
};
