const admin = require('firebase-admin')

// Initialize Firebase Admin with Application Default Credentials
let db = null
try {
  // For development, we'll use the Firebase client SDK instead of admin SDK
  console.log('🔥 Using Firebase client SDK for development')
  console.log('📋 Project ID:', process.env.FIREBASE_PROJECT_ID)

  // We'll use mock data for now and implement proper Firebase later
  db = null
} catch (error) {
  console.log('⚠️ Firebase initialization failed, using mock data:', error.message)
}
const mockStyles = [
  {
    id: '1',
    title: 'Royal Agbada',
    category: 'Traditional',
    imageURL: 'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=400&h=500&fit=crop',
    description: 'Elegant traditional agbada with intricate embroidery',
    tags: ['Traditional', 'Formal', 'Embroidery'],
    featured: true,
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    title: 'Business Suit',
    category: 'Formal',
    imageURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop',
    description: 'Sharp tailored suit perfect for business meetings',
    tags: ['Business', 'Formal', 'Modern'],
    featured: true,
    createdAt: new Date().toISOString()
  },
  {
    id: '3',
    title: 'Evening Gown',
    category: 'Evening',
    imageURL: 'https://images.unsplash.com/photo-1566479179817-c0b5b4b4b1e5?w=400&h=500&fit=crop',
    description: 'Stunning evening gown for special occasions',
    tags: ['Evening', 'Formal', 'Elegant'],
    featured: false,
    createdAt: new Date().toISOString()
  }
]

const getAllStyles = async () => {
  try {
    if (db) {
      const snapshot = await db.collection('styles').orderBy('createdAt', 'desc').get()
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    }

    // Fallback to mock data if Firebase not configured
    console.log('Using mock data - Firebase not configured')
    return mockStyles
  } catch (error) {
    console.error('Firebase getAllStyles error:', error)
    return mockStyles
  }
}

const getFirebaseStyles = async (query) => {
  try {
    if (db) {
      // Search by title, category, or tags
      const snapshot = await db.collection('styles')
        .where('tags', 'array-contains-any', [query.toLowerCase()])
        .get()

      let results = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))

      // Also search by title and category
      const titleSnapshot = await db.collection('styles')
        .where('title', '>=', query)
        .where('title', '<=', query + '\uf8ff')
        .get()

      const titleResults = titleSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))

      // Combine and dedupe results
      const allResults = [...results, ...titleResults]
      const uniqueResults = allResults.filter((item, index, self) =>
        index === self.findIndex(t => t.id === item.id)
      )

      return uniqueResults
    }

    // Fallback to mock data search
    const filteredStyles = mockStyles.filter(style =>
      style.title.toLowerCase().includes(query.toLowerCase()) ||
      style.category.toLowerCase().includes(query.toLowerCase()) ||
      style.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
    )

    return filteredStyles
  } catch (error) {
    console.error('Firebase search error:', error)
    return []
  }
}

const createStyleInFirebase = async (styleData) => {
  try {
    if (db) {
      const docRef = await db.collection('styles').add({
        ...styleData,
        tags: styleData.tags || [],
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      })

      const newDoc = await docRef.get()
      return { id: newDoc.id, ...newDoc.data() }
    }

    // Fallback to mock data
    const newStyle = {
      id: Date.now().toString(),
      ...styleData,
      createdAt: new Date().toISOString()
    }
    mockStyles.push(newStyle)
    return newStyle
  } catch (error) {
    console.error('Firebase create error:', error)
    throw error
  }
}

const updateStyleInFirebase = async (id, updateData) => {
  try {
    // In production, this would update in Firestore
    // const db = admin.firestore()
    // await db.collection('styles').doc(id).update(updateData)
    // return { id, ...updateData }

    const index = mockStyles.findIndex(style => style.id === id)
    if (index !== -1) {
      mockStyles[index] = { ...mockStyles[index], ...updateData }
      return mockStyles[index]
    }
    throw new Error('Style not found')
  } catch (error) {
    console.error('Firebase update error:', error)
    throw error
  }
}

const deleteStyleFromFirebase = async (id) => {
  try {
    // In production, this would delete from Firestore
    // const db = admin.firestore()
    // await db.collection('styles').doc(id).delete()

    const index = mockStyles.findIndex(style => style.id === id)
    if (index !== -1) {
      mockStyles.splice(index, 1)
    }
  } catch (error) {
    console.error('Firebase delete error:', error)
    throw error
  }
}

module.exports = {
  getAllStyles,
  getFirebaseStyles,
  createStyleInFirebase,
  updateStyleInFirebase,
  deleteStyleFromFirebase
}