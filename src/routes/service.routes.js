const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth.middleware');
const { checkRole } = require('../middlewares/admin.middleware').default;
const { addService, listServices, updateService, deleteService } = require('../controllers/service.controller');

router.use(auth);

// Only salon_owner can create/update/delete services
router.post('/', checkRole(['salon-owner']), addService);
router.put('/:id', checkRole(['salon-owner']), updateService);
router.delete('/:id', checkRole(['salon-owner']), deleteService);

// Both owner & superadmin can list services
router.get('/', checkRole(['salon-owner','superadmin']), listServices);

module.exports = router;
