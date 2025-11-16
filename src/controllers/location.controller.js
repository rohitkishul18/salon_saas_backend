const Location = require('../models/location.model');
const { sendSuccess, sendError } = require('../utils/response');

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

module.exports = { updateLocation, deleteLocation };
