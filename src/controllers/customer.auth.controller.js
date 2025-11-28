// controllers/customer.auth.controller.js
const Customer = require("../models/customer.model");
const Salon = require("../models/salon.model");
const jwt = require("jsonwebtoken");
const { sendSuccess, sendError } = require("../utils/response");
const { sendResetEmail } = require("../utils/forgot-password.util");
const generateAuthToken = (customerId) => {
  return jwt.sign(
    { id: customerId, model: "customer" },
    process.env.JWT_SECRET,
    { expiresIn: "30d" }
  );
};
const generateResetToken = (customerId) => {
  return jwt.sign(
    { id: customerId, model: "customer" },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );
};

const registerCustomer = async (req, res, next) => {
  try {
    const { fullName, email, phone, password } = req.body;
    const salonSlug = req.query.salonSlug;

    // ---------- VALIDATION ----------
    if (!salonSlug) return sendError(res, 400, "Salon slug is required");
    if (!fullName || !email || !phone || !password)
      return sendError(res, 400, "All fields are required");

    if (password.length < 6)
      return sendError(res, 400, "Password must be at least 6 characters");

    if (!/[A-Z]/.test(password))
      return sendError(
        res,
        400,
        "Password must contain at least one uppercase letter"
      );

    const salon = await Salon.findOne({ slug: salonSlug });
    if (!salon) return sendError(res, 404, "Salon not found");

    const existed = await Customer.findOne({ email });
    if (existed) return sendError(res, 409, "Email already registered");
    const customer = new Customer({
      fullName,
      email,
      phone,
      password,
      salonId: salon._id,
    });

    const token = generateAuthToken(customer._id);
    customer.authToken = token;
    customer.authTokenExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    await customer.save();

    // Get public customer data
    const publicCustomer = await Customer.findById(customer._id)
      .select("fullName email phone salonId createdAt")
      .lean();

    return sendSuccess(
      res,
      {
        customer: publicCustomer,
        token,
      },
      "Registration successful",
      201
    );
  } catch (err) {
    console.error("Customer Registration Error:", err);
    next(err);
  }
};

const loginCustomer = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return sendError(res, 400, "Email and password are required");

    const customer = await Customer.findOne({ email });
    if (!customer)
      return sendError(res, 401, "Credentials are invalid or not registered");

    const isMatch = await customer.comparePassword(password);
    if (!isMatch)
      return sendError(
        res,
        401,
        "Invalid email or password. Please enter correct credentials"
      );
    let token;
    if (
      customer.authToken &&
      customer.authTokenExpiry &&
      customer.authTokenExpiry > new Date()
    ) {
      token = customer.authToken;
    } else {
      token = generateAuthToken(customer._id);
      customer.authToken = token;
      customer.authTokenExpiry = new Date(
        Date.now() + 30 * 24 * 60 * 60 * 1000
      );
      await customer.save();
    }
    const publicCustomer = await Customer.findById(customer._id)
      .select("fullName email phone salonId createdAt")
      .lean();

    return sendSuccess(
      res,
      {
        customer: publicCustomer,
        token,
      },
      "Login successful",
      200
    );
  } catch (err) {
    console.error("Customer Login Error:", err);
    next(err);
  }
};

const forgotPasswordCustomer = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return sendError(res, 400, "Email is required");

    const customer = await Customer.findOne({ email }).populate(
      "salonId",
      "name"
    );
    if (!customer) {
      return sendSuccess(
        res,
        null,
        "If this email is registered, you will receive a password reset link shortly."
      );
    }

    const resetToken = generateResetToken(customer._id);
    customer.resetToken = resetToken;
    customer.resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000);
    await customer.save();

    const salonName = customer.salonId?.name || "Your Salon";
    const result = await sendResetEmail(
      customer,
      "customer",
      "http://localhost:56057/auth/reset-password",
      salonName
    );

    sendSuccess(res, result);
  } catch (err) {
    console.error("Customer Forgot Password Error:", err);
    next(err);
  }
};

const resetPasswordCustomer = async (req, res, next) => {
  try {
    const { token, email, newPassword } = req.body;

    if (!token || !email || !newPassword) {
      return sendError(res, 400, "Token, email, and new password required");
    }

    if (newPassword.length < 6) {
      return sendError(res, 400, "New password must be at least 6 characters");
    }

    if (!/[A-Z]/.test(newPassword)) {
      return sendError(
        res,
        400,
        "New password must contain at least one uppercase letter"
      );
    }

    const customer = await Customer.findOne({ email });
    if (!customer) return sendError(res, 404, "Customer not found");

    if (customer.resetToken !== token) {
      return sendError(res, 400, "Invalid token");
    }

    if (!customer.resetTokenExpiry || customer.resetTokenExpiry < new Date()) {
      return sendError(res, 400, "Token expired. Request a new reset link.");
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (decoded.model !== "customer") {
        return sendError(res, 400, "Invalid token type");
      }
    } catch (jwtErr) {
      console.error("JWT Verify Error:", jwtErr.message);
      return sendError(res, 400, "Invalid token signature");
    }

    customer.password = newPassword;
    customer.resetToken = undefined;
    customer.resetTokenExpiry = undefined;
    const newAuthToken = generateAuthToken(customer._id);
    customer.authToken = newAuthToken;
    customer.authTokenExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    await customer.save();
    const publicCustomer = await Customer.findById(customer._id)
      .select("fullName email phone salonId createdAt")
      .lean();

    sendSuccess(
      res,
      {
        customer: publicCustomer,
        token: newAuthToken,
      },
      "Password reset successful! You can now log in.",
      200
    );
  } catch (err) {
    console.error("Customer Reset Password Error:", err);
    next(err);
  }
};

module.exports = {
  registerCustomer,
  loginCustomer,
  forgotPasswordCustomer,
  resetPasswordCustomer,
};
