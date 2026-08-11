const express = require("express");
const router = express.Router();
const controller = require("../../controllers/admin/policy.controller");

router.get("/", controller.getPolicies);
router.post("/", controller.createPolicy);
router.put("/:id", controller.updatePolicy);
router.delete("/:id", controller.deletePolicy);

module.exports = router;
