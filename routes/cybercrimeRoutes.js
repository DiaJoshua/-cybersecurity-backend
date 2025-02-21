const express = require("express");
const router = express.Router();
const cybercrimeController = require("../controllers/CybercrimeDistrictsController");

if (!cybercrimeController.getAllCases || !cybercrimeController.getCasesByDistrict) {
  console.error("❌ Controller functions are not defined correctly.");
}

router.get("/cases", cybercrimeController.getAllCases);
router.get("/cases/:district", cybercrimeController.getCasesByDistrict);

module.exports = router;
