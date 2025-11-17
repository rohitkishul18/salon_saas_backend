const Service = require('../models/service.model');
const { sendSuccess, sendError } = require('../utils/response');

const addService = async (req, res, next) => {
  try {
    const salonId = req.user.salonId;
    const { locationId, name, description, price, durationMinutes, imageUrl } = req.body;

    if (!locationId || !name) {
      return sendError(res, 400, 'Missing required fields');
    }

    const service = await Service.create({
      salonId,
      locationId,
      name,
      description: description || '',
      price: price || 0,
      durationMinutes: durationMinutes || 30,
      imageUrl: imageUrl || null
    });

    return sendSuccess(res, service, 'Service created successfully');
  } catch (err) {
    next(err);
  }
};

const listServices = async (req, res, next) => {
  try {
    const salonId = req.user.salonId;

    const services = await Service.find({ salonId }).populate("locationId", "name");

    return sendSuccess(res, services);
  } catch (err) {
    next(err);
  }
};

const updateService = async (req, res, next) => {
  try {
    const { id } = req.params;
    const salonId = req.user.salonId;

    const updated = await Service.findOneAndUpdate(
      { _id: id, salonId },
      req.body,
      { new: true }
    );

    if (!updated) {
      return sendError(res, 404, 'Service not found or unauthorized');
    }

    return sendSuccess(res, updated, 'Service updated successfully');
  } catch (err) {
    next(err);
  }
};

const deleteService = async (req, res, next) => {
  try {
    const { id } = req.params;
    const salonId = req.user.salonId;

    const deleted = await Service.findOneAndDelete({ _id: id, salonId });

    if (!deleted) {
      return sendError(res, 404, 'Service not found or unauthorized');
    }

    return sendSuccess(res, {}, 'Service deleted successfully');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  addService,
  listServices,
  updateService,
  deleteService
};
