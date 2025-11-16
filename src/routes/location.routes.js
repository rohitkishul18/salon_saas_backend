const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth.middleware');
const { updateLocation, deleteLocation } = require('../controllers/location.controller');
router.use(auth);

router.put('/:id', updateLocation);
router.delete('/:id', deleteLocation);

module.exports = router;
