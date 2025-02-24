require('dotenv').config()
const express = require('express')
const cors = require('cors')
const app = express()
const path = require('path')
const Parser = require('rss-parser')
const axios = require('axios')
const errorHandler = require('./middleware/errorHandler')
const cookieParser = require('cookie-parser')
const corsOptions = require('./config/corsOptions')
const connectDB = require("./config/dbConn");
const mongoose = require('mongoose')
const { logger, logEvents } = require('./middleware/logger')
const cybercrimeRoutes = require("./routes/cybercrimeRoutes");
const yearDatasetRoutes = require("./routes/yearDataset");
const PORT = process.env.PORT || 5000

connectDB();

app.use(logger)
app.use(cors(corsOptions))
app.use(express.json())
app.use(cookieParser())
app.use('/', express.static(path.join(__dirname, 'public')))
app.use('/', require('./routes/root'))

// Serve static files from the Server folder at the URL /Server
app.use("/Server", express.static(path.join(__dirname, "Server")));

const parser = new Parser()

mongoose.connection.once('open', () => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
})

mongoose.connection.on('error', err => {
  console.log(err)
})


app.get("/fetch-cybercrime-news", async (req, res) => {
  try {
      const apiKey = process.env.NEWS_API_KEY;
      if (!apiKey) {
          console.error("❌ Error: Missing API Key.");
          return res.status(500).json({ error: "API key is missing." });
      }

      const url = `https://serpapi.com/search?engine=google_news&q=cybercrime+Philippines&api_key=${apiKey}&tbm=nws`;
      const response = await axios.get(url);

      if (!response.data.news_results || response.data.news_results.length === 0) {
          console.warn("⚠️ No articles found.");
          return res.status(404).json({ message: "No news found for the specified query." });
      }

      // Map the SerpAPI response to match frontend needs
      const articles = response.data.news_results.map((article) => ({
          title: article.title || "No Title",
          // description: article.snippet || "No description available",
          url: article.link || "#",
          image: article.thumbnail && article.thumbnail.startsWith("http") ? article.thumbnail : null,
          publishedAt: article.date || "Unknown Date",
      }));

      res.status(200).json(articles);
  } catch (error) {
      console.error("🔥 Error fetching news:", error.message);
      res.status(500).json({ error: "Failed to fetch news. See logs for details." });
  }
});


// Route to fetch all cybercrime data
app.use("/api", cybercrimeRoutes);
app.use("/yeardataset", yearDatasetRoutes);



app.use('*', (req, res) => {
  res.status(404)
  if (req.accepts('html')) {
    res.sendFile(path.join(__dirname, 'views', '404.html'))
  } else if (req.accepts('json')) {
    res.json({ message: '404 Not Found' })
  } else {
    res.type('txt').send('404 Not Found')
  }
})

app.use(errorHandler)