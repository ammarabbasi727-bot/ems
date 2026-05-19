import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI as string;
if (!MONGODB_URI) throw new Error("MONGODB_URI is not set");

type Cached = { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null };
const g = global as unknown as { _mongoose?: Cached };
const cached: Cached = g._mongoose ?? { conn: null, promise: null };
g._mongoose = cached;

export async function dbConnect() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, { bufferCommands: false });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}
