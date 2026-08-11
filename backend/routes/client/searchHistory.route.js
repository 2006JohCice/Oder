const express = require('express');
const router = express.Router();
const controller = require('../../controllers/client/searchHistory.controller');
const authMiddlewares = require("../../middlewares/client/auth.middlewares");

router.get('/', authMiddlewares.requireAuth, controller.getHistory);
router.post('/', authMiddlewares.requireAuth, controller.addHistory);

module.exports = router;
