// middlewares/customerAuth.js (Updated - Validate Against DB Token)
const jwt = require("jsonwebtoken");
const Customer = require("../models/customer.model");
const { sendError } = require("../utils/response");

module.exports = async (req, res, next) => {
  try {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Bearer ')) {
      return sendError(res, "No token provided", 401);
    }

    const token = auth.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch customer and validate token against DB
    const customer = await Customer.findById(decoded.id).select("-password");
    if (!customer) {
      return sendError(res, "Invalid customer token", 401);
    }

    // Check if DB token matches and not expired
    if (customer.authToken !== token || !customer.authTokenExpiry || customer.authTokenExpiry < new Date()) {
      return sendError(res, "Token expired or invalid. Please log in again.", 401);
    }

    req.customer = customer;
    next();
  } catch (err) {
    console.error('Customer Auth Middleware Error:', err.message);
    return sendError(res, "Unauthorized", 401);
  }
};