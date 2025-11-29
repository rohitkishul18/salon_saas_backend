const Salon = require("../models/salon.model");
const Location = require("../models/location.model");
const Review = require("../models/review.model");
const Service = require("../models/service.model");
const { sendSuccess, sendError } = require("../utils/response");

exports.getHomeData = async (req, res) => {
  try {
    const { salonSlug } = req.params;

    if (!salonSlug) {
      return sendError(res, "Salon slug is required", 400);
    }

    const salon = await Salon.findOne({ slug: salonSlug }).lean();
    if (!salon) {
      return sendError(res, "Salon not found", 404);
    }
    const branches = await Location.find({ salonId: salon._id }).lean();

 const reviews = await Review.find({ salonId: salon._id });

    const avgRating = 0;
    const serviceCount = await Service.countDocuments({ salonId: salon._id });

    const responseData = {
      salon,
      branches,
      stats: {
        reviewCount : reviews.length,
        rating: avgRating,
        serviceCount,
        branchCount: branches.length
      }
    };

    return sendSuccess(res, responseData, "Home data fetched successfully");
  } catch (error) {
    console.error("Error in getHomeData:", error);
    return sendError(res, "Error fetching home data");
  }
};
