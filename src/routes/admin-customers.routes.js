// routes/admin-customers.routes.js (New file - Admin routes for managing customers)
const express = require('express');
const router = express.Router();
// const auth  = require('../middlewares/auth.middleware');
// const { checkRole } = require('../middlewares/admin.middleware');
const { checkRole } = require('../middlewares/admin.middleware');
const auth = require('../middlewares/auth.middleware');
const customerController = require('../controllers/admin-customers.controller');

router.use(auth);


router.get('/users', checkRole(['salon-owner']), customerController.getAllCustomers);

module.exports = router;

