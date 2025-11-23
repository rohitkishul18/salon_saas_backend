const Customer = require("../models/customer.model");
const Salon = require("../models/salon.model");
const { sendSuccess, sendError } = require("../utils/response");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const registerCustomer = async (req, res, next) => {
  try {
    const { fullName, email, phone, password } = req.body;
    const salonSlug = req.query.salonSlug;

    if (!salonSlug) return sendError(res, "Salon slug is required", 400);
    if (!fullName || !email || !phone || !password)
      return sendError(res, "All fields are required", 400);

    // Password validation
    if (password.length < 6) {
      return sendError(res, "Password must be at least 6 characters long", 400);
    }
    if (!/[A-Z]/.test(password)) {
      return sendError(res, "Password must contain at least one uppercase letter", 400);
    }

    const salon = await Salon.findOne({ slug: salonSlug });
    if (!salon) return sendError(res, "Salon not found", 404);

    const existed = await Customer.findOne({ email });
    if (existed) return sendError(res, "Email already registered", 409);

    const hashedPassword = await bcrypt.hash(password, 10);

    const customer = new Customer({
      fullName,
      email,
      phone,
      password: hashedPassword,
      salonId: salon._id,
    });

    await customer.save();

    const token = jwt.sign(
      { id: customer._id, salonId: customer.salonId },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return sendSuccess(res, { customer, token }, "Registration successful");

  } catch (err) {
    next(err);
  }
};

const loginCustomer = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return sendError(res, "Email and password are required", 400);

    const customer = await Customer.findOne({ email });
    if (!customer) {
      // Generic error for security (do not reveal if user exists)
      return sendError(res, "Invalid email or password", 401);
    }

    const isMatch = await bcrypt.compare(password, customer.password);
    if (!isMatch) {
      // Generic error for security
      return sendError(res, "Invalid email or password", 401);
    }

    const token = jwt.sign(
      { id: customer._id, salonId: customer.salonId },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return sendSuccess(res, { customer, token }, "Login successful");

  } catch (err) {
    next(err);
  }
};

module.exports = {
  registerCustomer,
  loginCustomer
};