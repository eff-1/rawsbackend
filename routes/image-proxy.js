const express = require('express')
const axios = require('axios')
const router = express.Router()

// Proxy Google images to avoid CORS issues
router.get('/google', async (req, res) => {
  try {
    const imageUrl = req.query.url
    
    if (!imageUrl) {
      return res.status(400).json({ error: 'Image URL required' })
    }

    console.log('🖼️ Proxying Google image:', imageUrl)

    const response = await axios.get(imageUrl, {
      responseType: 'stream',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Referer': 'https://google.com/',
        'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8'
      },
      timeout: 10000
    })

    // Set appropriate headers
    res.set({
      'Content-Type': response.headers['content-type'] || 'image/jpeg',
      'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
      'Access-Control-Allow-Origin': '*'
    })

    response.data.pipe(res)

  } catch (error) {
    console.error('❌ Google image proxy error:', error.message)
    
    // Return a placeholder image on error
    res.redirect(`https://picsum.photos/400/600?random=${Math.floor(Math.random() * 1000)}`)
  }
})

// Proxy Pinterest images to avoid CORS issues
router.get('/pinterest', async (req, res) => {
  try {
    const imageUrl = req.query.url
    
    if (!imageUrl) {
      return res.status(400).json({ error: 'Image URL required' })
    }

    console.log('🖼️ Proxying Pinterest image:', imageUrl)

    const response = await axios.get(imageUrl, {
      responseType: 'stream',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Referer': 'https://pinterest.com/',
        'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8'
      },
      timeout: 10000
    })

    // Set appropriate headers
    res.set({
      'Content-Type': response.headers['content-type'] || 'image/jpeg',
      'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
      'Access-Control-Allow-Origin': '*'
    })

    response.data.pipe(res)

  } catch (error) {
    console.error('❌ Image proxy error:', error.message)
    
    // Return a placeholder image on error
    res.redirect(`https://via.placeholder.com/400x500/8B5CF6/FFFFFF?text=Pinterest+Image`)
  }
})

module.exports = router