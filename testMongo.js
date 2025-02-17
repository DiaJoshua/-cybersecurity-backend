const mongoose = require("mongoose");
require("dotenv").config();

const DATABASE_URI = process.env.DATABASE_URI;

async function testConnection() {
  try {
    await mongoose.connect(DATABASE_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("✅ MongoDB Connected");

    // Fetch available collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log("Collections:", collections.map((c) => c.name));

    // Fetch sample data from District-3
    const District3 = mongoose.connection.db.collection("District-3");
    const cases = await District3.find({}).toArray();
    console.log("District-3 Cases:", cases);

    mongoose.connection.close();
  } catch (error) {
    console.error("❌ MongoDB Test Error:", error);
  }
}

testConnection();
