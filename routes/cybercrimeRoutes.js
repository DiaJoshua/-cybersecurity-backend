const express = require('express');
const router = express.Router();
const Cybercrime = require('../models/Cybercrime');

// Route to fetch all cybercrime data
router.get('/cybercrime-stats', async (req, res) => {
  try {
    const cybercrimeStats = await Cybercrime.find(); // Fetches all data from the cybercrime_stats collection
    res.status(200).json(cybercrimeStats); // Returns the data as a JSON response
  } catch (error) {
    console.error('Error fetching cybercrime stats:', error.message);
    res.status(500).json({ error: 'Failed to fetch cybercrime stats. Please try again later.' });
  }
});

// Route to fetch cybercrime data by specific nature of the case
router.get('/cybercrime-stats/:nature', async (req, res) => {
  try {
    const { nature } = req.params; // Extracts the "nature" from the URL parameters
    const cybercrimeStats = await Cybercrime.find({ "Nature of Cybercrime Cases": nature }); // Query data by nature of the case
    
    if (cybercrimeStats.length === 0) {
      return res.status(404).json({ message: 'No cybercrime stats found for the specified nature.' });
    }

    res.status(200).json(cybercrimeStats); // Return matching data as JSON
  } catch (error) {
    console.error('Error fetching cybercrime stats:', error.message);
    res.status(500).json({ error: 'Failed to fetch cybercrime stats for the specified nature. Please try again later.' });
  }
});

// Route to fetch cybercrime data by a specific quarter (example: 4th Quarter of 2023)
router.get('/cybercrime-stats/quarter/:quarter', async (req, res) => {
  try {
    const { quarter } = req.params;
    const query = { [`${quarter}`]: { $exists: true } }; // Query based on the specific quarter field
    const cybercrimeStats = await Cybercrime.find(query);
    
    if (cybercrimeStats.length === 0) {
      return res.status(404).json({ message: `No cybercrime stats found for ${quarter}.` });
    }

    res.status(200).json(cybercrimeStats);
  } catch (error) {
    console.error('Error fetching cybercrime stats:', error.message);
    res.status(500).json({ error: 'Failed to fetch cybercrime stats for the specified quarter. Please try again later.' });
  }
});

module.exports = router;
