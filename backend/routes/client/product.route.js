const express = require('express');
const router = express.Router();
const controller = require('../../controllers/client/product.controllers')



router.get('/products/:slugCategory', controller.categoryProducts);
router.get('/products/detail/:slugProduct', controller.detailProducts);

module.exports = router

