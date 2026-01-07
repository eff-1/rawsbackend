const { dbOperations } = require('../services/databaseService')

async function initializeDatabase() {
  console.log('🚀 Initializing Raws Apparel Database...')
  
  try {
    // Test database connection
    const styles = await dbOperations.getAllStyles()
    console.log(`✅ Database initialized with ${styles.length} styles`)
    
    // Test admin authentication
    const admin = await dbOperations.authenticateAdmin('admin@rawsapparel.com', 'admin123')
    if (admin) {
      console.log('✅ Admin user verified')
    } else {
      console.log('❌ Admin user not found')
    }
    
    console.log('🎉 Database setup complete!')
    console.log('📋 Admin Login: admin@rawsapparel.com / admin123')
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error)
  }
}

// Run if called directly
if (require.main === module) {
  initializeDatabase()
}

module.exports = { initializeDatabase }