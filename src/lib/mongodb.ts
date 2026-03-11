import mongoose from "mongoose";

export const connectMongoDB = async () => {
  try {
    // 1. Eğer sistem zaten sağlıklı bir şekilde bağlıysa doğrudan geç
    if (mongoose.connection.readyState === 1) {
      return;
    }

    // 2. Bağlantı yoksa veya Vercel uyku modundan uyanıyorsa zorla bağlan
    await mongoose.connect(process.env.MONGODB_URI as string, {
      serverSelectionTimeoutMS: 5000, // 5 saniyeden fazla bekleme
      bufferCommands: false, // 🚀 İŞTE SİBER KİLİT: Cevap yoksa sonsuza kadar beklemesini engeller!
    });
    
    console.log("MongoDB Siber Tüneli Aktif.");
  } catch (error) {
    console.error("MongoDB Tünel Hatası:", error);
    throw new Error("Veritabanı bağlantısı koptu."); // Donup kalmak yerine hatayı bildir
  }
};
