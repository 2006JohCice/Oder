const express = require("express");
const router = express.Router();
const controller = require("../../controllers/client/restaurant.controller");
const authMiddleware = require("../../middlewares/client/auth.middlewares");

router.get("/restaurants", controller.getRestaurants);
router.post("/restaurants/register", authMiddleware.requireAuth, controller.registerRestaurant);
router.get("/restaurants/:restaurantId/products", controller.getRestaurantProducts);

router.get("/restaurant/my", authMiddleware.requireAuth, controller.getMyRestaurant);
router.patch("/restaurant/my", authMiddleware.requireAuth, controller.updateMyRestaurant);

router.get("/restaurant/products", authMiddleware.requireAuth, controller.getMyProducts);
router.post("/restaurant/products", authMiddleware.requireAuth, controller.createProduct);
router.put("/restaurant/products/:productId", authMiddleware.requireAuth, controller.updateProduct);
router.delete("/restaurant/products/:productId", authMiddleware.requireAuth, controller.deleteProduct);

router.get("/restaurant/tables", authMiddleware.requireAuth, controller.getMyTables);
router.post("/restaurant/tables", authMiddleware.requireAuth, controller.createTable);
router.put("/restaurant/tables/:tableId", authMiddleware.requireAuth, controller.updateTable);
router.delete("/restaurant/tables/:tableId", authMiddleware.requireAuth, controller.deleteTable);

module.exports = router;
