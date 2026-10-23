import { connectMongoDB } from "@/lib/mongodb";
import Varlik from "@/models/Varlik";
import { oturumAl } from "@/lib/oturum";
import { hata, tamam } from "@/lib/yanit";
import { hizSiniri } from "@/lib/ratelimit";
import { KATEGORI_SLUGLARI } from "@/lib/kategoriler";
import { ILLER } from "@/lib/iller";
import { gecerliMedya, MAX_MEDYA } from "@/lib/medya";
import { ilanSlug } from "@/lib/slug";

const kacis = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Herkese açık liste: ?kategori= &sehir= &q= &sayfa=
export async function GET(req: Request) {
  const u = new URL(req.url).searchParams;
  const sorgu: Record<string, unknown> = { durum: "aktif" };
  if (u.get("kategori")) sorgu.kategori = u.get("kategori");
  if (u.get("sehir")) sorgu.sehir = u.get("sehir");
  const q = (u.get("q") || "").trim().slice(0, 60);
  if (q) sorgu.baslik = { $regex: kacis(q), $options: "i" };
  const sayfa = Math.max(1, parseInt(u.get("sayfa") || "1", 10) || 1);
  const LIMIT = 24;

  await connectMongoDB();
  const [liste, toplam] = await Promise.all([
    Varlik.find(sorgu).sort({ createdAt: -1 }).skip((sayfa - 1) * LIMIT).limit(LIMIT)
      .select("baslik slug kategori sehir resimler takasIstegi createdAt").lean(),
    Varlik.countDocuments(sorgu),
  ]);
  return tamam({ ilanlar: liste, toplam, sayfa, sayfaSayisi: Math.ceil(toplam / LIMIT) });
}

export async function POST(req: Request) {
  const o = await oturumAl();
  if (!o) return hata("İlan vermek için giriş yapın.", 401);
  if (!hizSiniri(`ilan:${o.id}`, 20, 60 * 60_000)) return hata("Saatte en fazla 20 ilan verebilirsiniz.", 429);

  const b = await req.json().catch(() => null);
  const baslik = String(b?.baslik || "").trim();
  const aciklama = String(b?.aciklama || "").trim();
  const kategori = String(b?.kategori || "");
  const sehir = String(b?.sehir || "");
  const ilce = String(b?.ilce || "").trim().slice(0, 40);
  const takasIstegi = String(b?.takasIstegi || "").trim();
  const resimler: unknown[] = Array.isArray(b?.resimler) ? b.resimler : [];

  if (baslik.length < 3 || baslik.length > 100) return hata("Başlık 3-100 karakter olmalı.");
  if (aciklama.length > 2000) return hata("Açıklama en fazla 2000 karakter.");
  if (takasIstegi.length > 300) return hata("'Ne istiyorum' alanı en fazla 300 karakter.");
  if (!KATEGORI_SLUGLARI.includes(kategori)) return hata("Kategori seçin.");
  if (!(ILLER as readonly string[]).includes(sehir)) return hata("Şehir seçin.");
  if (resimler.length < 1 || resimler.length > MAX_MEDYA) return hata(`En az 1, en fazla ${MAX_MEDYA} fotoğraf/video ekleyin.`);
  if (!resimler.every(gecerliMedya)) return hata("Geçersiz medya adresi.");

  await connectMongoDB();
  const ilan = await Varlik.create({ baslik, aciklama, kategori, sehir, ilce, takasIstegi, resimler, satici: o.id, slug: ilanSlug(baslik) });
  return tamam({ id: String(ilan._id), slug: ilan.slug }, 201);
}
