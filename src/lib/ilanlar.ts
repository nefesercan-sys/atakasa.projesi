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
