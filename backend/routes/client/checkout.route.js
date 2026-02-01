const express = require('express');
const router = express.Router();
const controller = require('../../controllers/client/checkout.controllers')



router.get('/checkout', controller.index);

module.exports = router

