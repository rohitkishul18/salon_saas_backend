const Salon = require('../models/salon.model');
const Location = require('../models/location.model');
const makeSlug = require('../utils/slugify');
const { sendSuccess, sendError } = require('../utils/response');

const getSalon = async (req, res, next) => {
  try {
    const salonId = req.user.salonId;
    const salon = await Salon.findById(salonId);
    if (!salon) return sendError(res, 404, 'Salon not found');
    sendSuccess(res, salon);
  } catch (err) { next(err); }
};

const updateSalon = async (req, res, next) => {
  try {
    const salonId = req.user.salonId;
    const payload = req.body;
    const updated = await Salon.findByIdAndUpdate(salonId, payload, { new: true });
    sendSuccess(res, updated, 'Updated');
  } catch (err) { next(err); }
};

// add location
const addLocation = async (req, res, next) => {
  try {
    const salonId = req.user.salonId;
    const { name, address, phone, openingHours } = req.body;
    if (!name) return sendError(res, 400, 'Location name required');

    const base = makeSlug(name);
    let slug = base;
    let i = 1;
    while (await Location.findOne({ salonId, slug })) slug = `${base}-${i++}`;

    const location = await Location.create({ salonId, name, slug, address, phone, openingHours });
    sendSuccess(res, location, 'Location added');
  } catch (err) { next(err); }
};

const listLocations = async (req, res, next) => {
  try {
    const salonId = req.user.salonId;
    const locations = await Location.find({ salonId });
    sendSuccess(res, locations);
  } catch (err) { next(err); }
};

module.exports = { getSalon, updateSalon, addLocation, listLocations };
