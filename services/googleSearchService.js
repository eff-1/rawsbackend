const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args))

// Google Custom Search API Configuration
const GOOGLE_CONFIG = {
    baseUrl: 'https://www.googleapis.com/customsearch/v1',
    apiKey: process.env.GOOGLE_API_KEY,
    searchEngineId: process.env.GOOGLE_SEARCH_ENGINE_ID,
    dailyLimit: 100, // Free tier: 100 searches per day
    searchType: 'image',
    imgSize: 'medium', // small, medium, large, xlarge
    imgType: 'photo', // photo, face, clipart, lineart, animated
    safe: 'active', // active, high, medium, off
    rights: 'cc_publicdomain,cc_attribute,cc_sharealike,cc_noncommercial,cc_nonderived'
}

/**
 * Search Google Images using Custom Search API
 * This gives us access to the same images Google shows in image search
 */
const searchGoogleImages = async (query, options = {}) => {
    const {
        page = 1,
        limit = 10,
        country = 'ng',
        language = 'en',
        imageSize = 'medium',
        imageType = 'photo',
        safeSearch = 'active'
    } = options

    try {
        // Check if API is configured
        if (!GOOGLE_CONFIG.apiKey || !GOOGLE_CONFIG.searchEngineId) {
            throw new Error('Google Custom Search API not configured. Please set GOOGLE_API_KEY and GOOGLE_SEARCH_ENGINE_ID environment variables.')
        }

        // Calculate start index for pagination
        const startIndex = ((page - 1) * limit) + 1

        // Build search URL with parameters (clothing-focused but simpler)
        const clothingQuery = `${query} clothing fashion dress outfit -money -cash -shoes -bag`
        const searchParams = new URLSearchParams({
            key: GOOGLE_CONFIG.apiKey,
            cx: GOOGLE_CONFIG.searchEngineId,
            q: clothingQuery,
            searchType: 'image',
            imgSize: imageSize,
            imgType: imageType,
            safe: safeSearch,
            start: startIndex,
            num: Math.min(limit, 10),
            gl: country.toLowerCase()
        })

        const url = `${GOOGLE_CONFIG.baseUrl}?${searchParams}`

        console.log(`🌐 Google Custom Search: "${query}" (page ${page}, country: ${country})`)
        console.log(`🔗 Request URL: ${url}`)

        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Raws-Apparel-Fashion-Search/1.0',
                'Accept': 'application/json'
            },
            timeout: 10000
        })

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            
            if (response.status === 429) {
                throw new Error('Google API quota exceeded. Please try again later or upgrade your plan.')
            } else if (response.status === 403) {
                throw new Error('Google API access forbidden. Please check your API key and search engine configuration.')
            } else if (response.status === 400) {
                throw new Error(`Google API bad request: ${errorData.error?.message || 'Invalid parameters'}`)
            }
            
            throw new Error(`Google API error ${response.status}: ${errorData.error?.message || 'Unknown error'}`)
        }

        const data = await response.json()

        // Check if we have results
        if (!data.items || data.items.length === 0) {
            console.log(`⚠️ Google returned no results for "${query}"`)
            return {
                images: [],
                totalResults: 0,
                searchInfo: data.searchInformation || {},
                quotaUsed: true
            }
        }

        // Transform Google results to our format
        const images = data.items.map((item, index) => ({
            id: `google-${item.cacheId || Date.now()}-${index}`,
            title: cleanTitle(item.title) || `${query} Fashion Style ${index + 1}`,
            imageURL: item.link,
            thumbnailURL: item.image?.thumbnailLink || item.link,
            description: cleanDescription(item.snippet) || `Fashion inspiration for ${query}`,
            source: 'google',
            photographer: extractDomain(item.image?.contextLink) || 'Google Images',
            tags: extractTags(query, item.title, item.snippet),
            width: parseInt(item.image?.width) || 400,
            height: parseInt(item.image?.height) || 600,
            category: 'Fashion Inspiration',
            contextLink: item.image?.contextLink,
            displayLink: item.displayLink,
            fileFormat: item.fileFormat || 'image',
            byteSize: item.image?.byteSize || null
        }))

        console.log(`✅ Google returned ${images.length} fashion images`)

        return {
            images,
            totalResults: parseInt(data.searchInformation?.totalResults) || images.length,
            searchTime: parseFloat(data.searchInformation?.searchTime) || 0,
            searchInfo: data.searchInformation || {},
            quotaUsed: true
        }

    } catch (error) {
        console.error('❌ Google Custom Search failed:', error.message)
        throw error
    }
}

/**
 * Get search suggestions based on query
 */
const getSearchSuggestions = async (query) => {
    // This would require Google Autocomplete API (separate service)
    // For now, return fashion-related suggestions
    const fashionSuggestions = [
        `${query} dress`,
        `${query} outfit`,
        `${query} style`,
        `${query} fashion`,
        `${query} clothing`,
        `${query} wear`
    ]
    
    return fashionSuggestions.slice(0, 5)
}

/**
 * Check API quota status
 */
const checkQuotaStatus = async () => {
    try {
        // Make a minimal test search to check quota
        const testResponse = await searchGoogleImages('fashion', { limit: 1 })
        return {
            available: true,
            remaining: 'unknown', // Google doesn't provide remaining quota info
            message: 'API is working'
        }
    } catch (error) {
        if (error.message.includes('quota exceeded')) {
            return {
                available: false,
                remaining: 0,
                message: 'Daily quota exceeded'
            }
        }
        return {
            available: false,
            remaining: 'unknown',
            message: error.message
        }
    }
}

// Helper functions
const cleanTitle = (title) => {
    if (!title) return null
    return title
        .replace(/\s+/g, ' ')
        .replace(/[^\w\s-]/g, '')
        .trim()
        .substring(0, 100)
}

const cleanDescription = (description) => {
    if (!description) return null
    return description
        .replace(/<[^>]*>/g, '') // Remove HTML tags
        .replace(/\s+/g, ' ')
        .trim()
        .substring(0, 200)
}

const extractDomain = (url) => {
    if (!url) return null
    try {
        return new URL(url).hostname.replace('www.', '')
    } catch {
        return null
    }
}

const extractTags = (query, title, description) => {
    const tags = new Set(['Fashion', 'Style', 'Google'])
    
    // Add query as tag
    if (query) tags.add(query)
    
    // Extract relevant words from title and description
    const text = `${title || ''} ${description || ''}`.toLowerCase()
    const fashionKeywords = [
        'dress', 'outfit', 'style', 'fashion', 'clothing', 'wear', 'apparel',
        'gown', 'suit', 'shirt', 'pants', 'skirt', 'blouse', 'jacket',
        'casual', 'formal', 'elegant', 'trendy', 'modern', 'classic',
        'wedding', 'party', 'business', 'evening', 'summer', 'winter'
    ]
    
    fashionKeywords.forEach(keyword => {
        if (text.includes(keyword)) {
            tags.add(keyword.charAt(0).toUpperCase() + keyword.slice(1))
        }
    })
    
    return Array.from(tags).slice(0, 8) // Limit to 8 tags
}

module.exports = {
    searchGoogleImages,
    getSearchSuggestions,
    checkQuotaStatus,
    GOOGLE_CONFIG
}