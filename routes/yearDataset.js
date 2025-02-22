// routes/yearDataset.js
const express = require("express");
const router = express.Router();
const yearDatasetController = require("../controllers/YearDatasetController");

router.get("/", yearDatasetController.getYearDataset);

module.exports = router;
