
const express = require('express');
const router = express.Router();
const Controller = require('../../controllers/admin/doneCart');

router.get('/checkout/doneOrder', Controller.doneOrder)




module.exports = router;