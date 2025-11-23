const express = require('express');
const router = express.Router();

const { 
  createBooking, 
} = require('../controllers/booking.controller');
const customerAuth = require('../middlewares/customerAuth');
router.post('/create', customerAuth, createBooking);

module.exports = router;