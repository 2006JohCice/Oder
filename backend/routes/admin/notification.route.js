const express = require("express");
const router = express.Router();
const controller = require("../../controllers/admin/notification.controller");

router.get("/", controller.getNotifications);
router.patch("/mark-read/:id", controller.markAsRead);
router.patch("/mark-all-read", controller.markAllAsRead);

module.exports = router;
