// middlewares/error.middleware.js

module.exports = (err, req, res, next) => {
  console.error("❌ Error:", err);
  const status = err.statusCode || err.status || 500;

  res.status(status).json({
    success: false,
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack
  });
};
