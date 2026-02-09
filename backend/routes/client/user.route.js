const express = require('express');
const router = express.Router();
const controller = require("../../controllers/client/user.controller");

router.post("/user/register", controller.register);
// router.get("/user/logout", controller.logout);
router.post("/user/login", controller.login);

module.exports = router;

