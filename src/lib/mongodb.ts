import mongoose from "mongoose";

const MONGODB_URI = (process.env.ATAKASA_MONGODB_URI || process.env.MONGODB_URI) as string;

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI tanımlı değil!");
}

const globalWithMongoose = global as typeof globalThis & {
  mongoose: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null };
};

if (!globalWithMongoose.mongoose) {
  globalWithMongoose.mongoose = { conn: null, promise: null };
}

export async function connectMongoDB() {
  if (globalWithMongoose.mongoose.conn) {
    return globalWithMongoose.mongoose.conn;
  }

  if (!globalWithMongoose.mongoose.promise) {
    globalWithMongoose.mongoose.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 10000,
    });
  }

  try {
    globalWithMongoose.mongoose.conn = await globalWithMongoose.mongoose.promise;
    console.log("MongoDB Atakasa Bağlantısı Aktif.");
    return globalWithMongoose.mongoose.conn;
  } catch (error) {
    globalWithMongoose.mongoose.promise = null;
    console.error("MongoDB Bağlantı Hatası:", error);
    throw new Error("Veritabanına bağlanılamadı.");
  }
}
