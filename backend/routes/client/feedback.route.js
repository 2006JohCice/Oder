const express = require("express");
const router = express.Router();
const feedbackController = require("../../controllers/client/feedback.controllers");

// API lấy đánh giá của nhà hàng
router.get("/restaurant/:id", feedbackController.getFeedbacks);

// API gửi đánh giá cho nhà hàng
router.post("/restaurant/:id", feedbackController.submitFeedback);

module.exports = router;
