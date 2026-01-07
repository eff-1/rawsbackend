const express = require('express')
const router = express.Router()
const { searchGoogleImages, checkQuotaStatus, GOOGLE_CONFIG } = require('../services/googleSearchService')

// Test Google Custom Search API setup
router.get('/setup', async (req, res) => {
  try {
    const setupStatus = {
      apiKey: !!GOOGLE_CONFIG.apiKey ? 'Configured' : 'Missing',
      searchEngineId: !!GOOGLE_CONFIG.searchEngineId ? 'Configured' : 'Missing',
      isConfigured: !!(GOOGLE_CONFIG.apiKey && GOOGLE_CONFIG.searchEngineId)
    }

    if (!setupStatus.isConfigured) {
      return res.json({
        success: false,
        message: 'Google Custom Search API not configured',
        setup: setupStatus,
        instructions: 'Please set GOOGLE_API_KEY and GOOGLE_SEARCH_ENGINE_ID in your .env file'
      })
    }

    // Test with a simple search
    const testResult = await searchGoogleImages('fashion', { limit: 3 })
    
    res.json({
      success: true,
      message: 'Google Custom Search API is working!',
      setup: setupStatus,
      testResults: {
        imagesFound: testResult.images.length,
        totalResults: testResult.totalResults,
        searchTime: testResult.searchTime,
        sampleImages: testResult.images.slice(0, 2).map(img => ({
          title: img.title,
          source: img.source,
          photographer: img.photographer
        }))
      }
    })

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Google Custom Search API test failed',
      error: error.message,
      setup: {
        apiKey: !!GOOGLE_CONFIG.apiKey ? 'Configured' : 'Missing',
        searchEngineId: !!GOOGLE_CONFIG.searchEngineId ? 'Configured' : 'Missing'
      }
    })
  }
})

// Test search with different queries
router.get('/search', async (req, res) => {
  try {
    const { query = 'fashion', limit = 5, page = 1 } = req.query

    console.log(`🧪 Testing Google search: "${query}"`)

    const results = await searchGoogleImages(query, {
      page: parseInt(page),
      limit: parseInt(limit),
      country: 'ng',
      language: 'en'
    })

    res.json({
      success: true,
      query,
      results: {
        imagesFound: results.images.length,
        totalResults: results.totalResults,
        searchTime: results.searchTime,
        images: results.images.map(img => ({
          id: img.id,
          title: img.title,
          imageURL: img.imageURL,
          thumbnailURL: img.thumbnailURL,
          source: img.source,
          photographer: img.photographer,
          width: img.width,
          height: img.height,
          contextLink: img.contextLink
        }))
      }
    })

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Google search test failed',
      error: error.message
    })
  }
})

// Check quota status
router.get('/quota', async (req, res) => {
  try {
    const quotaStatus = await checkQuotaStatus()
    
    res.json({
      success: true,
      quota: quotaStatus,
      limits: {
        daily: 100,
        description: 'Free tier provides 100 searches per day'
      }
    })

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Could not check quota status',
      error: error.message
    })
  }
})

module.exports = router