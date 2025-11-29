// controllers/admin-customers.controller.js (Updated with Pagination)
const Customer = require('../models/customer.model');
const { sendSuccess, sendError } = require('../utils/response');

const getAllCustomers = async (req, res, next) => {
  try {
    // Use salonId from authenticated user (req.user.salonId)
    const { salonId } = req.user;
    console.log('Fetching customers for salonId:', salonId);

    if (!salonId) {
      return sendError(res, 400, 'Salon ID not found. Please log in again.');
    }

    // Pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    // Get total count
    const total = await Customer.countDocuments({ salonId });

    // Fetch paginated customers for this salon, excluding sensitive fields
    const customers = await Customer.find({ salonId })
      .select('fullName email phone createdAt') // Exclude password, tokens, etc.
      .sort({ createdAt: -1 }) // Latest first
      .skip(skip)
      .limit(limit)
      .lean(); // Optimize for JSON response

    const totalPages = Math.ceil(total / limit);

    return sendSuccess(
      res,
      {
        customers,
        pagination: {
          currentPage: page,
          totalPages,
          total,
          limit,
          hasNext: page < totalPages,
          hasPrev: page > 1
        },
        salonId 
      },
      'Customers fetched successfully',
      200
    );
  } catch (err) {
    console.error('Get All Customers Error:', err);
    return sendError(res, 500, 'Failed to fetch customers');
  }
};

module.exports = {
    getAllCustomers
};