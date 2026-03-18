import { MetadataRoute } from "next";

export const dynamic = "force-dynamic";
export const revalidate = 3600;

const BASE = "https://atakasa.com";

const STATIK_SAYFALAR: MetadataRoute.Sitemap = [
  { url: BASE, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
  { url: `${BASE}/kesfet`, lastModified: new Date(), changeFrequency: "hourly", priority: 0.95 },
  { url: `${BASE}/ilan-ver`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
  { url: `${BASE}/sss`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
  // Kategori sayfaları
  { url: `${BASE}/kategori/takas`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
  { url: `${BASE}/kategori/ikinci-el`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
  { url: `${BASE}/kategori/urun-satis`, lastModified: new Date(), changeFrequency: "daily", priority: 0.85 },
  { url: `${BASE}/kategori/elektronik`, lastModified: new Date(), changeFrequency: "daily", priority: 0.85 },
  { url: `${BASE}/kategori/moda`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
  { url: `${BASE}/kategori/hizmet`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
  { url: `${BASE}/kategori/kiralama`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
  { url: `${BASE}/kategori/antika`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
  { url: `${BASE}/kategori/sanat`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
  { url: `${BASE}/kategori/petshop`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
  { url: `${BASE}/kategori/kitap`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
  { url: `${BASE}/kategori/egitim`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
  { url: `${BASE}/kategori/oyuncak`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.65 },
  { url: `${BASE}/kategori/dogal`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.65 },
  { url: `${BASE}/kategori/bakim`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.65 },
  { url: `${BASE}/kategori/bagis`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.6 },
  { url: `${BASE}/kategori/rezervasyon`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.6 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let varlikPages: MetadataRoute.Sitemap = [];

  try {
    const res = await fetch(`${BASE}/api/varliklar?limit=5000&durum=aktif`, {
      next: { revalidate: 3600 },
    });
    if (res.ok) {
      const data = await res.json();
      const varliklar = Array.isArray(data) ? data : (data?.ilanlar || data?.data || []);
      varlikPages = varliklar
        .filter((v: any) => v._id)
        .map((v: any) => ({
          url: `${BASE}/varlik/${v._id}`,
          lastModified: new Date(v.updatedAt || v.createdAt || Date.now()),
          changeFrequency: "weekly" as const,
          priority: 0.6,
        }));
    }
  } catch {}

  return [...STATIK_SAYFALAR, ...varlikPages];
}
