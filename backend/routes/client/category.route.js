const express = require('express');
const router = express.Router();
const controller = require('../../controllers/client/products.category')



router.get('/category', controller.index);

module.exports = router

