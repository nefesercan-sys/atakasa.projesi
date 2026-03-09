import { NextResponse } from "next/server";
// 🚀 Eksik olan kritik bağlantı burası:
import { connectMongoDB } from "../../../lib/mongodb";
import User from "../../../models/User";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import nodemailer from "nodemailer";

export const dynamic = "force-dynamic";

// 📩 POST: ŞİFRE SIFIRLAMA SİNYALİ ÜRET VE GÜVENLİ MAİL AT
export async function POST(req: Request) {
  try {
    await connectMongoDB();
    const { email } = await req.json();

    // 1. Kullanıcıyı siber ağda doğrula
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return NextResponse.json({ error: "Siber ağda bu ajan bulunamadı." }, { status: 404 });
    }

    // 2. Güvenli Jeton (Token) üretimi
    const resetToken = crypto.randomBytes(32).toString('hex');
    const tokenSuresi = Date.now() + 3600000; // 1 saat geçerli

    // 3. Jetonu veritabanına mühürle (Senin User.ts modelindeki isimlerle)
    await User.updateOne(
      { _id: user._id },
      { 
        $set: { 
          resetPasswordToken: resetToken, 
          resetPasswordExpire: tokenSuresi 
        } 
      }
    );

    // 4. E-Posta Motorunu Ayarla (Nodemailer)
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS, // Vercel'deki Gmail Uygulama Şifren
      },
    });

    const baseUrl = process.env.NEXTAUTH_URL || "https://atakasa-projesi.vercel.app";
    const resetLink = `${baseUrl}/sifre-yenile?token=${resetToken}`;

    // 5. MAİLİ ATEŞLE (Link artık ekranda değil, sadece mail kutusunda!)
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "A-TAKASA | Güvenli Şifre Sıfırlama Bağlantısı",
      html: `
        <div style="background-color: #050505; color: white; padding: 40px; text-align: center; font-family: sans-serif; border: 1px solid #00f260;">
          <h1 style="color: #00f260; font-style: italic;">A-TAKASA.</h1>
          <p style="color: #ccc;">Şifrenizi sıfırlamak için güvenli bir sinyal aldık.</p>
          <div style="margin: 30px 0;">
            <a href="${resetLink}" style="background-color: #00f260; color: black; padding: 15px 25px; text-decoration: none; border-radius: 10px; font-weight: bold; text-transform: uppercase;">Şifreyi Yenile</a>
          </div>
          <p style="color: #666; font-size: 11px;">Eğer bu talebi siz yapmadıysanız, sistem erişim kodlarını otomatik olarak imha edecektir.</p>
        </div>
      `
    });

    return NextResponse.json({ 
      message: "Kurtarma sinyali mail adresinize güvenli bir şekilde fırlatıldı! ⚡" 
    }, { status: 200 });

  } catch (error: any) {
    console.error("Siber Arıza:", error);
    return NextResponse.json({ error: "Sinyal koptu, mail gönderilemedi." }, { status: 500 });
  }
}

// 🔐 PUT: YENİ ŞİFREYİ VERİTABANINA MÜHÜRLE
export async function PUT(req: Request) {
  try {
    await connectMongoDB();
    const { token, yeniSifre } = await req.json();

    if (!token || !yeniSifre) {
      return NextResponse.json({ error: "Eksik veri sinyali." }, { status: 400 });
    }

    // Jetonu ve süresini kontrol et
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return NextResponse.json({ error: "Kurtarma sinyali geçersiz veya süresi dolmuş!" }, { status: 400 });
    }

    // Yeni şifreyi kriptola ve kaydet
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(yeniSifre, salt);
    
    // Jetonları temizle
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    
    await user.save();

    return NextResponse.json({ message: "⚡ YENİ ŞİFRE BAŞARIYLA MÜHÜRLENDİ!" }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: "Mühürleme başarısız oldu." }, { status: 500 });
  }
}
