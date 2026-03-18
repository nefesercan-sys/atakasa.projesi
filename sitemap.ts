import { MetadataRoute } from "next";

export const dynamic = "force-dynamic";
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = "https://atakasa.com";

  const staticPages: MetadataRoute.Sitemap = [
    { url: base, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${base}/kesfet`, lastModified: new Date(), changeFrequency: "hourly", priority: 0.9 },
    { url: `${base}/ilan-ver`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/kategori/takas`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    { url: `${base}/kategori/ikinci-el`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    { url: `${base}/kategori/urun-satis`, lastModified: new Date(), changeFrequency: "daily", priority: 0.7 },
    { url: `${base}/kategori/hizmet`, lastModified: new Date(), changeFrequency: "daily", priority: 0.7 },
    { url: `${base}/kategori/kiralama`, lastModified: new Date(), changeFrequency: "daily", priority: 0.7 },
    { url: `${base}/kategori/moda`, lastModified: new Date(), changeFrequency: "daily", priority: 0.7 },
    { url: `${base}/kategori/antika`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.6 },
    { url: `${base}/kategori/sanat`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.6 },
    { url: `${base}/kategori/petshop`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.6 },
    { url: `${base}/kategori/kitap`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.6 },
    { url: `${base}/kategori/egitim`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.6 },
    { url: `${base}/kategori/oyuncak`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.6 },
    { url: `${base}/kategori/dogal`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.5 },
    { url: `${base}/kategori/bakim`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.5 },
    { url: `${base}/kategori/bagis`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.5 },
    { url: `${base}/kategori/rezervasyon`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.5 },
  ];

  let varlikPages: MetadataRoute.Sitemap = [];
  try {
    const res = await fetch(`${base}/api/varliklar?limit=1000&durum=aktif`, {
      next: { revalidate: 3600 },
    });
    if (res.ok) {
      const data = await res.json();
      const varliklar = Array.isArray(data) ? data : (data?.ilanlar || data?.data || []);
      varlikPages = varliklar.map((v: any) => ({
        url: `${base}/varlik/${v._id}`,
        lastModified: new Date(v.updatedAt || v.createdAt || Date.now()),
        changeFrequency: "weekly" as const,
        priority: 0.6,
      }));
    }
  } catch {}

  return [...staticPages, ...varlikPages];
}
