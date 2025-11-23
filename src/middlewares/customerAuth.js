// middlewares/customerAuth.js

const jwt = require("jsonwebtoken");
const Customer = require("../models/customer.model");
const { sendError } = require("../utils/response");

module.exports = async (req, res, next) => {
  try {
    const auth = req.headers.authorization;
    if (!auth) return sendError(res, "No token provided", 401);

    const token = auth.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const customer = await Customer.findById(decoded.id).select("-password");

    if (!customer) return sendError(res, "Invalid customer token", 401);

    req.customer = customer;
    next();
  } catch (err) {
    return sendError(res, "Unauthorized", 401);
  }
};
