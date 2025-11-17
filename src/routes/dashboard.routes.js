const router = require("express").Router();
const auth = require("../middlewares/auth.middleware");
const { getDashboard } = require("../controllers/dashboard.controller");

router.use(auth); // must login

router.get("/", getDashboard);

module.exports = router;
