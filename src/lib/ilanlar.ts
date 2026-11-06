import { connectMongoDB } from "@/lib/mongodb";
import Varlik from "@/models/Varlik";

const ALANLAR = "baslik slug kategori sehir resimler takasIstegi createdAt";
export type ListeIlan = { _id: string; baslik: string; slug: string; kategori: string; sehir: string; resimler: string[]; takasIstegi: string };

export async function sonIlanlar(filtre: Record<string, string> = {}, limit = 24): Promise<ListeIlan[]> {
  try {
    await connectMongoDB();
    const l = await Varlik.find({ durum: "aktif", ...filtre }).sort({ createdAt: -1 }).limit(limit).select(ALANLAR).lean();
    return JSON.parse(JSON.stringify(l));
  } catch {
    return [];
  }
}

/** Ana sayfa sayaçları. Sayılar küçükken gösterilmez (boş site görünümünü önlemek için). */
export async function istatistik(): Promise<{ ilan: number; takas: number }> {
  try {
    await connectMongoDB();
    const [ilan, takas] = await Promise.all([
      Varlik.countDocuments({ durum: "aktif" }),
      (await import("@/models/Teklif")).default.countDocuments({ durum: "tamamlandi" }),
    ]);
    return { ilan, takas };
  } catch {
    return { ilan: 0, takas: 0 };
  }
}
