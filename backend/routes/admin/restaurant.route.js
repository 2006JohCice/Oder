const express = require("express");
const router = express.Router();
const controller = require("../../controllers/admin/restaurant.controller");

router.get("/", controller.getRestaurants);
router.patch("/:id/status", controller.updateRestaurantStatus);
router.delete("/:id", controller.deleteRestaurant);

module.exports = router;