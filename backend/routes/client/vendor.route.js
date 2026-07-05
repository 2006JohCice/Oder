const express = require("express");
const router = express.Router();
const vendorController = require("../../controllers/client/vendor.controllers");

// Route cho client đăng ký nhà hàng
router.post("/register", vendorController.registerRestaurant);

module.exports = router;
