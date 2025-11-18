const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const Salon = require('../models/salon.model');
const makeSlug = require('../utils/slugify');
const { sendSuccess, sendError } = require('../utils/response');

const register = async (req, res, next) => {
  try {
    const { salonName, ownerName, email, phone, password } = req.body;
    if (!salonName || !ownerName || !email || !password) {
      return sendError(res, 400, 'Missing fields');
    }

    // create slug
    const slug = makeSlug(salonName);
    let uniqueSlug = slug;
    let i = 1;

    // ensure unique slug
    while (await Salon.findOne({ slug: uniqueSlug })) {
      uniqueSlug = `${slug}-${i++}`;
    }

    // create salon
    const salon = await Salon.create({
      name: salonName,
      slug: uniqueSlug,
      contact: { phone, email }
    });

    // create owner user
    const user = await User.create({
      name: ownerName,
      email,
      phone,
      password,
      isActive: true,
      role: 'salon-owner',
      salonId: salon._id
    });

    // generate token
    const token = jwt.sign(
      { id: user._id, salonId: salon._id, role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    return sendSuccess(
      res,
      {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,            // <<=== ROLE ADDED
          isActive: user.isActive,
          salonId: salon._id
        },
        salon
      },
      'Registered successfully'
    );
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendError(res, 400, "Missing fields");
    }

    // Fetch user
    const user = await User.findOne({ email });
    if (!user) return sendError(res, 401, "Invalid credentials");

    if (user.isActive === false) {
      return sendError(
        res,
        403,
        "Your account has been deactivated by Super Admin. Please contact support."
      );
    }

    // Password check
    const match = await user.comparePassword(password);
    if (!match) return sendError(res, 401, "Invalid credentials");

    // Create JWT token
    const token = jwt.sign(
      { id: user._id, salonId: user.salonId, role: user.role },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "7d" }
    );

    // Successful login response
    return sendSuccess(
      res,
      {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          salonId: user.salonId,
          isActive: user.isActive
        }
      },
      "Logged in"
    );

  } catch (err) {
    next(err);
  }
};


module.exports = { register, login };
