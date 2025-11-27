const nodemailer = require('nodemailer');

// Load from .env (dotenv already in server.js)
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST, // smtp.gmail.com
  port: parseInt(process.env.EMAIL_PORT), // 587
  secure: false, // false for TLS on 587
  auth: {
    user: process.env.EMAIL_USER, // rohit.kishul18@gmail.com
    pass: process.env.EMAIL_PASS  // otjmcsnvjmoaupba (App Password)
  },
  tls: {
    rejectUnauthorized: false // Dev only—true in prod
  }
});

// Verify on startup
transporter.verify((error, success) => {
  if (error) {
    console.error('Email Config Failed:', error.message);
  } else {
    console.log('Email transporter ready! (Using', process.env.EMAIL_USER, ')');
  }
});

module.exports = transporter;