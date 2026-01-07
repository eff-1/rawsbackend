const cloudinary = require('cloudinary').v2

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

// Test Cloudinary configuration
const testCloudinaryConfig = () => {
  const config = cloudinary.config()
  console.log('☁️ Cloudinary Configuration:')
  console.log('   Cloud Name:', config.cloud_name || '❌ Missing')
  console.log('   API Key:', config.api_key ? '✅ Set' : '❌ Missing')
  console.log('   API Secret:', config.api_secret ? '✅ Set' : '❌ Missing')
  
  if (!config.cloud_name || !config.api_key || !config.api_secret) {
    console.log('⚠️ Cloudinary not fully configured - image uploads will fail')
    return false
  }
  console.log('✅ Cloudinary ready for image uploads')
  return true
}

// Test configuration on startup
testCloudinaryConfig()

const uploadImage = async (imageBuffer, options = {}) => {
  try {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: 'raws-apparel',
          transformation: [
            { width: 800, height: 1000, crop: 'fill' },
            { quality: 'auto' },
            { format: 'auto' }
          ],
          ...options
        },
        (error, result) => {
          if (error) {
            reject(error)
          } else {
            resolve(result)
          }
        }
      ).end(imageBuffer)
    })
  } catch (error) {
    console.error('Cloudinary upload error:', error)
    throw error
  }
}

const deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId)
    return result
  } catch (error) {
    console.error('Cloudinary delete error:', error)
    throw error
  }
}

const generateOptimizedUrl = (publicId, options = {}) => {
  return cloudinary.url(publicId, {
    transformation: [
      { width: 400, height: 500, crop: 'fill' },
      { quality: 'auto' },
      { format: 'auto' }
    ],
    ...options
  })
}

module.exports = {
  uploadImage,
  deleteImage,
  generateOptimizedUrl
}