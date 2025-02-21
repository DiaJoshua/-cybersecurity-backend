const mongoose = require("mongoose");

const CybercrimeDistrictsSchema = new mongoose.Schema({
  nature_of_cases: { type: String, required: true },
  brgy: { type: Map, of: Number, default: {} },
  total_cases: { type: Number, required: true },
  district: { type: Number, required: true }
});

module.exports = mongoose.model("District-3", CybercrimeDistrictsSchema);
module.exports.schema = CybercrimeDistrictsSchema; // Ensure schema export
