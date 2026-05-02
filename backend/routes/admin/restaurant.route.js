const express = require("express");
const router = express.Router();
const controller = require("../../controllers/admin/restaurant.controller");

router.get("/restaurants", controller.getRestaurants);
router.patch("/restaurants/:id/status", controller.updateRestaurantStatus);

module.exports = router;