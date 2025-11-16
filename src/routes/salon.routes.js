const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth.middleware');
const { checkRole } = require('../middlewares/admin.middleware').default;
const salonController = require('../controllers/salon.controller');

// Owner can manage their own salon, superadmin can access all
router.get('/salon', authMiddleware, checkRole(['salon-owner','superadmin']), salonController.getSalon);
router.put('/salon', authMiddleware, checkRole(['salon-owner','superadmin']), salonController.updateSalon);

// Locations under salon
router.post('/salon/locations', authMiddleware, checkRole(['salon-owner','superadmin']), salonController.addLocation);
router.get('/salon/locations', authMiddleware, checkRole(['salon-owner','superadmin']), salonController.listLocations);

module.exports = router;
