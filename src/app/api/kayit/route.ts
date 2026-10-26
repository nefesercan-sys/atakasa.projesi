import { connectMongoDB } from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { hata, tamam, temizMetin } from "@/lib/yardimci";

export const dynamic = "force-dynamic";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function POST(req: Request) {
  try {
    const b = await req.json().catch(() => ({}));
    const name = temizMetin(b.name, 80);
    const email = temizMetin(b.email, 120).toLowerCase();
    const password = typeof b.password === "string" ? b.password : "";
    const telefon = temizMetin(b.telefon, 20).replace(/[^\d+ ]/g, "");
    if (name.length < 2) return hata("Adınızı yazın.");
    if (!EMAIL_RE.test(email)) return hata("Geçerli bir e-posta yazın.");
    if (password.length < 8 || password.length > 100) return hata("Şifre en az 8 karakter olmalı.");
    await connectMongoDB();
    if (await User.findOne({ email })) return hata("Bu e-posta ile zaten üyelik var. Giriş yapın.", 409);
    await User.create({ name, email, telefon: telefon || undefined, password: await bcrypt.hash(password, 10) });
    return tamam({ message: "Üyelik oluşturuldu." }, 201);
  } catch (e) {
    console.error("kayit:", e);
    return hata("Kayıt yapılamadı, tekrar deneyin.", 500);
  }
}
