const express = require("express");
const router = express.Router();

const controller = require("../../controllers/client/ai.controller");

router.post("/chat", controller.chatWithAI);

module.exports = router;
