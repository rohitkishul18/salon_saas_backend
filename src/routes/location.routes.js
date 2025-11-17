const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth.middleware');
const { checkRole } = require('../middlewares/admin.middleware');
const {
  getLocations,
  createLocation,
  updateLocation,
  deleteLocation
} = require('../controllers/location.controller');

router.use(auth);

// GET all
router.get('/', checkRole(['salon-owner', 'superadmin']), getLocations);

// CREATE
router.post('/', checkRole(['salon-owner', 'superadmin']), createLocation);

// UPDATE
router.put('/:id', checkRole(['salon-owner', 'superadmin']), updateLocation);

// DELETE
router.delete('/:id', checkRole(['salon-owner', 'superadmin']), deleteLocation);

module.exports = router;
