const Customer = require("../models/customer.model");
const Salon = require("../models/salon.model");
const { sendSuccess, sendError } = require("../utils/response");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


const registerCustomer = async (req, res) => {
  try {
    const { fullName, email, phone, password } = req.body;
    const salonSlug = req.query.salonSlug; // coming from frontend

    if (!salonSlug) return sendError(res, "Salon slug is required");

    const salon = await Salon.findOne({ slug: salonSlug });
    if (!salon) return sendError(res, "Salon not found");

    const existed = await Customer.findOne({ email });
    if (existed) return sendError(res, "Email already registered");

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
    return sendError(res, err.message);
  }
};

const loginCustomer = async (req, res) => {
  try {
    const { email, password } = req.body;

    const customer = await Customer.findOne({ email });
    if (!customer) return sendError(res, "Invalid email or password");

    const isMatch = await bcrypt.compare(password, customer.password);
    if (!isMatch) return sendError(res, "Invalid email or password");

    const token = jwt.sign(
      { id: customer._id, salonId: customer.salonId },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return sendSuccess(res, { customer, token }, "Login successful");

  } catch (err) {
    return sendError(res, err.message);
  }
};

module.exports = {
  registerCustomer,
  loginCustomer
};
