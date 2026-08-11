const express = require("express");
const router = express.Router();
const controller = require("../../controllers/client/policy.controller");

router.get("/", controller.getAllActivePolicies);

module.exports = router;
