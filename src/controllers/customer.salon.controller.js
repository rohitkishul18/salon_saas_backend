const Salon = require("../models/salon.model");
const { sendSuccess, sendError } = require("../utils/response");

const getSalonWithBranchesAndServices = async (req, res, next) => {
  try {
    const { salonSlug } = req.params;

    if (!salonSlug) {
      return sendError(res, "Salon slug is required", 400);
    }

    // Fetch salon details only
    const salon = await Salon
      .findOne({ slug: salonSlug })
      .select("name description contact settings");

    if (!salon) {
      return sendError(res, "Salon not found", 404);
    }

    return sendSuccess(res, salon, "Salon fetched successfully");

  } catch (err) {
    next(err);
  }
};

module.exports = {
  getSalonWithBranchesAndServices
};
