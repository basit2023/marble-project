import "server-only";
import mongoose from "mongoose";
import { env } from "@/lib/env";

type ConnectionCache = { connection: typeof mongoose | null; promise: Promise<typeof mongoose> | null };
declare global {
  var mongooseCache: ConnectionCache | undefined;
}
const cache = globalThis.mongooseCache ??= { connection: null, promise: null };

export async function connectDB(): Promise<typeof mongoose> {
  if (cache.connection?.connection.readyState === 1) return cache.connection;
  // One in-flight connection per warm process, including concurrent requests.
  if (!cache.promise) {
    cache.promise = mongoose.connect(env.MONGODB_URI, {
      bufferCommands: false,
      maxPoolSize: 10,
      minPoolSize: 0,
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      autoIndex: process.env.NODE_ENV !== "production",
    });
  }
  try {
    cache.connection = await cache.promise;
    return cache.connection;
  } catch {
    cache.connection = null;
    // Do not expose driver errors, which can include connection details.
    throw new Error("Database connection unavailable.");
  } finally {
    cache.promise = null;
  }
}

