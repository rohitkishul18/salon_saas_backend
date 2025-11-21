const express = require("express");
const router = express.Router();
const homeController = require("../controllers/home.controller");

router.get("/home/:salonSlug", homeController.getHomeData);

module.exports = router;
