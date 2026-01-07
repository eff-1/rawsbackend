const express = require('express')
const axios = require('axios')
const router = express.Router()

// Test Pinterest API directly - no fallbacks, no mock data
router.get('/raw', async (req, res) => {
  try {
    const query = req.query.query || 'fashion'
    
    if (!process.env.RAPIDAPI_KEY) {
      return res.status(400).json({ 
        error: 'No RapidAPI key configured',
        message: 'Add RAPIDAPI_KEY to your .env file'
      })
    }

    console.log(`🔍 Testing RAW Pinterest API for: ${query}`)

    // Test ping first
    const pingResponse = await axios.get('https://pinterest-scraper5.p.rapidapi.com/ping', {
      headers: {
        'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
        'X-RapidAPI-Host': 'pinterest-scraper5.p.rapidapi.com'
      },
      timeout: 10000
    })
    
    console.log('✅ Ping successful:', pingResponse.data)

    res.json({
      success: true,
      query: query,
      pingResult: pingResponse.data,
      message: 'RapidAPI Pinterest ping successful'
    })

  } catch (error) {
    console.error('❌ Pinterest API test failed:', error.message)
    
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Pinterest API test failed'
    })
  }
})

// Test ScrapeCreators Pinterest API
router.get('/scrapecreators', async (req, res) => {
  try {
    const query = req.query.query || 'fashion'
    
    if (!process.env.SCRAPECREATORS_API_KEY) {
      return res.status(400).json({ 
        error: 'No ScrapeCreators API key configured',
        message: 'Add SCRAPECREATORS_API_KEY to your .env file'
      })
    }

    console.log(`🔍 Testing ScrapeCreators Pinterest API for: ${query}`)

    const response = await axios.get('https://api.scrapecreators.com/v1/pinterest/search', {
      params: {
        query: query,
        limit: 10
      },
      headers: {
        'x-api-key': process.env.SCRAPECREATORS_API_KEY
      },
      timeout: 15000
    })

    console.log('✅ ScrapeCreators API responded:', response.status)

    res.json({
      success: true,
      provider: 'ScrapeCreators',
      query: query,
      results: response.data,
      message: 'ScrapeCreators Pinterest API is working!'
    })

  } catch (error) {
    console.error('❌ ScrapeCreators API test failed:', error.message)
    
    res.status(500).json({
      success: false,
      provider: 'ScrapeCreators',
      error: error.message,
      response: error.response?.data,
      status: error.response?.status,
      message: 'ScrapeCreators API test failed'
    })
  }
})

// Debug endpoint to see raw Pinterest response structure
router.get('/debug', async (req, res) => {
  try {
    const query = req.query.query || 'fashion'
    
    console.log(`🔍 Debug Pinterest API for: ${query}`)
    
    const response = await axios.get('https://api.scrapecreators.com/v1/pinterest/search', {
      params: {
        query: query,
        limit: 5
      },
      headers: {
        'x-api-key': process.env.SCRAPECREATORS_API_KEY
      },
      timeout: 15000
    })

    // Analyze the response structure
    const analysis = {
      query: query,
      status: response.status,
      dataKeys: Object.keys(response.data),
      totalResults: response.data.pins ? response.data.pins.length : 0,
      samplePin: response.data.pins ? response.data.pins[0] : null,
      imageUrlAnalysis: response.data.pins ? response.data.pins.slice(0, 2).map((pin, index) => ({
        pinIndex: index,
        title: pin.title,
        hasImage: !!pin.image,
        imageValue: pin.image,
        hasImages: !!pin.images,
        imagesKeys: pin.images ? Object.keys(pin.images) : [],
        hasMedia: !!pin.media,
        mediaValue: pin.media,
        hasThumbnail: !!pin.thumbnail,
        thumbnailValue: pin.thumbnail,
        allKeys: Object.keys(pin)
      })) : []
    }

    res.json(analysis)

  } catch (error) {
    res.status(500).json({
      error: error.message,
      response: error.response?.data,
      status: error.response?.status
    })
  }
})

module.exports = router