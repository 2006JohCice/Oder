const express = require("express");
const router = express.Router();
const controller = require("../../controllers/admin/chat.controller");

router.get("/", controller.getRooms);
router.get("/:room", controller.getMessages);

module.exports = router;
