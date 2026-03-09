import { NextResponse } from "next/server";
import mongoose from "mongoose";
import crypto from "crypto";
import nodemailer from "nodemailer";
// User modelini kendi dizin yapımıza göre içeri alıyoruz
import User from "../../../../models/User"; 

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  await mongoose.connect(process.env.MONGODB_URI as string);
};

export async function POST(req: Request) {
  try {
    await connectDB();
    const { email } = await req.json();

    // 1. Kullanıcıyı siber ağda bul
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return NextResponse.json({ error: "Bu e-posta adresine ait bir ajan bulunamadı." }, { status: 404 });
    }

    // 2. Güvenli, rastgele bir şifre sıfırlama jetonu (token) üret
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = Date.now() + 3600000; // Jeton 1 saat (3600000 ms) geçerli olacak

    // 3. Jetonu veritabanına kaydet (SENİN BELİRLEDİĞİN YENİ DEĞİŞKEN İSİMLERİYLE)
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = resetTokenExpiry;
    await user.save();

    // 4. Nodemailer ile E-posta Gönderme Ayarları
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, // Senin gönderici mail adresin
        pass: process.env.EMAIL_PASS, // Gmail Uygulama Şifresi
      },
    });

    // Kullanıcının tıklayacağı şifre yenileme linki (Canlı site URL'ni alır)
    const baseUrl = process.env.NEXTAUTH_URL || "https://atakasa.com";
    const resetUrl = `${baseUrl}/sifre-yenile?token=${resetToken}`;

    // 5. Maili Ateşle
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "A-TAKASA | Siber Ağ Şifre Sıfırlama Talebi",
      html: `
        <div style="font-family: sans-serif; background-color: #050505; color: white; padding: 40px; text-align: center;">
          <h1 style="color: #00f260; font-style: italic; letter-spacing: 2px;">A-TAKASA.</h1>
          <p style="color: #ccc; margin-bottom: 30px;">Şifrenizi sıfırlamak için bir talep aldık. Aşağıdaki butona tıklayarak yeni şifrenizi mühürleyebilirsiniz.</p>
          <a href="${resetUrl}" style="display: inline-block; background-color: #00f260; color: black; padding: 15px 30px; text-decoration: none; font-weight: bold; border-radius: 10px; margin-top: 20px;">ŞİFREYİ YENİLE</a>
          <p style="color: #666; font-size: 12px; margin-top: 40px;">Bu talebi siz yapmadıysanız bu e-postayı görmezden gelebilirsiniz. Siber bağlantı 1 saat içinde kendi kendini imha edecektir.</p>
        </div>
      `,
    });

    return NextResponse.json({ message: "Sıfırlama sinyali e-posta adresinize gönderildi. ⚡" }, { status: 200 });

  } catch (error: any) {
    console.error("Mail gönderme hatası:", error);
    return NextResponse.json({ error: "Siber ağ arızası, mail fırlatılamadı." }, { status: 500 });
  }
}
