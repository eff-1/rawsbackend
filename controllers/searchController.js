const { dbOperations } = require('../services/databaseService')
const { searchPinterest } = require('../services/pinterestService')

const searchStyles = async (req, res) => {
  try {
    const { query } = req.query
    
    if (!query) {
      return res.status(400).json({ error: 'Query parameter is required' })
    }

    // Search database styles
    const databaseResults = await dbOperations.searchStyles(query)
    
    // Search Pinterest (optional - may fail in development)
    let pinterestResults = []
    try {
      pinterestResults = await searchPinterest(query)
    } catch (error) {
      console.log('Pinterest search failed:', error.message)
    }

    // Combine and dedupe results
    const combinedResults = [
      ...databaseResults.map(style => ({ ...style, source: 'database' })),
      ...pinterestResults.map(style => ({ ...style, source: 'pinterest' }))
    ]

    // Prioritize featured items
    const sortedResults = combinedResults.sort((a, b) => {
      if (a.featured && !b.featured) return -1
      if (!a.featured && b.featured) return 1
      return 0
    })

    res.json(sortedResults)
  } catch (error) {
    console.error('Search error:', error)
    res.status(500).json({ error: 'Search failed' })
  }
}

module.exports = {
  searchStyles
}