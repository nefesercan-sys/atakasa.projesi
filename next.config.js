/** @type {import('next').NextConfig} */
const nextConfig = {
  compress: true,
  poweredByHeader: false,

  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [],
    dangerouslyAllowSVG: false,
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          { key: "Permissions-Policy", value: "geolocation=(), payment=(), usb=()" },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://va.vercel-scripts.com",
              "style-src 'self' 'unsafe-inline'",
              "font-src 'self' data:",
              "img-src 'self' data: blob:",
              "media-src 'self' blob:",
              "connect-src 'self' https://vitals.vercel-insights.com",
              "frame-src 'none'",
              "frame-ancestors 'none'",
              "form-action 'self'",
              "base-uri 'self'",
              "object-src 'none'",
            ].join("; "),
          },
        ],
      },
      { source: "/api/(.*)", headers: [{ key: "Cache-Control", value: "no-store" }] },
    ];
  },

  async redirects() {
    // Site yalnızca Likya Home sineklik ve panjur sayfalarından oluşur.
    // "/" kalıcı olarak Türkçe sayfaya yönlenir; aynı içerik iki adreste yayımlanmaz (tek canonical: /sineklik-panjur/<dil>).
    const ana = "/sineklik-panjur/tr";
    return [
      { source: "/", destination: ana, permanent: true },
      { source: "/sineklik-panjur", destination: ana, permanent: true },
      // Kaldırılan takas/ilan/üyelik adresleri (arama motorlarındaki ve dış bağlantılardaki eski adresler kırılmasın)
      ...[
        "/ilan", "/ilan/:path*", "/kategori", "/kategori/:path*", "/sehir", "/sehir/:path*",
        "/takas-rehberi", "/takas-rehberi/:path*", "/varlik", "/varlik/:path*", "/kesfet", "/takas",
        "/urun", "/urun/:path*", "/urun-ekle", "/takas-baslat", "/takas-teklif", "/trades", "/sepet", "/borsa",
        "/premium", "/emanet-kasa", "/mesajlar", "/giris", "/kayit", "/panel", "/sifre-sifirla", "/sifremi-unuttum",
        "/ilan-ver", "/nasil-calisir",
      ].map((source) => ({ source, destination: ana, permanent: true })),
    ];
  },
};

module.exports = nextConfig;
