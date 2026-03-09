import { NextResponse } from "next/server";
// Yol hatası düzeltildi: src/lib/mongodb'ye ulaşmak için 3 klasör yukarı çıkıyoruz
import { connectMongoDB } from "../../../lib/mongodb";
import User from "../../../models/User";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import nodemailer from "nodemailer";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    await connectMongoDB();
    const { email } = await req.json();

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return NextResponse.json({ error: "Siber ağda bu ajan bulunamadı." }, { status: 404 });
    }

    // Güvenli Jeton üretimi
    const resetToken = crypto.randomBytes(32).toString('hex');
    const tokenSuresi = Date.now() + 3600000; // 1 saat geçerli

    // Kullanıcı modelindeki gerçek alanlara (resetPasswordToken) kayıt yapıyoruz
    await User.updateOne(
      { _id: user._id },
      { 
        $set: { 
          resetPasswordToken: resetToken, 
          resetPasswordExpire: tokenSuresi 
        } 
      }
    );

    const baseUrl = process.env.NEXTAUTH_URL || "https://atakasa-projesi.vercel.app";
    const resetLink = `${baseUrl}/sifre-yenile?token=${resetToken}`;

    // 🚀 GERÇEK MAİL MOTORU (Link artık sadece buraya gider)
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS, 
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "A-TAKASA | Güvenli Şifre Sıfırlama Bağlantısı",
      html: `
        <div style="background-color: #050505; color: white; padding: 40px; text-align: center; font-family: sans-serif; border: 1px solid #00f260;">
          <h1 style="color: #00f260; font-style: italic;">A-TAKASA.</h1>
          <p>Şifrenizi sıfırlamak için güvenli bir sinyal aldık.</p>
          <div style="margin: 30px 0;">
            <a href="${resetLink}" style="background-color: #00f260; color: black; padding: 15px 25px; text-decoration: none; border-radius: 10px; font-weight: bold;">ŞİFREYİ YENİLE</a>
          </div>
          <p style="color: #666; font-size: 11px;">Bu bağlantı 1 saat içinde imha edilecektir.</p>
        </div>
      `
    });

    return NextResponse.json({ 
      message: "Kurtarma sinyali mail adresinize güvenli bir şekilde fırlatıldı! ⚡" 
    }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ error: "Sinyal gönderilemedi: " + error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    await connectMongoDB();
    const { token, yeniSifre } = await req.json();

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return NextResponse.json({ error: "Geçersiz veya süresi dolmuş sinyal!" }, { status: 400 });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(yeniSifre, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    return NextResponse.json({ message: "⚡ ŞİFRE BAŞARIYLA MÜHÜRLENDİ!" }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: "Mühürleme başarısız." }, { status: 500 });
  }
}
