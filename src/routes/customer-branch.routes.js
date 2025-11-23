const express = require("express");
const router = express.Router();
const branchController = require("../controllers/branch.controller");
const customerAuth = require("../middlewares/customerAuth");

router.get("/:branchSlug", customerAuth, branchController.getBranchWithServices);

module.exports = router;
