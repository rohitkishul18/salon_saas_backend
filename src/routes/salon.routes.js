const express = require('express')
const router = express.Router()
const salonController = require('../controllers/salon.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.get('/salon',authMiddleware, salonController.getSalon);
router.put('/salon', authMiddleware, salonController.updateSalon);
router.post('/salon/locations',authMiddleware, salonController.addLocation);
router.get('/salon/locations',authMiddleware, salonController.listLocations);

module.exports = router