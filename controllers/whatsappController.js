const generateWhatsAppLink = (req, res) => {
  try {
    const { imageURL, title, optionalMessage, category, description } = req.body
    
    if (!imageURL || !title) {
      return res.status(400).json({ 
        error: 'imageURL and title are required' 
      })
    }

    const businessNumber = process.env.BUSINESS_WHATSAPP_NUMBER || '2348128653553'
    
    // Create a beautifully formatted message
    let message = `🌟 *RAWS APPAREL INQUIRY* 🌟\n\n`
    message += `Hello! I'm interested in this design:\n\n`
    message += `📸 *${title}*\n`
    
    if (category) {
      message += `📂 Category: ${category}\n`
    }
    
    if (description) {
      message += `📝 ${description}\n`
    }
    
    message += `\n🔗 *View Design:*\n${imageURL}\n\n`
    
    if (optionalMessage) {
      message += `💬 *Additional Notes:*\n${optionalMessage}\n\n`
    }
    
    message += `✨ Could you please provide:\n`
    message += `• Price for this design\n`
    message += `• Available sizes\n`
    message += `• Delivery timeline\n`
    message += `• Measurement requirements\n\n`
    message += `Thank you! 🙏`

    // URL encode the message
    const encodedMessage = encodeURIComponent(message)
    
    // Generate WhatsApp link
    const whatsappLink = `https://wa.me/${businessNumber}?text=${encodedMessage}`

    res.json({ whatsappLink })
  } catch (error) {
    console.error('WhatsApp link generation error:', error)
    res.status(500).json({ error: 'Failed to generate WhatsApp link' })
  }
}

module.exports = {
  generateWhatsAppLink
}