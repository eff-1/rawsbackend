const sqlite3 = require('sqlite3').verbose()
const path = require('path')

// Ensure database directory exists
const fs = require('fs')
const dbDir = path.join(__dirname, '../database')
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true })
    console.log('📁 Created database directory')
}

// Create database connection
const dbPath = path.join(__dirname, '../database/raws_apparel.db')
console.log('🔗 Connecting to database at:', dbPath)

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ Error opening database:', err.message)
    } else {
        console.log('✅ Connected to SQLite database')
        initializeTables()
    }
})

// Initialize database tables
function initializeTables() {
    // Create styles table
    db.run(`
    CREATE TABLE IF NOT EXISTS styles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      description TEXT,
      imageURL TEXT NOT NULL,
      tags TEXT, -- JSON string of array
      featured BOOLEAN DEFAULT 0,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
        if (err) {
            console.error('Error creating styles table:', err)
        } else {
            console.log('✅ Styles table ready')
            insertSampleData()
        }
    })

    // Create admin users table
    db.run(`
    CREATE TABLE IF NOT EXISTS admin_users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
        if (err) {
            console.error('Error creating admin_users table:', err)
        } else {
            console.log('✅ Admin users table ready')
            createAdminUser()
        }
    })
}

// Insert sample data
function insertSampleData() {
    const sampleStyles = [
        {
            title: 'Royal Agbada',
            category: 'Traditional',
            description: 'Elegant traditional agbada with intricate embroidery',
            imageURL: 'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=400&h=500&fit=crop',
            tags: JSON.stringify(['Traditional', 'Formal', 'Embroidery']),
            featured: 1
        },
        {
            title: 'Executive Suit',
            category: 'Business',
            description: 'Sharp tailored suit perfect for business meetings',
            imageURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop',
            tags: JSON.stringify(['Business', 'Formal', 'Modern']),
            featured: 1
        },
        {
            title: 'Evening Gown',
            category: 'Evening',
            description: 'Stunning evening gown for special occasions',
            imageURL: 'https://images.unsplash.com/photo-1566479179817-c0b5b4b4b1e5?w=400&h=500&fit=crop',
            tags: JSON.stringify(['Evening', 'Formal', 'Elegant']),
            featured: 0
        }
    ]

    // Check if data already exists
    db.get('SELECT COUNT(*) as count FROM styles', (err, row) => {
        if (err) {
            console.error('Error checking styles count:', err)
            return
        }

        if (row.count === 0) {
            console.log('📝 Inserting sample styles...')
            const stmt = db.prepare(`
        INSERT INTO styles (title, category, description, imageURL, tags, featured)
        VALUES (?, ?, ?, ?, ?, ?)
      `)

            sampleStyles.forEach(style => {
                stmt.run([
                    style.title,
                    style.category,
                    style.description,
                    style.imageURL,
                    style.tags,
                    style.featured
                ])
            })

            stmt.finalize()
            console.log('✅ Sample styles inserted')
        }
    })
}

// Create admin user
function createAdminUser() {
    const bcrypt = require('bcrypt')

    db.get('SELECT COUNT(*) as count FROM admin_users', (err, row) => {
        if (err) {
            console.error('Error checking admin users:', err)
            return
        }

        if (row.count === 0) {
            console.log('👤 Creating admin user...')
            const hashedPassword = bcrypt.hashSync('admin123', 10)

            db.run(
                'INSERT INTO admin_users (email, password) VALUES (?, ?)',
                ['admin@rawsapparel.com', hashedPassword],
                (err) => {
                    if (err) {
                        console.error('Error creating admin user:', err)
                    } else {
                        console.log('✅ Admin user created: admin@rawsapparel.com / admin123')
                    }
                }
            )
        }
    })
}

