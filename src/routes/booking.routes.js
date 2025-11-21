const express = require('express');
const router = express.Router();

const auth = require('../middlewares/auth.middleware');
const { checkRole } = require('../middlewares/admin.middleware');

const { 
  createBooking, 
  listBookings, 
  updateBookingStatus ,
  deleteBooking
} = require('../controllers/booking.controller');

router.post('/create', createBooking);

router.use(auth);

router.get('/', checkRole(['salon-owner', 'superadmin']), listBookings);


router.delete('/:id', checkRole(['salon-owner']), deleteBooking);

router.put('/:id/status', checkRole(['salon-owner']), updateBookingStatus);

module.exports = router;
