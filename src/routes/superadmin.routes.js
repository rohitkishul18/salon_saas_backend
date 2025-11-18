const router = require("express").Router();
const auth = require("../middlewares/auth.middleware");
const { checkRole } = require("../middlewares/admin.middleware");
const { getDashboardStats, getAllSalons ,updateOwnerStatus } = require("../controllers/superadminDashboard.controller");

router.get("/dashboard", auth, checkRole(['superadmin']), getDashboardStats);
router.get("/salons", auth, checkRole(['superadmin']), getAllSalons);
router.put("/salon-owner/status/:id", auth, checkRole(['superadmin']), updateOwnerStatus);

module.exports = router;
