const { dbOperations } = require('../services/databaseService')

const getStyles = async (req, res) => {
  try {
    const styles = await dbOperations.getAllStyles()
    res.json(styles)
  } catch (error) {
    console.error('Get styles error:', error)
    res.status(500).json({ error: 'Failed to fetch styles' })
  }
}

const createStyle = async (req, res) => {
  try {
    const styleData = req.body
    
    // Validate required fields
    if (!styleData.title || !styleData.category || !styleData.imageURL) {
      return res.status(400).json({ 
        error: 'Title, category, and imageURL are required' 
      })
    }

    const newStyle = await dbOperations.createStyle(styleData)
    res.status(201).json(newStyle)
  } catch (error) {
    console.error('Create style error:', error)
    res.status(500).json({ error: 'Failed to create style' })
  }
}

const updateStyle = async (req, res) => {
  try {
    const { id } = req.params
    const updateData = req.body

    const updatedStyle = await dbOperations.updateStyle(id, updateData)
    res.json(updatedStyle)
  } catch (error) {
    console.error('Update style error:', error)
    res.status(500).json({ error: 'Failed to update style' })
  }
}

const deleteStyle = async (req, res) => {
  try {
    const { id } = req.params
    
    await dbOperations.deleteStyle(id)
    res.json({ message: 'Style deleted successfully' })
  } catch (error) {
    console.error('Delete style error:', error)
    res.status(500).json({ error: 'Failed to delete style' })
  }
}

module.exports = {
  getStyles,
  createStyle,
  updateStyle,
  deleteStyle
}