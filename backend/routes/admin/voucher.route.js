const express = require('express');
const router = express.Router();
const controller = require('../../controllers/admin/voucher.controller');

router.get('/vouchers', controller.getVouchers);
router.post('/vouchers', controller.createVoucher);
router.patch('/vouchers/:id', controller.updateVoucher);
router.delete('/vouchers/:id', controller.deleteVoucher);

module.exports = router;
