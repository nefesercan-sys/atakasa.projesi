import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://atakasa.com';

  // ── STATİK SAYFALAR ──────────────────────────────────────────
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 1.0,
    },
    {
      url: baseUrl + '/kesfet',
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.95,
    },
    {
      url: baseUrl + '/borsa',
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.95,
    },
    {
      url: baseUrl + '/varlik-ekle',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: baseUrl + '/kayit',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: baseUrl + '/giris',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: baseUrl + '/panel',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.5,
    },
  ];

  // ── DİNAMİK İLAN SAYFALARI — MongoDB'den Çek ─────────────────
  let ilanSayfalar: MetadataRoute.Sitemap = [];

  try {
    const res = await fetch(baseUrl + '/api/varliklar', {
      next: { revalidate: 3600 }, // Her saat güncelle
    });

    if (res.ok) {
      const veri = await res.json();
      const liste = Array.isArray(veri) ? veri : [];

      ilanSayfalar = liste.map((ilan: any) => ({
        url: baseUrl + '/varlik/' + ilan._id,
        lastModified: new Date(ilan.updatedAt || ilan.createdAt || Date.now()),
        changeFrequency: 'weekly' as const,
        priority: 0.85,
      }));
    }
  } catch {
    // Fetch başarısız olursa sadece statik sayfalar döner
  }

  return [...staticPages, ...ilanSayfalar];
}
