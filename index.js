const express = require('express')
const cors = require('cors')
require('dotenv').config()

const app = express()
const PORT = process.env.PORT || 5001

// Middleware
app.use(cors())
app.use(express.json())

// Routes
app.use('/api/auth', require('./routes/auth'))
app.use('/api/upload', require('./routes/upload'))
app.use('/api/search', require('./routes/search'))
app.use('/api/styles', require('./routes/styles'))
app.use('/api/whatsapp-link', require('./routes/whatsapp'))
app.use('/api/pinterest-test', require('./routes/pinterest-test'))
app.use('/api/google-test', require('./routes/google-test'))
app.use('/api/image-proxy', require('./routes/image-proxy'))

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Raws Apparel API is running' })
})

// Test database connection
app.get('/api/test-db', async (req, res) => {
  try {
    const { dbOperations } = require('./services/databaseService')
    const styles = await dbOperations.getAllStyles()
    res.json({ 
      status: 'OK', 
      message: 'Database connected', 
      stylesCount: styles.length 
    })
  } catch (error) {
    res.status(500).json({ 
      status: 'ERROR', 
      message: 'Database connection failed',
      error: error.message 
    })
  }
})

// Test Cloudinary connection
app.get('/api/test-cloudinary', (req, res) => {
  const cloudinary = require('cloudinary').v2
  const config = cloudinary.config()
  
  res.json({
    status: config.cloud_name && config.api_key && config.api_secret ? 'OK' : 'ERROR',
    message: config.cloud_name && config.api_key && config.api_secret ? 'Cloudinary configured' : 'Cloudinary not configured',
    cloudName: config.cloud_name || 'Missing',
    apiKey: config.api_key ? 'Set' : 'Missing',
    apiSecret: config.api_secret ? 'Set' : 'Missing'
  })
})

// Test Pinterest API
app.get('/api/test-pinterest', async (req, res) => {
  try {
    const { searchPinterest } = require('./services/pinterestService')
    const results = await searchPinterest('fashion')
    
    res.json({
      status: 'OK',
      message: 'Pinterest search working',
      resultsCount: results.length,
      apiConfigured: !!process.env.RAPIDAPI_KEY,
      sampleResults: results.slice(0, 2)
    })
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Pinterest search failed',
      error: error.message,
      apiConfigured: !!process.env.RAPIDAPI_KEY
    })
  }
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ error: 'Something went wrong!' })
})

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

app.listen(PORT, () => {
  console.log(`🚀 Raws Apparel API running on port ${PORT}`)
})