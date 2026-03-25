const express = require('express');
const router = express.Router();
const controller = require('../../controllers/client/foodSuggestion.controllers')



// router.get('/products', controller.index);
router.post("/recommend", controller.recommend);

module.exports = router

