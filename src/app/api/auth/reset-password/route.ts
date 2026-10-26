import crypto from "crypto";
import bcrypt from "bcryptjs";
import { connectMongoDB } from "@/lib/mongodb";
import User from "@/models/User";
import { hata, tamam } from "@/lib/yardimci";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const b = await req.json().catch(() => ({}));
    const token = typeof b.token === "string" ? b.token : "";
    const password = typeof b.password === "string" ? b.password : "";
    if (!/^[a-f0-9]{64}$/.test(token)) return hata("Bağlantı geçersiz.");
    if (password.length < 8 || password.length > 100) return hata("Şifre en az 8 karakter olmalı.");
    await connectMongoDB();
    const ozet = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({ resetPasswordToken: ozet, resetPasswordExpire: { $gt: new Date() } });
    if (!user) return hata("Bağlantı geçersiz veya süresi dolmuş.", 400);
    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    return tamam({ message: "Şifreniz güncellendi." });
  } catch (e) {
    console.error("reset-password:", e);
    return hata("İşlem sırasında bir hata oluştu.", 500);
  }
}
