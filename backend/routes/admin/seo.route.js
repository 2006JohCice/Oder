const express = require("express");
const router = express.Router();
const controller = require("../../controllers/admin/seo.controller");
const middleware = require("../../middlewares/admin/auth.middlewares");

router.get("/", middleware.requireAuth, controller.index);
router.post("/create", middleware.requireAuth, controller.create);
router.get("/:id", middleware.requireAuth, controller.detail);
router.patch("/edit/:id", middleware.requireAuth, controller.edit);
router.delete("/delete/:id", middleware.requireAuth, controller.delete);

module.exports = router;
