import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // ── TÜM BOTLAR ───────────────────────────────────────────
      {
        userAgent: '*',
        allow: [
          '/',
          '/varlik/',
          '/kesfet',
          '/borsa',
          '/kayit',
          '/giris',
        ],
        disallow: [
          '/panel/',
          '/panel',
          '/mesajlar/',
          '/mesajlar',
          '/admin/',
          '/admin',
          '/api/',
          '/sepet/',
          '/sepet',
          '/favoriler/',
          '/favoriler',
          '/takas-teklif/',
          '/orders/',
          '/wallet/',
          '/emanet-kasa/',
        ],
      },

      // ── GOOGLE BOT — En Önemli Bot, Özel Kurallar ───────────
      {
        userAgent: 'Googlebot',
        allow: [
          '/',
          '/varlik/',
          '/kesfet',
          '/borsa',
          '/kayit',
        ],
        disallow: [
          '/api/',
          '/admin/',
          '/panel/',
          '/mesajlar/',
        ],
      },

      // ── BING BOT ─────────────────────────────────────────────
      {
        userAgent: 'Bingbot',
        allow: [
          '/',
          '/varlik/',
          '/kesfet',
          '/borsa',
        ],
        disallow: [
          '/api/',
          '/admin/',
          '/panel/',
        ],
      },

      // ── YANDEX BOT ───────────────────────────────────────────
      {
        userAgent: 'YandexBot',
        allow: [
          '/',
          '/varlik/',
          '/kesfet',
          '/borsa',
        ],
        disallow: [
          '/api/',
          '/admin/',
          '/panel/',
        ],
      },

      // ── KÖTÜ BOTLARI ENGELLE (Siber Kalkan) ──────────────────
      {
        userAgent: 'AhrefsBot',
        disallow: '/',
      },
      {
        userAgent: 'SemrushBot',
        disallow: '/',
      },
      {
        userAgent: 'MJ12bot',
        disallow: '/',
      },
      {
        userAgent: 'DotBot',
        disallow: '/',
      },
    ],
    // host özelliği kaldırıldı (Next.js bunu otomatik yönetir)
    sitemap: 'https://atakasa.com/sitemap.xml',
  };
}
