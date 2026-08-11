const express = require("express");
const router = express.Router();
const controller = require("../../controllers/client/visit.controller");

router.post("/record", controller.recordVisit);
router.get("/stats", controller.getStats);
router.get("/blogs", controller.getPublicBlogs);
router.get("/blogs/:slug", controller.getPublicBlogDetail);

module.exports = router;
