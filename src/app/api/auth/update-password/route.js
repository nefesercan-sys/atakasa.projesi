import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '@/models/User'; 

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

    if (!token || !newPassword) {
      return Response.json({ error: "Eksik sinyal." }, { status: 400 });
    }

    await connectDB();

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpire: { $gt: Date.now() }, 
    });

    if (!user) {
      return Response.json({ error: "Sıfırlama anahtarı geçersiz veya süresi dolmuş." }, { status: 400 });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    
    // İşlem bitince güvenlik için anahtarları imha et
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    return Response.json({ message: "Şifre başarıyla güncellendi." }, { status: 200 });

  } catch (error) {
    console.error("Şifre güncelleme hatası:", error);
    return Response.json({ error: "Siber ağda bir hata oluştu." }, { status: 500 });
  }
}
