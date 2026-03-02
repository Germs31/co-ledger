import mongoose from 'mongoose';

const MONGO_URI = process.env.DATABASE_URL || 'mongodb://127.0.0.1:27017/track-it';

if (!MONGO_URI) {
  throw new Error('DATABASE_URL env var is required');
}

interface Cached {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

const globalWithMongoose = global as typeof global & { _mongoose?: Cached };

let cached = globalWithMongoose._mongoose;
if (!cached) {
  cached = globalWithMongoose._mongoose = { conn: null, promise: null };
}

export async function connectMongo() {
  if (cached!.conn) return cached!.conn;

  if (!cached!.promise) {
    cached!.promise = mongoose.connect(MONGO_URI, {
      dbName: new URL(MONGO_URI).pathname?.replace('/', '') || undefined
    });
  }

  cached!.conn = await cached!.promise;
  return cached!.conn;
}
