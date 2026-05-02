const express = require("express");
const router = express.Router();
const controller = require("../../controllers/client/restaurant.controller");
const authMiddleware = require("../../middlewares/client/auth.middlewares");

router.get("/restaurants", controller.getRestaurants);
router.post("/restaurants/register", authMiddleware.requireAuth, controller.registerRestaurant);
router.get("/restaurants/:restaurantId/products", controller.getRestaurantProducts);

module.exports = router;