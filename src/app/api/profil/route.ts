import { connectMongoDB } from "@/lib/mongodb";
import User from "@/models/User";
import { oturumAl } from "@/lib/oturum";
import { hata, tamam } from "@/lib/yanit";

export async function GET() {
  const o = await oturumAl();
  if (!o) return hata("Giriş yapın.", 401);
  await connectMongoDB();
  const u = await User.findById(o.id).select("name email telefon sehir tamamlananTakas").lean();
  return tamam({ profil: u });
}

export async function PATCH(req: Request) {
  const o = await oturumAl();
  if (!o) return hata("Giriş yapın.", 401);
  const b = await req.json().catch(() => null);
  const guncel: Record<string, string> = {};
  if (b?.name !== undefined) {
    const n = String(b.name).trim();
    if (n.length < 2 || n.length > 60) return hata("Ad 2-60 karakter olmalı.");
    guncel.name = n;
  }
  if (b?.telefon !== undefined) guncel.telefon = String(b.telefon).replace(/[^\d+]/g, "").slice(0, 16);
  if (b?.sehir !== undefined) guncel.sehir = String(b.sehir).trim().slice(0, 40);
  await connectMongoDB();
  await User.updateOne({ _id: o.id }, guncel);
  return tamam();
}
