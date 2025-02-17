const mongoose = require("mongoose");

exports.getCasesByDistrict = async (req, res) => {
  try {
    const { district } = req.params;
    const collectionName = `District-${district}`;

    console.log("Available collections:", Object.keys(mongoose.connection.collections));
    console.log(`Fetching data from collection: ${collectionName}`);

    // Instead of checking mongoose.connection.collections, we use listCollections()
    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionExists = collections.some(col => col.name === collectionName);

    if (!collectionExists) {
      return res.status(404).json({ message: `No collection found for ${collectionName}` });
    }

    // Force Mongoose to correctly reference the collection
    const Model = mongoose.connection.model(collectionName, new mongoose.Schema({}, { strict: false }), collectionName);

    // Fetch all documents from the collection
    const cases = await Model.find();

    console.log(`Cases found in ${collectionName}:`, cases);

    if (!cases.length) {
      return res.status(404).json({ message: `No cases found for ${collectionName}` });
    }

    res.json(cases);
  } catch (error) {
    console.error("❌ Error fetching cases:", error);
    res.status(500).json({ error: "Server error while fetching cases." });
  }
};


exports.getAllCases = async (req, res) => {
  try {
    const collections = ["District-3", "District-4", "District-5", "District-6"];
    let allCases = [];

    for (const collectionName of collections) {
      if (mongoose.connection.collections[collectionName]) {
        const Model = mongoose.connection.model(collectionName, new mongoose.Schema({}, { strict: false }), collectionName);
        const cases = await Model.find();
        allCases = [...allCases, ...cases];
      }
    }

    res.json(allCases);
  } catch (error) {
    console.error("❌ Error fetching all cases:", error);
    res.status(500).json({ error: "Server error while fetching all cases." });
  }
};
