const express = require("express");
const router = express.Router();
const customerController = require("../controllers/customer.auth.controller");

// Customer Register
router.post("/register", customerController.registerCustomer);

// Customer Login
router.post("/login", customerController.loginCustomer);

router.post('/forgot-password', customerController.forgotPasswordCustomer);

// Reset Password
router.post('/reset-password', customerController.resetPasswordCustomer);




module.exports = router;
