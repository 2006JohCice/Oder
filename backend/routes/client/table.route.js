const express = require("express");
const router = express.Router();

const controller = require("../../controllers/client/table.controllers");
const middleware = require("../../middlewares/client/auth.middlewares");

router.get("/tables/available", middleware.requireAuth, controller.available);

module.exports = router;
