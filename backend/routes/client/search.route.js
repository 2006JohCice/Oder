const express = require('express');
const router = express.Router();
const Controller = require('../../controllers/client/search.controller');

router.get('/search', Controller.index);


module.exports = router;