const Location = require('../models/location.model');
const { sendSuccess, sendError } = require('../utils/response');
const makeSlug = require('../utils/slugify');


const getLocations = async (req, res, next) => {
  try {
    const salonId = req.user.salonId;

    const locations = await Location.find({ salonId }).sort({ createdAt: -1 });

    sendSuccess(res, locations);
  } catch (err) { next(err); }
};



const createLocation = async (req, res, next) => {
  try {
    const salonId = req.user.salonId;
    const { name, address, phone, openingHours } = req.body;

    if (!name) return sendError(res, 400, "Name required");

    const slug = makeSlug(name);

    const newLocation = await Location.create({
      salonId,
      name,
      slug,
      address,
      phone,
      openingHours
    });

    sendSuccess(res, newLocation);
  } catch (err) { next(err); }
};

const updateLocation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const salonId = req.user.salonId;
    const updated = await Location.findOneAndUpdate({ _id: id, salonId }, req.body, { new: true });
    if (!updated) return sendError(res, 404, 'Location not found');
    sendSuccess(res, updated);
  } catch (err) { next(err); }
};

const deleteLocation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const salonId = req.user.salonId;
    await Location.findOneAndDelete({ _id: id, salonId });
    sendSuccess(res, {}, 'Deleted');
  } catch (err) { next(err); }
};

module.exports = { updateLocation, deleteLocation ,getLocations ,createLocation };
