const express = require("express");
const router = express.Router();
const cybercrimeController = require("../controllers/CybercrimeDistrictsController");
console.log(cybercrimeController);



if (!cybercrimeController.getAllCases || !cybercrimeController.getCasesByDistrict) {
  console.error("❌ Controller functions are not defined correctly. Check CybercrimeDistrictsController.js.");
}

router.get("/cases", cybercrimeController.getAllCases);
router.get("/cases/:district", cybercrimeController.getCasesByDistrict);

module.exports = router;
