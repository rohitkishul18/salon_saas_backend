const express = require("express");
const router = express.Router();
const customerController = require("../controllers/customer.auth.controller");

// Customer Register
router.post("/register", customerController.registerCustomer);

// Customer Login
router.post("/login", customerController.loginCustomer);

module.exports = router;
