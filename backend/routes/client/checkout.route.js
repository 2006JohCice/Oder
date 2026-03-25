const express = require('express');
const router = express.Router();
const controller = require('../../controllers/client/checkout.controllers')
const middleware = require("../../middlewares/client/auth.middlewares")



router.get('/checkout', middleware.requireAuth,controller.index);
router.post('/checkout/order', middleware.requireAuth,controller.order);
router.get('/checkout/success/:orderId',middleware.requireAuth, controller.success)
router.get('/checkout/doneOrder',middleware.requireAuth, controller.doneOrder)
module.exports = router

