import { NextResponse } from "next/server";
import crypto from "crypto";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "E-posta adresi gerekli." }, { status: 400 });
    }

    // ✅ Dinamik import — build sırasında mongoose/aws4 yüklenmez
    const mongoose = (await import("mongoose")).default;
    const UserModule = await import("../../../../models/User");
    const User = UserModule.default;

    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI as string);
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      // Güvenlik: kullanıcı yoksa da başarılı yanıt ver
      return NextResponse.json(
        { message: "Eğer bu e-posta kayıtlıysa sıfırlama bağlantısı gönderildi." },
        { status: 200 }
      );
    }

    // Token oluştur
    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = Date.now() + 3600000; // 1 saat
    await user.save();

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://atakasa.com";
    const resetUrl = `${baseUrl}/sifre-sifirla?token=${resetToken}`;

    // Mail gönder
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
        <div style="font-family:'DM Sans',Arial,sans-serif;background:#0f2540;padding:48px 32px;text-align:center;border-radius:16px;max-width:560px;margin:0 auto;">
          <div style="font-family:Georgia,serif;font-size:28px;font-weight:800;color:#ffffff;letter-spacing:-0.02em;margin-bottom:8px;">
            A-TAKASA<span style="color:#c9a84c;">.</span>
          </div>
          <p style="color:rgba(255,255,255,0.5);font-size:11px;letter-spacing:0.12em;text-transform:uppercase;margin-bottom:36px;">
            Güvenli Şifre Sıfırlama
          </p>
          <h2 style="color:#ffffff;font-size:20px;font-weight:700;margin-bottom:12px;">
            Şifre Sıfırlama Talebi
          </h2>
          <p style="color:rgba(255,255,255,0.6);font-size:14px;line-height:1.6;margin-bottom:32px;">
            Bu e-postayı siz talep etmediyseniz güvenle görmezden gelebilirsiniz.
            Bağlantı <strong>1 saat</strong> içinde geçerliliğini yitirecektir.
          </p>
          <a href="${resetUrl}"
            style="display:inline-block;background:#c9a84c;color:#0f2540;padding:14px 32px;
            text-decoration:none;border-radius:10px;font-weight:800;font-size:13px;
            letter-spacing:0.04em;text-transform:uppercase;">
            Şifremi Sıfırla →
          </a>
          <p style="color:rgba(255,255,255,0.3);font-size:11px;margin-top:32px;">
            Bağlantı çalışmıyorsa bu URL'yi tarayıcınıza kopyalayın:<br/>
            <span style="color:rgba(255,255,255,0.5);word-break:break-all;">${resetUrl}</span>
          </p>
        </div>
      `,
    });

    return NextResponse.json(
      { message: "Sıfırlama e-postası gönderildi." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Şifre sıfırlama hatası:", error);
    return NextResponse.json(
      { error: "İşlem sırasında bir hata oluştu." },
      { status: 500 }
    );
  }
}
