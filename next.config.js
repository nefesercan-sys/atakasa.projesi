/** @type {import('next').NextConfig} */
const nextConfig = {
  compress: true,
  poweredByHeader: false,

  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [{ protocol: "https", hostname: "res.cloudinary.com" }],
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
              "img-src 'self' data: blob: https://res.cloudinary.com",
              "media-src 'self' blob: https://res.cloudinary.com",
              "connect-src 'self' https://api.cloudinary.com https://vitals.vercel-insights.com",
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
    return [
      { source: "/sineklik-panjur", destination: "/sineklik-panjur/tr", permanent: true },
      // Eski sürümden kalan adresler → yeni sayfalar (arama motorlarındaki linkler kırılmasın)
      { source: "/varlik/:slug", destination: "/ilan/:slug", permanent: true },
      { source: "/varlik", destination: "/", permanent: true },
      { source: "/kesfet", destination: "/", permanent: true },
      { source: "/takas", destination: "/", permanent: true },
      { source: "/urun/:path*", destination: "/", permanent: false },
      { source: "/urun-ekle", destination: "/", permanent: true },
      { source: "/takas-baslat", destination: "/", permanent: false },
      { source: "/takas-teklif", destination: "/", permanent: false },
      { source: "/trades", destination: "/", permanent: false },
      { source: "/sepet", destination: "/", permanent: false },
      { source: "/borsa", destination: "/", permanent: true },
      { source: "/premium", destination: "/", permanent: true },
      { source: "/emanet-kasa", destination: "/", permanent: true },
      { source: "/mesajlar", destination: "/", permanent: false },
      // Üyelik kaldırıldı: giriş/kayıt/panel/ilan verme adresleri ana sayfaya yönlenir.
      ...["/giris", "/kayit", "/panel", "/sifre-sifirla", "/sifremi-unuttum", "/ilan-ver", "/nasil-calisir"].map((source) => ({ source, destination: "/", permanent: true })),
    ];
  },
};

module.exports = nextConfig;
