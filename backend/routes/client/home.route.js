const express = require('express');
const router = express.Router();
const controller = require('../../controllers/client/product.controllers')



router.get('/products', controller.index);
router.get('/products/featured',controller.featuredProducts)
module.exports = router

