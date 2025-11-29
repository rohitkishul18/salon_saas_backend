const Service = require('../models/service.model');
const { sendSuccess, sendError } = require('../utils/response');

const addService = async (req, res, next) => {
  try {
    const salonId = req.user.salonId;
    let { locationId, locationIds, name, description, price, durationMinutes } = req.body;

    if (!name) {
      return sendError(res, 400, "Service name is required");
    }

    if (!locationIds && locationId) {
      locationIds = [locationId];
    }

    // Validate
    if (!locationIds || !Array.isArray(locationIds) || locationIds.length === 0) {
      return sendError(res, 400, "Please select at least one branch");
    }

    const service = await Service.create({
      salonId,
      locationIds,
      name,
      description: description || "",
      price: price || 0,
      durationMinutes: durationMinutes || 30
    });

    return sendSuccess(res, service, "Service created successfully");
  } catch (err) {
    next(err);
  }
};

const listServices = async (req, res, next) => {
  try {
    const salonId = req.user.salonId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    const services = await Service.find({ salonId })
      .skip(skip)
      .limit(limit)
      .populate("locationIds", "name") 
      .sort({ createdAt: -1 });

    const total = await Service.countDocuments({ salonId });

    return sendSuccess(res, {
      data: services,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    next(err);
  }
};

const updateService = async (req, res, next) => {
  try {
    const { id } = req.params;
    const salonId = req.user.salonId;

    const body = { ...req.body };

    // backward compatibility for update also
    if (body.locationId && !body.locationIds) {
      body.locationIds = [body.locationId];
      delete body.locationId;
    }

    const updated = await Service.findOneAndUpdate(
      { _id: id, salonId },
      body,
      { new: true }
    );

    if (!updated) {
      return sendError(res, 404, "Service not found or unauthorized");
    }

    return sendSuccess(res, updated, "Service updated successfully");
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
      return sendError(res, 404, "Service not found or unauthorized");
    }

    return sendSuccess(res, {}, "Service deleted successfully");
  } catch (err) {
    next(err);
  }
};


module.exports = {
  addService,
  listServices,
  updateService,
  deleteService,
};
