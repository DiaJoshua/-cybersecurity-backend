// models/YearDataset.js
const mongoose = require("mongoose");

const YearDatasetSchema = new mongoose.Schema(
  {
    "Nature of Cybercrime Cases": { type: String },
    "4th Quarter of 2023": { type: Number },
    "1st Quarter of 2024": { type: Number },
    "Percentage Increased": { type: Number },
  },
  { strict: false }
);

// Force the collection name to be "YearDataset"
module.exports = mongoose.model("YearDataset", YearDatasetSchema, "YearDataset");
