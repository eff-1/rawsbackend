const express = require('express')
const router = express.Router()
const { generateWhatsAppLink } = require('../controllers/whatsappController')

// POST /api/whatsapp-link
router.post('/', generateWhatsAppLink)

module.exports = router