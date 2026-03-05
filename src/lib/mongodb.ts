import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error("SİBER HATA: Lütfen .env.local dosyasına MONGODB_URI ekleyin!");
}

// Global önbellek (Cache) kullanarak Vercel'in sürekli yeni bağlantı açıp sistemi yormasını engelliyoruz
let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

export const connectMongoDB = async () => {
  if (cached.conn) return cached.conn;
  
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI).then((mongoose) => {
      console.log("⚡ SİBER BAŞARI: MongoDB Motoru Ateşlendi!");
      return mongoose;
    });
  }
  
  cached.conn = await cached.promise;
  return cached.conn;
};
