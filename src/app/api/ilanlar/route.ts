import { connectMongoDB } from "@/lib/mongodb";
import Varlik from "@/models/Varlik";
import { tamam } from "@/lib/yanit";

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
