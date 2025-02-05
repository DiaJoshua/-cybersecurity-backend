const mongoose = require("mongoose");

const CybercrimeSchema = new mongoose.Schema({
  "Nature of Cybercrime Cases": String, // Added this field
  "4th Quarter of 2023": Number,       // Added this field
  "1st Quarter of 2024": Number,       // Added this field
  "Percentage Increased": Number,      // Added this field
  "NATURE OF CASES": String,
  "Brgy": mongoose.Schema.Types.Mixed, // Changed to Mixed to handle nested objects
  "TOTAL CASES PER CYBERCRIME": Number
}, { collection: "cybercrime_stats" });

module.exports = mongoose.model("Cybercrime", CybercrimeSchema);
