const express = require("express");
const router = express.Router();
const branchController = require("../controllers/branch.controller");

router.get("/:branchSlug", branchController.getBranchWithServices);

module.exports = router;