// Database operations
const dbOperations = {
    // Get all styles
    getAllStyles: () => {
        return new Promise((resolve, reject) => {
            db.all(
                'SELECT * FROM styles ORDER BY createdAt DESC',
                (err, rows) => {
                    if (err) {
                        reject(err)
                    } else {
                        const styles = rows.map(row => ({
                            ...row,
                            tags: JSON.parse(row.tags || '[]'),
                            featured: Boolean(row.featured)
                        }))
                        resolve(styles)
                    }
                }
            )
        })
    },

    // Search styles
    searchStyles: (query) => {
        return new Promise((resolve, reject) => {
            const searchTerm = `%${query.toLowerCase()}%`
            db.all(
                `SELECT * FROM styles 
         WHERE LOWER(title) LIKE ? 
         OR LOWER(category) LIKE ? 
         OR LOWER(description) LIKE ?
         OR LOWER(tags) LIKE ?
         ORDER BY featured DESC, createdAt DESC`,
                [searchTerm, searchTerm, searchTerm, searchTerm],
                (err, rows) => {
                    if (err) {
                        reject(err)
                    } else {
                        const styles = rows.map(row => ({
                            ...row,
                            tags: JSON.parse(row.tags || '[]'),
                            featured: Boolean(row.featured)
                        }))
                        resolve(styles)
                    }
                }
            )
        })
    },

    // Create new style
    createStyle: (styleData) => {
        return new Promise((resolve, reject) => {
            const { title, category, description, imageURL, tags, featured } = styleData

            db.run(
                `INSERT INTO styles (title, category, description, imageURL, tags, featured)
         VALUES (?, ?, ?, ?, ?, ?)`,
                [
                    title,
                    category,
                    description || '',
                    imageURL,
                    JSON.stringify(tags || []),
                    featured ? 1 : 0
                ],
                function (err) {
                    if (err) {
                        reject(err)
                    } else {
                        // Get the created style
                        db.get(
                            'SELECT * FROM styles WHERE id = ?',
                            [this.lastID],
                            (err, row) => {
                                if (err) {
                                    reject(err)
                                } else {
                                    resolve({
                                        ...row,
                                        tags: JSON.parse(row.tags || '[]'),
                                        featured: Boolean(row.featured)
                                    })
                                }
                            }
                        )
                    }
                }
            )
        })
    },

    // Update style
    updateStyle: (id, updateData) => {
        return new Promise((resolve, reject) => {
            const { title, category, description, imageURL, tags, featured } = updateData

            db.run(
                `UPDATE styles 
         SET title = ?, category = ?, description = ?, imageURL = ?, tags = ?, featured = ?, updatedAt = CURRENT_TIMESTAMP
         WHERE id = ?`,
                [
                    title,
                    category,
                    description || '',
                    imageURL,
                    JSON.stringify(tags || []),
                    featured ? 1 : 0,
                    id
                ],
                function (err) {
                    if (err) {
                        reject(err)
                    } else {
                        // Get the updated style
                        db.get(
                            'SELECT * FROM styles WHERE id = ?',
                            [id],
                            (err, row) => {
                                if (err) {
                                    reject(err)
                                } else {
                                    resolve({
                                        ...row,
                                        tags: JSON.parse(row.tags || '[]'),
                                        featured: Boolean(row.featured)
                                    })
                                }
                            }
                        )
                    }
                }
            )
        })
    },

    // Delete style
    deleteStyle: (id) => {
        return new Promise((resolve, reject) => {
            db.run('DELETE FROM styles WHERE id = ?', [id], function (err) {
                if (err) {
                    reject(err)
                } else {
                    resolve({ deletedId: id, changes: this.changes })
                }
            })
        })
    },

    // Authenticate admin
    authenticateAdmin: (email, password) => {
        return new Promise((resolve, reject) => {
            db.get(
                'SELECT * FROM admin_users WHERE email = ?',
                [email],
                (err, row) => {
                    if (err) {
                        reject(err)
                    } else if (!row) {
                        resolve(null)
                    } else {
                        const bcrypt = require('bcrypt')
                        const isValid = bcrypt.compareSync(password, row.password)
                        resolve(isValid ? { id: row.id, email: row.email } : null)
                    }
                }
            )
        })
    }
}

module.exports = { db, dbOperations }