const express = require('express')
const router = express.Router()
const { searchStyles } = require('../controllers/searchController')
const { searchPinterest } = require('../services/pinterestService')
const { searchFashionImages } = require('../services/imageSearchService')

// GET /api/search?query=<query>
router.get('/', searchStyles)

// GET /api/search/images?query=<query>&page=1&limit=20
router.get('/images', async (req, res) => {
  try {
    const { query, page = 1, limit = 20 } = req.query
    
    if (!query) {
      return res.status(400).json({ 
        success: false, 
        message: 'Query parameter is required' 
      })
    }

    console.log(`🔍 Multi-source image search: "${query}" (page ${page})`)
    
    // Get client IP for geo-detection
    const clientIP = req.headers['x-forwarded-for'] || 
                    req.connection.remoteAddress || 
                    req.socket.remoteAddress ||
                    (req.connection.socket ? req.connection.socket.remoteAddress : null)
    
    const results = await searchFashionImages(query, clientIP, parseInt(page), parseInt(limit))
    
    res.json({
      success: true,
      ...results,
      message: `Found ${results.totalResults} fashion images for "${query}"`
    })
    
  } catch (error) {
    console.error('Multi-source image search error:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Image search failed: ' + error.message,
      error: error.message 
    })
  }
})

// GET /api/search/pinterest?query=<query> (Legacy support)
router.get('/pinterest', async (req, res) => {
  try {
    const { query } = req.query
    
    if (!query) {
      return res.status(400).json({ 
        success: false, 
        message: 'Query parameter is required' 
      })
    }

    console.log(`🔍 Pinterest search request: ${query}`)
    
    const results = await searchPinterest(query)
    
    res.json({
      success: true,
      query: query,
      count: results.length,
      results: results,
      message: `Found ${results.length} Pinterest results for "${query}"`
    })
    
  } catch (error) {
    console.error('Pinterest search error:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Pinterest search failed: ' + error.message,
      error: error.message 
    })
  }
})

module.exports = router