const express = require('express');
const router = express.Router();
const controller = require("../../controllers/client/user.controller");
const usermiddlewars = require("../../middlewares/client/user.middlewares");
router.post("/user/register", controller.register);
// router.get("/user/logout", controller.logout);
router.post("/user/login", controller.login);
router.get("/user/logout",controller.logout)
router.get("/user/me", usermiddlewars.infoUser,  controller.infoUser);
module.exports = router;

