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
const connectDB = require('./config/dbConn')
const mongoose = require('mongoose')
const { logger, logEvents } = require('./middleware/logger')
const cybercrimeRoutes = require("./routes/cybercrimeRoutes");
const PORT = process.env.PORT || 5000

connectDB()

app.use(logger)
app.use(cors(corsOptions))
app.use(express.json())
app.use(cookieParser())
app.use('/', express.static(path.join(__dirname, 'public')))
app.use('/', require('./routes/root'))

const parser = new Parser()

mongoose.connection.once('open', () => {
  console.log('Connected to MongoDB')
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
})

mongoose.connection.on('error', err => {
  console.log(err)
})

app.get('/fetch-cybercrime-news', async (req, res) => {
  try {
    const apiKey = process.env.NEWS_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'API key is missing.' });
    }

    const url = `https://newsapi.org/v2/everything?q=cybercrime+Philippines&language=en&sortBy=publishedAt&apiKey=${apiKey}`;
    const response = await axios.get(url);
    
    if (!response.data.articles || response.data.articles.length === 0) {
      return res.status(404).json({ message: 'No news found for the specified query.' });
    }

    const articles = response.data.articles.map((article) => {
      return {
        title: article.title,
        description: article.description || 'No description available',
        url: article.url,
        image: article.urlToImage || 'default-image.jpg',
        publishedAt: article.publishedAt,
      };
    });

    res.status(200).json(articles);
  } catch (error) {
    console.error('Error fetching news:', error.message);
    res.status(500).json({ error: 'Failed to fetch news. Please try again later.' });
  }
});

// Route to fetch all cybercrime data
app.use("/api", cybercrimeRoutes);

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