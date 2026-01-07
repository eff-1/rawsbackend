const { dbOperations } = require('../services/databaseService')

const login = async (req, res) => {
  try {
    const { email, password } = req.body
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' })
    }

    const admin = await dbOperations.authenticateAdmin(email, password)
    
    if (!admin) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    // In a real app, you'd generate a JWT token here
    res.json({ 
      success: true, 
      admin: { id: admin.id, email: admin.email },
      message: 'Login successful'
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ error: 'Login failed' })
  }
}

module.exports = {
  login
}