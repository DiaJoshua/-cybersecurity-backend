// controllers/YearDatasetController.js
const mongoose = require("mongoose");
const YearDataset = require("../models/YearDataset");

exports.getYearDataset = async (req, res) => {
  try {
    // console.log("✅ Connected to Database:", mongoose.connection.name);

    // List all available collections in the database
    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionNames = collections.map(col => col.name);
    // console.log("Available collections:", collectionNames);

    // Explicitly set the target collection name
    const targetCollection = "YearDataset";
    // console.log("Target collection for YearDataset:", targetCollection);

    // Check if the YearDataset collection exists
    const collectionExists = collectionNames.includes(targetCollection);
    if (!collectionExists) {
      console.warn(`⚠️ Collection ${targetCollection} does not exist.`);
    }

    // Fetch records where the 'Nature of Cybercrime Cases' field is not null
    const data = await YearDataset.find({
      "Nature of Cybercrime Cases": { $ne: null }
    });

    // console.log(`Fetched ${data.length} records from ${targetCollection}.`);

    res.status(200).json(data);
  } catch (error) {
    console.error("❌ Error fetching Year dataset:", error);
    res.status(500).json({ error: error.message });
  }
};
