import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // 🌐 Vercel ortamında çalışırken dinamik URL algılama zırhı
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://atakasa.com';

  // ── STATİK VİTRİN SAYFALARI (Ana Taşıyıcılar) ─────────────────
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'always', // Google botları burayı sürekli tarasın
      priority: 1.0, // En yüksek öncelik
    },
    {
      url: `${baseUrl}/kesfet`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.95,
    },
    {
      url: `${baseUrl}/borsa`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.95,
    },
    {
      url: `${baseUrl}/ilan-ver`, // Formu modal yapsak da direkt linki olabilir
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/kayit`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/giris`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/panel`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.5,
    },
  ];

  // ── DİNAMİK İLAN SAYFALARI (Siber Ağdan Otomatik Çekilir) ──────
  let ilanSayfalar: MetadataRoute.Sitemap = [];

  try {
    // 🛡️ API'den ilanları çekiyoruz, eğer sistem uyuyorsa çökmemesi için try-catch içinde
    const res = await fetch(`${baseUrl}/api/varliklar`, {
      next: { revalidate: 3600 }, // Önbelleği saatte bir yenile
    });

    if (res.ok) {
      const veri = await res.json();
      // Verinin dizi (array) formatında olup olmadığını zırhlıyoruz
      const liste = Array.isArray(veri) ? veri : (veri.data || veri.varliklar || []);

      ilanSayfalar = liste.map((ilan: any) => ({
        url: `${baseUrl}/varlik/${ilan._id}`,
        lastModified: new Date(ilan.updatedAt || ilan.createdAt || Date.now()),
        changeFrequency: 'daily', // İlanları günlük tarasın
        priority: 0.85, // İlanlar statik sayfalardan sonraki en önemli yer
      }));
    }
  } catch (error) {
    console.error("Sitemap Siber Motor Hatası: İlanlar çekilemedi, sadece statik sayfalar derleniyor.", error);
    // Fetch başarısız olursa sistem çökmez, sadece statik sayfalar döner.
  }

  return [...staticPages, ...ilanSayfalar];
}
