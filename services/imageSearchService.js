const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args))
const geoip = require('geoip-lite')
const { searchGoogleImages } = require('./googleSearchService')

// Detect user's country from IP
const detectUserCountry = (clientIP) => {
    try {
        if (!clientIP || clientIP === '127.0.0.1' || clientIP === '::1') {
            return 'NG' // Default to Nigeria for local development
        }

        const geo = geoip.lookup(clientIP)
        const country = geo ? geo.country : 'NG'

        console.log(`🌍 Detected user country: ${country} from IP: ${clientIP}`)
        return country
    } catch (error) {
        console.log(`⚠️ Geo detection failed: ${error.message}, defaulting to Nigeria`)
        return 'NG'
    }
}

// Main search function - GOOGLE ONLY (no more backup nonsense!)
const searchFashionImages = async (userQuery, clientIP, page = 1, limit = 20) => {
    try {
        console.log(`🔍 Fashion search: "${userQuery}" from IP: ${clientIP}, page: ${page}`)

        // Detect user country
        const userCountry = detectUserCountry(clientIP)
        
        // Use Google Custom Search API ONLY
        console.log(`🌐 Google Custom Search for "${userQuery}"`)
        const googleResults = await searchGoogleImages(userQuery, {
            page: page,
            limit: limit,
            country: userCountry.toLowerCase(),
            language: 'en'
        })

        if (!googleResults.images || googleResults.images.length === 0) {
            throw new Error('No Google results found')
        }

        console.log(`📸 Google returned ${googleResults.images.length} fashion images`)

        // Calculate pagination info
        const totalResults = googleResults.totalResults || googleResults.images.length * 10
        const totalPages = Math.ceil(totalResults / limit)
        const hasNextPage = page < totalPages

        return {
            images: googleResults.images,
            totalResults: totalResults,
            currentPage: page,
            totalPages: totalPages,
            hasNextPage: hasNextPage,
            query: userQuery,
            country: userCountry,
            searchMethod: 'google-custom-search-only',
            apiStatus: {
                google: 'active',
                backup: 'disabled'
            }
        }

    } catch (error) {
        console.error('❌ Google search failed:', error.message)
        
        // NO MORE BACKUP APIS! Return error instead
        throw new Error(`Google Custom Search failed: ${error.message}. Please check your API configuration.`)
    }
}

module.exports = {
    searchFashionImages,
    detectUserCountry
}