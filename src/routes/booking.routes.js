const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth.middleware');
const { createBooking, listBookings, updateBookingStatus } = require('../controllers/booking.controller');

// Public create booking
router.post('/create', createBooking);

// Admin routes
router.use(auth);
router.get('/', listBookings);
router.put('/:id/status', updateBookingStatus);

module.exports = router;
