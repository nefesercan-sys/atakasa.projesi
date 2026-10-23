import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { KATEGORILER } from "@/lib/kategoriler";
import { ILLER, slugla } from "@/lib/iller";
import { connectMongoDB } from "@/lib/mongodb";
import Varlik from "@/models/Varlik";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const sabit: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/nasil-calisir`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/kayit`, changeFrequency: "monthly", priority: 0.4 },
    ...KATEGORILER.map((k) => ({ url: `${SITE_URL}/kategori/${k.slug}`, changeFrequency: "daily" as const, priority: 0.7 })),
    ...ILLER.map((i) => ({ url: `${SITE_URL}/sehir/${slugla(i)}`, changeFrequency: "daily" as const, priority: 0.5 })),
  ];
  try {
    await connectMongoDB();
    const l = await Varlik.find({ durum: "aktif" }).sort({ createdAt: -1 }).limit(5000).select("slug updatedAt").lean();
    return [...sabit, ...l.filter((x) => x.slug).map((x) => ({ url: `${SITE_URL}/ilan/${x.slug}`, lastModified: x.updatedAt, priority: 0.6 }))];
  } catch {
    return sabit;
  }
}
