#!/usr/bin/env node

/**
 * API Key Tester for Image Search APIs
 * Run this script to test your API keys before using them in production
 * 
 * Usage: node test-api-keys.js
 */

require('dotenv').config()
const fetch = require('node-fetch')

const API_KEYS = {
    unsplash: process.env.UNSPLASH_ACCESS_KEY,
    pexels: process.env.PEXELS_API_KEY,
    pixabay: process.env.PIXABAY_API_KEY
}

// Test Unsplash API
async function testUnsplash() {
    console.log('\n🔍 Testing Unsplash API...')
    
    if (!API_KEYS.unsplash || API_KEYS.unsplash === 'your_unsplash_access_key_here') {
        console.log('❌ Unsplash: No API key found')
        console.log('   Get free key at: https://unsplash.com/developers')
        return false
    }

    try {
        const response = await fetch('https://api.unsplash.com/search/photos?query=fashion&per_page=1', {
            headers: {
                'Authorization': `Client-ID ${API_KEYS.unsplash}`,
                'Accept-Version': 'v1'
            }
        })

        if (response.ok) {
            const data = await response.json()
            console.log('✅ Unsplash: API key is valid!')
            console.log(`   Rate limit: ${response.headers.get('x-ratelimit-remaining')}/${response.headers.get('x-ratelimit-limit')} remaining`)
            return true
        } else {
            const error = await response.text()
            console.log('❌ Unsplash: API key is invalid')
            console.log(`   Error: ${response.status} - ${error}`)
            return false
        }
    } catch (error) {
        console.log('❌ Unsplash: Connection failed')
        console.log(`   Error: ${error.message}`)
        return false
    }
}

// Test Pexels API
async function testPexels() {
    console.log('\n🔍 Testing Pexels API...')
    
    if (!API_KEYS.pexels || API_KEYS.pexels === 'your_pexels_api_key_here') {
        console.log('❌ Pexels: No API key found')
        console.log('   Get free key at: https://www.pexels.com/api/')
        return false
    }

    try {
        const response = await fetch('https://api.pexels.com/v1/search?query=fashion&per_page=1', {
            headers: {
                'Authorization': API_KEYS.pexels
            }
        })

        if (response.ok) {
            const data = await response.json()
            console.log('✅ Pexels: API key is valid!')
            console.log(`   Rate limit: ${response.headers.get('x-ratelimit-remaining')}/${response.headers.get('x-ratelimit-limit')} remaining`)
            return true
        } else {
            const error = await response.text()
            console.log('❌ Pexels: API key is invalid')
            console.log(`   Error: ${response.status} - ${error}`)
            return false
        }
    } catch (error) {
        console.log('❌ Pexels: Connection failed')
        console.log(`   Error: ${error.message}`)
        return false
    }
}

// Test Pixabay API
async function testPixabay() {
    console.log('\n🔍 Testing Pixabay API...')
    
    if (!API_KEYS.pixabay || API_KEYS.pixabay === 'your_pixabay_api_key_here') {
        console.log('❌ Pixabay: No API key found')
        console.log('   Get free key at: https://pixabay.com/api/docs/')
        return false
    }

    try {
        const response = await fetch(`https://pixabay.com/api/?key=${API_KEYS.pixabay}&q=fashion&per_page=3`)

        if (response.ok) {
            const data = await response.json()
            console.log('✅ Pixabay: API key is valid!')
            console.log(`   Found ${data.totalHits} total images`)
            return true
        } else {
            const error = await response.text()
            console.log('❌ Pixabay: API key is invalid')
            console.log(`   Error: ${response.status} - ${error}`)
            return false
        }
    } catch (error) {
        console.log('❌ Pixabay: Connection failed')
        console.log(`   Error: ${error.message}`)
        return false
    }
}

// Main test function
async function testAllAPIs() {
    console.log('🧪 Testing Image Search API Keys...')
    console.log('=====================================')

    const results = await Promise.all([
        testUnsplash(),
        testPexels(),
        testPixabay()
    ])

    const validKeys = results.filter(Boolean).length
    
    console.log('\n📊 Test Results:')
    console.log('================')
    console.log(`✅ Valid API keys: ${validKeys}/3`)
    
    if (validKeys === 0) {
        console.log('\n⚠️  No valid API keys found. The app will use demo images.')
        console.log('   To get real fashion images, sign up for free API keys:')
        console.log('   • Unsplash: https://unsplash.com/developers (5000 requests/hour)')
        console.log('   • Pexels: https://www.pexels.com/api/ (200 requests/hour)')
        console.log('   • Pixabay: https://pixabay.com/api/docs/ (5000 requests/day)')
    } else if (validKeys < 3) {
        console.log('\n⚠️  Some API keys are missing. Consider adding more for better results.')
    } else {
        console.log('\n🎉 All API keys are working! Your fashion search is ready!')
    }
}

// Run the tests
testAllAPIs().catch(console.error)