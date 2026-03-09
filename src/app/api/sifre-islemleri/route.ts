import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import crypto from "crypto";
import { connectMongoDB } from "../../../lib/mongodb";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { message: "Geçerli bir e-posta adresi girin." },
        { status: 400 }
      );
    }

    const db = await connectMongoDB();

    const user = await db.collection("users").findOne({ email });
    if (!user) {
      return NextResponse.json({
        message: "E-posta gönderildi. Gelen kutunuzu kontrol edin.",
      });
    }

    await db.collection("password_resets").deleteMany({ email });

    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 60 * 60 * 1000);

    await db.collection("password_resets").insertOne({
      email,
      token,
      expires,
      createdAt: new Date(),
    });

    const resetUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/sifre-yenile?token=${token}&email=${encodeURIComponent(email)}`;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: `"A-TAKASA" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Şifre Sıfırlama | A-TAKASA",
      html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#F5F0E8;font-family:Georgia,serif;">
  <div style="max-width:480px;margin:40px auto;background:white;border-radius:24px;overflow:hidden;">
    <div style="height:5px;background:linear-gradient(90deg,#2C5F2E,#C8A96E,#2C5F2E);"></div>
    <div style="padding:40px 36px;">
      <h1 style="font-size:28px;font-weight:900;color:#1A1A1A;margin:0 0 4px;">A-TAKASA</h1>
      <p style="color:#C8A96E;font-size:11px;letter-spacing:3px;text-transform:uppercase;margin:0 0 32px;">Takas Platformu</p>
      <h2 style="font-size:20px;font-weight:700;color:#1A1A1A;margin:0 0 12px;">Şifre Sıfırlama</h2>
      <p style="color:#6B6B6B;font-size:14px;line-height:1.7;margin:0 0 28px;">
        Bu link <strong>1 saat</strong> gecerlidir.
      </p>
      <a href="${resetUrl}" style="display:block;background:#2C5F2E;color:white;text-decoration:none;text-align:center;padding:14px 24px;border-radius:12px;font-weight:700;font-size:13px;letter-spacing:2px;text-transform:uppercase;margin-bottom:24px;">
        Sifremi Sifirla
      </a>
      <p style="color:#ABABAB;font-size:12px;margin:0;">
        Bu islemi siz yapmadıysanız gormezden gelebilirsiniz.
      </p>
    </div>
    <div style="padding:20px 36px;border-top:1px solid #F0EDE8;text-align:center;">
      <p style="color:#ABABAB;font-size:11px;margin:0;">2025 atakasa.com</p>
    </div>
  </div>
</body>
</html>`,
    });

    return NextResponse.json({
      message: "Sifre sifirlama baglantisi e-postaniza gonderildi.",
    });
  } catch (error) {
    console.error("Hata:", error);
    return NextResponse.json(
      { message: "Sunucu hatasi. Lutfen tekrar deneyin." },
      { status: 500 }
    );
  }
}
