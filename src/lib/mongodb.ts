import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error("SİBER UYARI: MONGODB_URI ortam değişkeni bulunamadı!");
}

// Global scope'da mongoose objesini saklayarak bağlantı havuzunu (connection pool) koruyoruz.
let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

export const connectMongoDB = async () => {
  // Eğer daha önceden açılmış sağlam bir kapı (bağlantı) varsa, direkt onu kullan (Sıfır bekleme!)
  if (cached.conn) {
    return cached.conn;
  }

  // Eğer kapı açılmaya başlanmış ama henüz tam açılmamışsa, o işlemi bekle
  if (!cached.promise) {
    const opts = {
      bufferCommands: false, // Hız için buffer'ı kapat
      maxPoolSize: 10,       // Aynı anda 10 otoyol şeridi aç
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
};
