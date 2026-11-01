// Hız sınırı: MongoDB'de atomik sayaç (sunucusuz ortamda tüm örnekler aynı sayacı paylaşır) + bellek içi yedek.
// Sayaç belgeleri TTL indeksiyle kendiliğinden silinir. Veritabanına ulaşılamazsa bellek içi sayaca düşer (hizmet durmaz).
import mongoose from "mongoose";
import { connectMongoDB } from "@/lib/mongodb";

const bellek = new Map<string, { n: number; son: number }>();

function bellekSiniri(anahtar: string, limit: number, pencereMs: number): boolean {
  const simdi = Date.now();
  if (bellek.size > 5000) for (const [k, v] of bellek) if (simdi > v.son) bellek.delete(k);
  const k = bellek.get(anahtar);
  if (!k || simdi > k.son) {
    bellek.set(anahtar, { n: 1, son: simdi + pencereMs });
    return true;
  }
  if (k.n >= limit) return false;
  k.n++;
  return true;
}

let indeksHazir: Promise<unknown> | null = null;

/** true = istek serbest, false = sınır aşıldı. */
export async function hizSiniri(anahtar: string, limit: number, pencereMs: number): Promise<boolean> {
  try {
    await connectMongoDB();
    const col = mongoose.connection.collection("hiz_sayaci");
    if (!indeksHazir) indeksHazir = col.createIndex({ bitis: 1 }, { expireAfterSeconds: 0 }).catch(() => null);
    await indeksHazir;
    const pencere = Math.floor(Date.now() / pencereMs);
    const r = await col.findOneAndUpdate(
      { _id: `${anahtar}:${pencere}` as unknown as mongoose.mongo.BSON.ObjectId },
      { $inc: { n: 1 }, $setOnInsert: { bitis: new Date((pencere + 1) * pencereMs + 60_000) } },
      { upsert: true, returnDocument: "after" }
    );
    const n = (r as { n?: number; value?: { n?: number } } | null)?.n ?? (r as { value?: { n?: number } } | null)?.value?.n ?? 1;
    return n <= limit;
  } catch {
    return bellekSiniri(anahtar, limit, pencereMs);
  }
}

export function istemciIp(req: Request | { headers?: Record<string, string | string[] | undefined> | Headers }): string {
  const h = (req as { headers?: unknown }).headers as Headers | Record<string, string | string[] | undefined> | undefined;
  const al = (ad: string): string => {
    if (!h) return "";
    if (typeof (h as Headers).get === "function") return (h as Headers).get(ad) || "";
    const v = (h as Record<string, string | string[] | undefined>)[ad];
    return Array.isArray(v) ? v[0] || "" : v || "";
  };
  return al("x-real-ip") || al("x-forwarded-for").split(",")[0]?.trim() || "bilinmiyor";
}
