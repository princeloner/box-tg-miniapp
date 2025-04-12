import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ton_cases';

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env');
}

declare global {
  var mongoose: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  };
}

let cached = global.mongoose || { conn: null, promise: null };

async function connectDB() {
  if (cached.conn) {
    console.log('Using cached connection');
    return cached.conn;
  }

  console.log('Creating new connection');

  try {
    cached.promise = mongoose.connect(MONGODB_URI);
    cached.conn = await cached.promise;
    
    // Сохраняем соединение в global
    global.mongoose = cached;
    
    console.log('MongoDB connected successfully');
    return cached.conn;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    cached.promise = null;
    throw error;
  }
}

export default connectDB; 