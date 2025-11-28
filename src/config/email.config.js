const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST, 
  port: parseInt(process.env.EMAIL_PORT),
  secure: false, 
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS 
  },
  tls: {
    rejectUnauthorized: false 
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