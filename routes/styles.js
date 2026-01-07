const express = require('express')
const router = express.Router()
const { getStyles, createStyle, updateStyle, deleteStyle } = require('../controllers/stylesController')

// GET /api/styles - Get all styles
router.get('/', getStyles)

// POST /api/styles - Create new style (admin only)
router.post('/', createStyle)

// PUT /api/styles/:id - Update style (admin only)
router.put('/:id', updateStyle)

// DELETE /api/styles/:id - Delete style (admin only)
router.delete('/:id', deleteStyle)

module.exports = router