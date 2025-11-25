const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth.middleware');
const { checkRole } = require('../middlewares/admin.middleware');
const {
  addService,
  listServices,
  updateService,
  deleteService, 
} = require('../controllers/service.controller');

router.use(auth);

// salon-owner ONLY — create, update, delete
router.post('/', checkRole(['salon-owner']), addService);
router.put('/:id', checkRole(['salon-owner']), updateService);
router.delete('/:id', checkRole(['salon-owner']), deleteService);



// salon-owner + superadmin — list their services
router.get('/', checkRole(['salon-owner', 'superadmin']), listServices);

module.exports = router;
