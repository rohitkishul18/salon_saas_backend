const jwt = require('jsonwebtoken');
const { sendError } = require('../utils/response');
const User = require('../models/user.model');

module.exports = async (req, res, next) => {
  try {
    const auth = req.headers.authorization;
    if (!auth) return sendError(res, 401, 'No token provided');

    const token = auth.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');

    const user = await User.findById(decoded.id);

    if (!user) return sendError(res, 401, 'Invalid token');

    if (user.role === 'salon-owner' && user.isActive === false) {
      return sendError(res, 403, 'Account deactivated by admin');
    }

    req.user = user;
    next();

  } catch (err) {
    return sendError(res, 401, 'Unauthorized');
  }
};
