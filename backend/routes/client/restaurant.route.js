const express = require("express");
const router = express.Router();
const controller = require("../../controllers/client/restaurant.controller");
const authMiddleware = require("../../middlewares/client/auth.middlewares");

router.get("/restaurants", controller.getRestaurants);
router.get("/restaurants/recommend", controller.getRecommendedRestaurants);
router.post("/restaurants/register", authMiddleware.requireAuth, controller.registerRestaurant);
router.get("/restaurants/:restaurantId/products", controller.getRestaurantProducts);
router.get("/restaurants/:restaurantId/vouchers", controller.getRestaurantVouchers);

router.get("/restaurant/my", authMiddleware.requireAuth, controller.getMyRestaurant);
router.patch("/restaurant/my", authMiddleware.requireAuth, controller.updateMyRestaurant);
router.get("/restaurant/dashboard", authMiddleware.requireAuth, controller.getMyDashboard);

router.get("/restaurant/products", authMiddleware.requireAuth, controller.getMyProducts);
router.post("/restaurant/products", authMiddleware.requireAuth, controller.createProduct);
router.put("/restaurant/products/:productId", authMiddleware.requireAuth, controller.updateProduct);
router.delete("/restaurant/products/:productId", authMiddleware.requireAuth, controller.deleteProduct);

router.get("/restaurant/vouchers", authMiddleware.requireAuth, controller.getMyVouchers);
router.post("/restaurant/vouchers", authMiddleware.requireAuth, controller.createVoucher);
router.patch("/restaurant/vouchers/:voucherId/status", authMiddleware.requireAuth, controller.updateVoucherStatus);
router.delete("/restaurant/vouchers/:voucherId", authMiddleware.requireAuth, controller.deleteVoucher);

router.get("/restaurant/orders", authMiddleware.requireAuth, controller.getMyOrders);
router.get("/restaurant/order-list", authMiddleware.requireAuth, controller.getOrderList);
router.patch("/restaurant/orders/:orderId/status", authMiddleware.requireAuth, controller.updateMyOrderStatus);

router.get("/restaurant/tables", authMiddleware.requireAuth, controller.getMyTables);
router.post("/restaurant/tables", authMiddleware.requireAuth, controller.createTable);
router.put("/restaurant/tables/sync", authMiddleware.requireAuth, controller.syncTables);
router.put("/restaurant/tables/:tableId", authMiddleware.requireAuth, controller.updateTable);
router.delete("/restaurant/tables/:tableId", authMiddleware.requireAuth, controller.deleteTable);

router.get("/restaurant/feedbacks", authMiddleware.requireAuth, controller.getMyFeedbacks);
router.get("/restaurant/reports", authMiddleware.requireAuth, controller.getMyReports);

module.exports = router;
