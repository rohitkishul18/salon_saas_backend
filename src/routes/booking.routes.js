const express = require('express');
const router = express.Router();

const auth = require('../middlewares/auth.middleware');
const { checkRole } = require('../middlewares/admin.middleware');

const { 
  createBooking, 
  listBookings, 
  updateBookingStatus 
} = require('../controllers/booking.controller');

router.post('/create', createBooking);

router.use(auth);

router.get('/', checkRole(['salon-owner', 'superadmin']), listBookings);

router.put('/:id/status', checkRole(['salon-owner', 'superadmin']), updateBookingStatus);

module.exports = router;
