const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth.middleware');
const { addService, listServices, updateService, deleteService } = require('../controllers/service.controller');
router.use(auth);

router.post('/', addService);
router.get('/', listServices);
router.put('/:id', updateService);
router.delete('/:id', deleteService);

module.exports = router;
