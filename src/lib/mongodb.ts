import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI tanımlı değil!");
}

// Global cache - hot reload'da bağlantı kopmasın
const globalWithMongoose = global as typeof globalThis & {
  mongoose: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null };
};

if (!globalWithMongoose.mongoose) {
  globalWithMongoose.mongoose = { conn: null, promise: null };
}

export async function connectMongoDB() {
  // Zaten bağlıysa direkt dön
  if (globalWithMongoose.mongoose.conn) {
    return globalWithMongoose.mongoose.conn;
  }

  // Bağlantı devam ediyorsa bekle
  if (!globalWithMongoose.mongoose.promise) {
    globalWithMongoose.mongoose.promise = mongoose.connect(MONGODB_URI, {
      dbName: "atakasa_db", // ← atakasa'ya özel ayrı database
      bufferCommands: true, // ← true yapıldı, false yavaşlatıyordu
      maxPoolSize: 10,       // ← bağlantı havuzu
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 10000,
    });
  }

  try {
    globalWithMongoose.mongoose.conn = await globalWithMongoose.mongoose.promise;
    console.log("MongoDB Bağlantısı Aktif.");
    return globalWithMongoose.mongoose.conn;
  } catch (error) {
    globalWithMongoose.mongoose.promise = null; // hata olursa sıfırla
    console.error("MongoDB Bağlantı Hatası:", error);
    throw new Error("Veritabanına bağlanılamadı.");
  }
}
