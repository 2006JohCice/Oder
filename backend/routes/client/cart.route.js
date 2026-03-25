const express = require("express");
const router = express.Router();
const cartMiddleware = require("../../middlewares/client/cart.middlewares");
const Controller = require('../../controllers/client/cart.controllers')
const middleware = require("../../middlewares/client/auth.middlewares")

router.get("/cart",
middleware.requireAuth,Controller.index)
router.delete("/cart/delete/:productId",
middleware.requireAuth,Controller.delete)
router.get("/init-cart",
middleware.requireAuth, cartMiddleware.CartId);
router.post("/cart/add",
middleware.requireAuth,Controller.addPost)
module.exports = router;
