import type { MetadataRoute } from "next";
import { connectMongoDB } from "@/lib/mongodb";
import Varlik from "@/models/Varlik";
import { KATEGORILER } from "@/lib/kategoriler";
import { MUSAIT_FILTRE } from "@/lib/yardimci";

export const dynamic = "force-dynamic";
const SITE = "https://www.atakasa.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const statik: MetadataRoute.Sitemap = [
    { url: SITE, changeFrequency: "daily", priority: 1 },
    { url: `${SITE}/ilanlar`, changeFrequency: "hourly", priority: 0.9 },
    ...KATEGORILER.map((k) => ({ url: `${SITE}/ilanlar?kategori=${k.slug}`, changeFrequency: "daily" as const, priority: 0.6 })),
    { url: `${SITE}/sozlesme`, changeFrequency: "yearly", priority: 0.2 },
  ];
  try {
    await connectMongoDB();
    const l = await Varlik.find({ ...MUSAIT_FILTRE, slug: { $exists: true, $ne: "" } }).sort({ createdAt: -1 }).limit(5000).select("slug updatedAt").lean() as { slug: string; updatedAt?: Date }[];
    return [...statik, ...l.map((i) => ({ url: `${SITE}/varlik/${i.slug}`, lastModified: i.updatedAt, changeFrequency: "weekly" as const, priority: 0.7 }))];
  } catch { return statik; }
}
