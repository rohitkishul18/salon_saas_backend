// utils/response.js
const sendSuccess = (res, data = {}, message = "data fetch successfully", status = 200) => {
  return res.status(status).json({
    success: true,
    message,
    data
  });
};

const sendError = (res, message = "Something went wrong", status = 500) => {
  return res.status(status).json({
    success: false,
    message
  });
};

module.exports = { sendSuccess, sendError };
