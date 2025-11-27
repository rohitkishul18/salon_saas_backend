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

    // 3️⃣ Find services for this specific location/branch (updated for multi-location support)
    const services = await Service.find({ salonId: salon._id, locationIds: branch._id })
      .populate('locationIds', 'name');  // Optional: populate if needed for other fields

    return sendSuccess(res, {
      branch:{
         _id: branch._id,
         salonId: branch.salonId,
         name: branch.name,
          slug: branch.slug,
          address: branch.address,
          phone: branch.phone,
          openingHours: branch.openingHours,
      },
      salon:{
          _id: salon._id,
          name: salon.name,
          slug: salon.slug,
          contact :{
             email: salon.contact.email,
              phone: salon.contact.phone
          },
          settings: {
            currency: salon.settings.currency,
            timezone: salon.settings.timezone
          }
      },
      services : services.map(s => ({
          _id: s._id,
          name: s.name,
          salonId: s.salonId,
          description: s.description,
          duration: s.duration,
          price: s.price,
          locationIds: s.locationIds,
      }))
    });

  } catch (err) {
    return sendError(res, err.message, 500);
  }
};


module.exports = {
  getBranchWithServices,
};
