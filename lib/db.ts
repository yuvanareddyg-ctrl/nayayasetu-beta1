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
  if (cached.conn && cached.conn.connection.readyState === 1) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose
      .connect(process.env.MONGODB_URI, {
        bufferCommands: false,
        serverSelectionTimeoutMS: 2000,
      })
      .then((m) => {
        cached.conn = m;
        return m;
      })
      .catch((err) => {
        cached.promise = null;
        cached.conn = null;
        throw err;
      });
  }
  return cached.promise;
}
