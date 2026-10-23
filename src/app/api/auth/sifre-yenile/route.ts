import crypto from "crypto";
import bcrypt from "bcryptjs";
import { connectMongoDB } from "@/lib/mongodb";
import User from "@/models/User";
import { tamam, hata } from "@/lib/yanit";
import { hizSiniri, istemciIp } from "@/lib/ratelimit";

export async function POST(req: Request) {
  if (!hizSiniri(`sifreyenile:${istemciIp(req)}`, 10, 60 * 60_000)) return hata("Çok fazla deneme.", 429);
  const b = await req.json().catch(() => null);
  const token = String(b?.token || "");
  const yeni = String(b?.yeniSifre || "");
  if (!token || yeni.length < 8 || yeni.length > 100) return hata("Şifre en az 8 karakter olmalı.");

  await connectMongoDB();
  const hash = crypto.createHash("sha256").update(token).digest("hex");
  const user = await User.findOne({ resetTokenHash: hash, resetTokenBitis: { $gt: new Date() } }).select("+resetTokenHash +resetTokenBitis +password");
  if (!user) return hata("Bağlantı geçersiz veya süresi dolmuş. Yeniden isteyin.", 400);

  user.password = await bcrypt.hash(yeni, 10);
  user.resetTokenHash = undefined;
  user.resetTokenBitis = undefined;
  await user.save();
  return tamam({ mesaj: "Şifreniz güncellendi. Giriş yapabilirsiniz." });
}
