import crypto from "crypto";
import nodemailer from "nodemailer";
import { connectMongoDB } from "@/lib/mongodb";
import User from "@/models/User";
import { hata, tamam, temizMetin } from "@/lib/yardimci";

export const dynamic = "force-dynamic";
const GENEL = "Bu e-posta kayıtlıysa sıfırlama bağlantısı gönderildi.";

export async function POST(req: Request) {
  try {
    const b = await req.json().catch(() => ({}));
    const email = temizMetin(b.email, 120).toLowerCase();
    if (!email) return hata("E-posta gerekli.");
    await connectMongoDB();
    const user = await User.findOne({ email });
    if (!user) return tamam({ message: GENEL }); // hesap varlığı sızdırılmaz

    const token = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = crypto.createHash("sha256").update(token).digest("hex"); // veritabanında yalnızca özet
    user.resetPasswordExpire = new Date(Date.now() + 60 * 60 * 1000);
    await user.save();

    const base = process.env.NEXT_PUBLIC_SITE_URL || "https://www.atakasa.com";
    const url = `${base}/sifre-sifirla?token=${token}`;
    const transporter = nodemailer.createTransport({ service: "gmail", auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS } });
    await transporter.sendMail({
      from: `"A-TAKASA" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "A-TAKASA | Şifre sıfırlama",
      html: `<div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:24px"><h2>Şifre sıfırlama</h2><p>Şifrenizi yenilemek için aşağıdaki düğmeye tıklayın. Bağlantı <b>1 saat</b> geçerlidir. Bu isteği siz yapmadıysanız bu e-postayı yok sayın.</p><p><a href="${url}" style="display:inline-block;background:#0f766e;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none">Şifremi yenile</a></p></div>`,
    });
    return tamam({ message: GENEL });
  } catch (e) {
    console.error("forgot-password:", e);
    return hata("İşlem sırasında bir hata oluştu.", 500);
  }
}
