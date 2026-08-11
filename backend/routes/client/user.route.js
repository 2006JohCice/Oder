const express = require('express');
const router = express.Router();
const controller = require("../../controllers/client/user.controller");
const usermiddlewars = require("../../middlewares/client/user.middlewares");

router.get("/user", controller.getUser);
router.post("/user/register", controller.register);
router.post("/user/login", controller.login);
router.get("/user/logout", controller.logout);
router.post("/user/register/passwordOtp", controller.passwordRegisterOtp);
router.post("/user/password/forgot", controller.forgotPassword);
router.post("/user/password/otp", controller.otpPasswordPost);
router.get("/user/me", usermiddlewars.infoUser, controller.infoUser);
router.patch("/user/profile", usermiddlewars.infoUser, controller.updateProfile);
router.post("/user/feedback", usermiddlewars.infoUser, controller.submitFeedback);
router.post("/user/report", usermiddlewars.infoUser, controller.submitReport);
router.post("/user/like-restaurant/:id", usermiddlewars.infoUser, controller.toggleLikeRestaurant);
router.get("/user/liked-restaurants", usermiddlewars.infoUser, controller.getLikedRestaurants);
router.post("/user/redeem-reward", usermiddlewars.infoUser, controller.redeemReward);
router.get("/user/my-vouchers", usermiddlewars.infoUser, controller.getMyVouchers);
router.post("/user/save-voucher/:id", usermiddlewars.infoUser, controller.saveVoucher);
router.get("/user/chat/:room", controller.getChatHistory);

module.exports = router;
