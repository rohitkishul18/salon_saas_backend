const Service = require('../models/service.model');
const { sendSuccess, sendError } = require('../utils/response');

const addService = async (req, res, next) => {
  try {
    const salonId = req.user.salonId;
    const { locationId, name, description, price, durationMinutes } = req.body;
    if (!locationId || !name) return sendError(res, 400, 'Missing fields');
    const service = await Service.create({ salonId, locationId, name, description, price, durationMinutes, imageUrl: req.body.imageUrl || null });
    sendSuccess(res, service, 'Service added');
  } catch (err) { next(err); }
};

const listServices = async (req, res, next) => {
  try {
    const salonId = req.user.salonId;
    const services = await Service.find({ salonId });
    sendSuccess(res, services);
  } catch (err) { next(err); }
};

const updateService = async (req, res, next) => {
  try {
    const { id } = req.params;
    const salonId = req.user.salonId;
    const updated = await Service.findOneAndUpdate({ _id: id, salonId }, req.body, { new: true });
    if (!updated) return sendError(res, 404, 'Service not found');
    sendSuccess(res, updated);
  } catch (err) { next(err); }
};

const deleteService = async (req, res, next) => {
  try {
    const { id } = req.params;
    const salonId = req.user.salonId;
    await Service.findOneAndDelete({ _id: id, salonId });
    sendSuccess(res, {}, 'Deleted');
  } catch (err) { next(err); }
};

module.exports = { addService, listServices, updateService, deleteService };
