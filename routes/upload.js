const express = require('express')
const multer = require('multer')
const { uploadImage } = require('../services/cloudinaryService')
const router = express.Router()

// Configure multer for memory storage
const storage = multer.memoryStorage()
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true)
    } else {
      cb(new Error('Only image files are allowed'), false)
    }
  }
})

// POST /api/upload/image
router.post('/image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' })
    }

    console.log('📤 Uploading image to Cloudinary...')
    const result = await uploadImage(req.file.buffer, {
      folder: 'raws-apparel/styles',
      public_id: `style-${Date.now()}`,
      transformation: [
        { width: 800, height: 1000, crop: 'fill' },
        { quality: 'auto' }
      ]
    })

    console.log('✅ Image uploaded successfully:', result.secure_url)
    
    res.json({
      success: true,
      imageURL: result.secure_url,
      publicId: result.public_id
    })
  } catch (error) {
    console.error('❌ Image upload failed:', error)
    res.status(500).json({ 
      error: 'Image upload failed',
      message: error.message 
    })
  }
})

module.exports = router