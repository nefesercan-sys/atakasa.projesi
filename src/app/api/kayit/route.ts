import bcrypt from "bcryptjs";
import { connectMongoDB } from "@/lib/mongodb";
import User from "@/models/User";
import { hata, tamam } from "@/lib/yanit";
import { hizSiniri, istemciIp } from "@/lib/ratelimit";

const EPOSTA = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function POST(req: Request) {
  if (!hizSiniri(`kayit:${istemciIp(req)}`, 6, 60 * 60_000)) return hata("Çok fazla deneme. Bir süre sonra tekrar deneyin.", 429);
  const b = await req.json().catch(() => null);
  const name = String(b?.name || "").trim();
  const email = String(b?.email || "").trim().toLowerCase();
  const password = String(b?.password || "");
  const telefon = String(b?.telefon || "").replace(/[^\d+]/g, "").slice(0, 16);

  if (name.length < 2 || name.length > 60) return hata("Adınızı yazın (2-60 karakter).");
  if (!EPOSTA.test(email) || email.length > 120) return hata("Geçerli bir e-posta yazın.");
  if (password.length < 8 || password.length > 100) return hata("Şifre en az 8 karakter olmalı.");

  await connectMongoDB();
  if (await User.exists({ email })) return hata("Bu e-posta ile zaten üyelik var. Giriş yapabilirsiniz.", 409);
  await User.create({ name, email, telefon: telefon || undefined, password: await bcrypt.hash(password, 10) });
  return tamam({ mesaj: "Üyelik oluşturuldu." }, 201);
}
