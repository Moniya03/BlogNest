const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

async function testConnection() {
  try {
    console.log('🔄 Testing MongoDB Atlas connection...');
    console.log('URI format:', process.env.MONGODB_URI?.replace(/\/\/.*@/, '//***:***@'));
    
    const client = new MongoClient(process.env.MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    
    await client.connect();
    console.log('✅ Connected to MongoDB Atlas successfully!');
    
    // Test database access
    const db = client.db('blognest');
    const result = await db.admin().ping();
    console.log('✅ Database ping successful:', result);
    
    // List collections
    const collections = await db.listCollections().toArray();
    console.log('📋 Available collections:', collections.map(c => c.name));
    
    await client.close();
    console.log('✅ Connection test completed successfully!');
  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
    if (error.code) {
      console.error('Error code:', error.code);
    }
  }
}

testConnection();