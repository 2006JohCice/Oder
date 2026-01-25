const express = require("express");
const router = express.Router();
const cartMiddleware = require("../../middlewares/client/cart.middlewares");
const Controller = require('../../controllers/client/cart.controllers')

router.get("/init-cart", cartMiddleware.CartId);
router.post("/cart/add",Controller.addPost)

module.exports = router;
