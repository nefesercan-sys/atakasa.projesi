import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
// Kendi User modelinin yolunu buraya göre düzenle (örnek: import User from '@/models/User')
import User from '@/models/User'; 

// Veritabanı bağlantı fonksiyonu
const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  try {
    await mongoose.connect(process.env.MONGODB_URI);
  } catch (err) {
    console.error("Veritabanı bağlantı hatası:", err);
  }
};

export async function POST(req) {
  try {
    const { token, newPassword } = await req.json();

    // 1. Gelen verileri kontrol et
    if (!token || !newPassword) {
      return Response.json({ error: "Eksik sinyal: Token veya şifre bulunamadı." }, { status: 400 });
    }

    await connectDB();

    // 2. Token ile eşleşen ve süresi dolmamış kullanıcıyı bul
    // (Veritabanında resetPasswordToken ve resetPasswordExpire alanları olduğunu varsayıyoruz)
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpire: { $gt: Date.now() }, // Şimdiki zamandan daha ileri bir son kullanma tarihi olmalı
    });

    if (!user) {
      return Response.json({ error: "Sıfırlama anahtarı geçersiz veya süresi dolmuş." }, { status: 400 });
    }

    // 3. Yeni şifreyi güçlü bir şekilde şifrele (Hash)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // 4. Kullanıcının bilgilerini güncelle ve token'ı imha et (Güvenlik için)
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    return Response.json({ message: "Şifre başarıyla güncellendi." }, { status: 200 });

  } catch (error) {
    console.error("Şifre güncelleme hatası:", error);
    return Response.json({ error: "Siber ağda bir hata oluştu, lütfen tekrar deneyin." }, { status: 500 });
  }
}
