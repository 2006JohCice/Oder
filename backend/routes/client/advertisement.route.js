const express = require('express');
const router = express.Router();
const Controller = require('../../controllers/admin/advertisement.controller');

router.get('/advertisements', Controller.getAdvertisements);


module.exports = router;