const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth.middleware');
const { checkRole } = require('../middlewares/admin.middleware').default;
const { updateLocation, deleteLocation } = require('../controllers/location.controller');

router.use(auth);

// Only salon_owner or superadmin can update/delete location
router.put('/:id', checkRole(['salon-owner', 'superadmin']), updateLocation);
router.delete('/:id', checkRole(['salon-owner', 'superadmin']), deleteLocation);

module.exports = router;
