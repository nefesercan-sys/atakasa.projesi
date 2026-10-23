import crypto from "crypto";
import nodemailer from "nodemailer";
import { connectMongoDB } from "@/lib/mongodb";
import User from "@/models/User";
import { tamam, hata } from "@/lib/yanit";
import { hizSiniri, istemciIp } from "@/lib/ratelimit";
import { SITE_URL } from "@/lib/site";

// Hesap var/yok bilgisi sızdırılmaz: her durumda aynı cevap döner.
export async function POST(req: Request) {
  if (!hizSiniri(`sifre:${istemciIp(req)}`, 5, 60 * 60_000)) return hata("Çok fazla deneme. Bir süre sonra tekrar deneyin.", 429);
  const b = await req.json().catch(() => null);
  const email = String(b?.email || "").trim().toLowerCase();
  const cevap = { mesaj: "Bu e-posta ile bir hesap varsa, şifre sıfırlama bağlantısı gönderildi." };
  if (!email) return tamam(cevap);

  await connectMongoDB();
  const user = await User.findOne({ email });
  if (!user) return tamam(cevap);

  const token = crypto.randomBytes(32).toString("hex");
  user.resetTokenHash = crypto.createHash("sha256").update(token).digest("hex");
  user.resetTokenBitis = new Date(Date.now() + 60 * 60_000);
  await user.save();

  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    try {
      const tr = nodemailer.createTransport({ service: "gmail", auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS } });
      const link = `${SITE_URL}/sifre-sifirla?token=${token}`;
      await tr.sendMail({
        from: `"A-Takasa" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: "A-Takasa | Şifre sıfırlama",
        html: `<p>Merhaba ${user.name.replace(/[<>]/g, "")},</p><p>Şifrenizi sıfırlamak için bağlantıya tıklayın (1 saat geçerli):</p><p><a href="${link}">${link}</a></p><p>Bu isteği siz yapmadıysanız bu e-postayı yok sayın.</p>`,
      });
    } catch (e) {
      console.error("Şifre e-postası gönderilemedi:", e);
    }
  }
  return tamam(cevap);
}
