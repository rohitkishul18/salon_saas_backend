const Service = require("../models/service.model");
const Salon = require("../models/salon.model");
const Location = require("../models/location.model");
const { sendSuccess, sendError } = require("../utils/response");

const getBranchWithServices = async (req, res) => {
  try {
    const { branchSlug } = req.params;

    // 1️⃣ Find branch (Location)
    const branch = await Location.findOne({ slug: branchSlug });
    if (!branch) return sendError(res, "Branch not found", 404);

    // 2️⃣ Find salon
    const salon = await Salon.findById(branch.salonId);

    // 3️⃣ Find services for this specific location/branch
    const services = await Service.find({ locationId: branch._id });

    return sendSuccess(res, {
      branch,
      salon,
      services
    });

  } catch (err) {
    return sendError(res, err.message, 500);
  }
};


module.exports = {
  getBranchWithServices,
};
