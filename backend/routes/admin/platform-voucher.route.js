const express = require('express');
const router = express.Router();
const controller = require('../../controllers/admin/platform-voucher.controller');

router.get('/platform-vouchers', controller.getVouchers);
router.post('/platform-vouchers', controller.createVoucher);
router.patch('/platform-vouchers/:id', controller.updateVoucher);
router.delete('/platform-vouchers/:id', controller.deleteVoucher);

module.exports = router;
