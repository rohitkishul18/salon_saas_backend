// middlewares/customerAuth.js
const jwt = require("jsonwebtoken");
const Customer = require("../models/customer.model");
const { sendError } = require("../utils/response");

module.exports = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // 1. No token provided
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return sendError(res, "Authorization token required", 401);
    }

    const token = authHeader.split(" ")[1];

    let decoded;
    try {
      // 2. Verify JWT
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      console.error("❌ JWT verification failed:", err.message);
      return sendError(res, "Invalid or expired token", 401);
    }
    // 3. Fetch customer
    const customer = await Customer.findById(decoded.id).select("-password");
    if (!customer) {
      return sendError(res, "Customer not found", 401);
    }

    // 4. Validate DB token (prevents reuse of old tokens)
    if (!customer.authToken || customer.authToken !== token) {
      return sendError(res, "Session expired. Please login again.", 401);
    }

    // 5. Check expiry stored in DB
    if (!customer.authTokenExpiry || new Date(customer.authTokenExpiry) < new Date()) {
      return sendError(res, "Token expired. Please log in again.", 401);
    }

    // 6. Attach user to request
    req.customer = customer;

    // Keep logs minimal in production
    console.log(`🔐 Customer authenticated: ${customer.fullName} (${customer._id})`);

    next();
  } catch (err) {
    console.error("🔥 Customer Auth Middleware Error:", err);
    return sendError(res, "Unauthorized access", 401);
  }
};
