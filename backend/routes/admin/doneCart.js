
const express = require('express');
const router = express.Router();
const Controller = require('../../controllers/admin/doneCart');

router.get('/checkout/doneOrder', Controller.doneOrder)
router.patch('/authenOrder', Controller.authenOrder)




module.exports = router;