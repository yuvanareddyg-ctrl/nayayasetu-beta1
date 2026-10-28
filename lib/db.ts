import mongoose from "mongoose";

const globalForMongoose = global as unknown as {
  mongooseConnection?: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null };
};

const cached = globalForMongoose.mongooseConnection ?? { conn: null, promise: null };
globalForMongoose.mongooseConnection = cached;

export const hasMongoUri = () => Boolean(process.env.MONGODB_URI);

export async function connectToDatabase() {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is not configured.");
  }
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(process.env.MONGODB_URI, { bufferCommands: false });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}
