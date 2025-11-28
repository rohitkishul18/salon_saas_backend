// middlewares/customerAuth.js
const jwt = require("jsonwebtoken");
const Customer = require("../models/customer.model");
const { sendError } = require("../utils/response");

module.exports = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return sendError(res, "Authorization token required", 401);
    }

    const token = authHeader.split(" ")[1];

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return sendError(res, "Invalid or expired token", 401);
    }
    const customer = await Customer.findById(decoded.id).select("-password");
    if (!customer) {
      return sendError(res, "Customer not found", 401);
    }
    if (!customer.authToken || customer.authToken !== token) {
      return sendError(res, "Session expired. Please login again.", 401);
    }
    if (
      !customer.authTokenExpiry ||
      new Date(customer.authTokenExpiry) < new Date()
    ) {
      return sendError(res, "Token expired. Please log in again.", 401);
    }

    req.customer = customer;
    next();
  } catch (err) {
    console.error("🔥 Customer Auth Middleware Error:", err);
    return sendError(res, "Unauthorized access", 401);
  }
};
