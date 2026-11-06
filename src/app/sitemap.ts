import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { REHBER } from "@/lib/rehber";
import { KATEGORILER } from "@/lib/kategoriler";
import { ILLER, slugla } from "@/lib/iller";
import { connectMongoDB } from "@/lib/mongodb";
import Varlik from "@/models/Varlik";
import { SP_LANGS, spPath } from "@/lib/sineklik-panjur";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const sabit: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/takas-rehberi`, changeFrequency: "weekly" as const, priority: 0.7 },
    ...REHBER.map((r) => ({ url: `${SITE_URL}/takas-rehberi/${r.slug}`, changeFrequency: "monthly" as const, priority: 0.7 })),
    ...SP_LANGS.map((l: string) => ({ url: `${SITE_URL}${spPath(l)}`, changeFrequency: "monthly" as const, priority: 0.6 })),
  ];
  try {
    await connectMongoDB();
    // İlanı olmayan kategori/şehir sayfaları noindex olduğu için sitemap'e girmez.
    const dolu = (await Varlik.aggregate([{ $match: { durum: "aktif" } }, { $group: { _id: null, k: { $addToSet: "$kategori" }, s: { $addToSet: "$sehir" } } }]))[0] || { k: [], s: [] };
    const kSet = new Set<string>(dolu.k);
    const sSet = new Set<string>(dolu.s);
    sabit.push(
      ...KATEGORILER.filter((k) => kSet.has(k.slug)).map((k) => ({ url: `${SITE_URL}/kategori/${k.slug}`, changeFrequency: "daily" as const, priority: 0.7 })),
      ...ILLER.filter((i) => sSet.has(i)).map((i) => ({ url: `${SITE_URL}/sehir/${slugla(i)}`, changeFrequency: "daily" as const, priority: 0.5 })),
    );
    const l = await Varlik.find({ durum: "aktif" }).sort({ createdAt: -1 }).limit(5000).select("slug updatedAt").lean();
    return [...sabit, ...l.filter((x) => x.slug).map((x) => ({ url: `${SITE_URL}/ilan/${x.slug}`, lastModified: x.updatedAt, priority: 0.6 }))];
  } catch {
    return sabit;
  }
}
