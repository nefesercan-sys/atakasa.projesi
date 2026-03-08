import mongoose from 'mongoose';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
// VERCEL'İ ÇÖKERTEN HATA BURADA GİDERİLDİ (Göreceli Yol)
import User from '../../../../models/User'; 

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
    const { email } = await req.json();

    if (!email) return Response.json({ error: "E-posta adresi gerekli." }, { status: 400 });

    await connectDB();

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return Response.json({ error: "Bu e-posta adresiyle kayıtlı bir hesap bulunamadı." }, { status: 404 });

    // Rastgele token oluştur ve veritabanına kaydet
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = Date.now() + 3600000; // 1 Saat
    await user.save();

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const resetUrl = `${baseUrl}/sifre-sifirla?token=${resetToken}`;

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"A-TAKASA Güvenlik" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: 'A-TAKASA | Şifre Sıfırlama',
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #050505; color: #ffffff; padding: 40px; text-align: center; border-radius: 10px;">
          <h1 style="color: #00f260; font-style: italic; text-transform: uppercase;">A-TAKASA.</h1>
          <h2 style="color: #ffffff;">Şifre Sıfırlama Talebi</h2>
          <p style="color: #888888; font-size: 14px; margin-bottom: 30px;">
            Profil hesabı şifresini sıfırlamak için bir talep aldık. Aşağıdaki butona tıklayarak yeni şifrenizi belirleyebilirsiniz.
          </p>
          <a href="${resetUrl}" style="background-color: #00f260; color: #000000; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px; text-transform: uppercase; letter-spacing: 2px;">
            Şifreyi Sıfırla ⚡
          </a>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return Response.json({ message: "Sıfırlama e-postası gönderildi." }, { status: 200 });

  } catch (error) {
    console.error("Şifremi unuttum hatası:", error);
    return Response.json({ error: "Sinyal gönderilemedi." }, { status: 500 });
  }
}
