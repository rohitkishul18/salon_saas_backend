const express = require("express");
const router = express.Router();
const salonController = require("../controllers/customer.salon.controller");

router.get("/:salonSlug", salonController.getSalonWithBranchesAndServices);

module.exports = router;
