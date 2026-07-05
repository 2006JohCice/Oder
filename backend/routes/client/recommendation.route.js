const express = require("express");
const router = express.Router();
const recommendationController = require("../../controllers/client/recommendation.controllers");

router.get("/restaurants", recommendationController.getRecommendedRestaurants);
router.get("/products", recommendationController.getTrendingProducts);

module.exports = router;
