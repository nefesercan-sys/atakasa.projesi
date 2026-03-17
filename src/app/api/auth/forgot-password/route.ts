import { NextResponse } from "next/server";
import crypto from "crypto";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "E-posta adresi gerekli." }, { status: 400 });
    }

    const mongoose = (await import("mongoose")).default;
    const UserModule = await import("../../../../models/User");
    const User = UserModule.default;

    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI as string);
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return NextResponse.json(
        { message: "Eğer bu e-posta kayıtlıysa sıfırlama bağlantısı gönderildi." },
        { status: 200 }
      );
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = Date.now() + 3600000;
    await user.save();

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://atakasa.com";
    const resetUrl = `${baseUrl}/sifre-sifirla?token=${resetToken}`;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"A-TAKASA Güvenlik" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "A-TAKASA | Şifre Sıfırlama",
      html: `
        <div style="font-family:Arial,sans-serif;background:#0f2540;padding:48px 32px;text-align:center;border-radius:16px;max-width:560px;margin:0 auto;">
          <div style="font-size:28px;font-weight:800;color:#ffffff;margin-bottom:8px;">
            A-TAKASA<span style="color:#c9a84c;">.</span>
          </div>
          <h2 style="color:#ffffff;font-size:20px;margin-bottom:12px;">Şifre Sıfırlama</h2>
          <p style="color:rgba(255,255,255,0.6);font-size:14px;line-height:1.6;margin-bottom:32px;">
            Bağlantı <strong>1 saat</strong> geçerlidir.
          </p>
          <a href="${resetUrl}" style="display:inline-block;background:#c9a84c;color:#0f2540;padding:14px 32px;text-decoration:none;border-radius:10px;font-weight:800;font-size:13px;">
            Şifremi Sıfırla →
          </a>
        </div>
      `,
    });

    return NextResponse.json({ message: "Sıfırlama e-postası gönderildi." }, { status: 200 });
  } catch (error) {
    console.error("Şifre sıfırlama hatası:", error);
    return NextResponse.json({ error: "İşlem sırasında bir hata oluştu." }, { status: 500 });
  }
}
