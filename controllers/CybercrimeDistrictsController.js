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
    let allCases = [];

    console.log("✅ Connected to Database:", mongoose.connection.name);

    // Fetch available collections dynamically
    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionNames = collections.map(col => col.name); // Extract collection names

    console.log("Available collections:", collectionNames);

    for (const collectionName of collectionNames) {
      if (["District-3", "District-4", "District-5", "District-6"].includes(collectionName)) {
        console.log("Processing collection:", collectionName);

        const Model = mongoose.connection.models[collectionName] || 
                      mongoose.model(collectionName, new mongoose.Schema({}, { strict: false }), collectionName);
        
        const cases = await Model.find();
        console.log(`Cases from ${collectionName}:`, cases.length);

        allCases = [...allCases, ...cases];
      }
    }

    console.log("Total cases retrieved:", allCases.length);
    res.json(allCases);
  } catch (error) {
    console.error("❌ Error fetching all cases:", error);
    res.status(500).json({ error: "Server error while fetching all cases." });
  }
};

