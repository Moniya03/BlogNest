import { MongoClient } from 'mongodb';

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your Mongo URI to .env.local');
}

const uri = process.env.MONGODB_URI;
const options = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  const globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options);
    globalWithMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

// Initialize database indexes
export async function initializeIndexes() {
  try {
    console.log('🔧 Initializing database indexes...');
    const client = await clientPromise;
    const db = client.db('blognest');
    
    // Users collection indexes
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    await db.collection('users').createIndex({ username: 1 }, { sparse: true });
    await db.collection('users').createIndex({ createdAt: -1 });
    
    // Posts collection indexes
    await db.collection('posts').createIndex({ authorId: 1 });
    await db.collection('posts').createIndex({ status: 1 });
    await db.collection('posts').createIndex({ category: 1 });
    await db.collection('posts').createIndex({ createdAt: -1 });
    await db.collection('posts').createIndex({ 
      title: 'text', 
      description: 'text', 
      content: 'text' 
    });
    await db.collection('posts').createIndex({ tags: 1 });
    
    // Comments collection indexes
    await db.collection('comments').createIndex({ postId: 1 });
    await db.collection('comments').createIndex({ authorId: 1 });
    await db.collection('comments').createIndex({ createdAt: -1 });
    
    console.log('✅ Database indexes initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize database indexes:', error);
    // Don't throw here, just log the error
    // The connection should still work even if indexes fail
  }
}

// Test the connection
export async function testConnection() {
  try {
    const client = await clientPromise;
    await client.db('admin').command({ ping: 1 });
    console.log('✅ MongoDB connection test successful');
    return true;
  } catch (error) {
    console.error('❌ MongoDB connection test failed:', error);
    return false;
  }
}

// Initialize indexes after a delay to ensure connection is stable
setTimeout(() => {
  initializeIndexes();
}, 1000);

export default clientPromise; 