/** @type {import('next').NextConfig} */
const nextConfig = /** @type {import('next').NextConfig} */ ({
  compress: true,
  poweredByHeader: false,

  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 31536000,
    deviceSizes: [360, 414, 768, 1080, 1280, 1920],
    imageSizes: [48, 96, 128, 256, 384],
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "placeholder.co" },
      { protocol: "https", hostname: "loremflickr.com" },
    ],
    dangerouslyAllowSVG: false,
  },

  async headers() {
    return [
      // ─── TÜM SAYFALAR ────────────────────────────────────────────
      {
        source: "/(.*)",
        headers: [
          // Clickjacking koruması
          { key: "X-Frame-Options", value: "DENY" },
          // MIME sniffing koruması
          { key: "X-Content-Type-Options", value: "nosniff" },
          // XSS filtresi (eski tarayıcılar için)
          { key: "X-XSS-Protection", value: "1; mode=block" },
          // Referrer bilgisi kısıtlama
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // ✅ HSTS — HTTP'yi HTTPS'e zorla (2 yıl)
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          // ✅ Permissions Policy — Kamera, mikrofon, konum erişimini kapat
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), fullscreen=(self)" },
          // ✅ CSP — XSS ve injection saldırılarına karşı ana kalkan
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              // Script: sadece kendi domain + inline (Next.js için gerekli)
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://api.cloudinary.com",
              // Style: inline style'lara izin ver (React inline style kullandığı için)
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              // Font
              "font-src 'self' https://fonts.gstatic.com",
              // Resim: kendi domain + cloudinary + placeholder + loremflickr + data URI
              "img-src 'self' data: blob: https://res.cloudinary.com https://placeholder.co https://loremflickr.com https://*.cloudinary.com",
              // Video/medya
              "media-src 'self' blob: https://res.cloudinary.com https://*.cloudinary.com",
              // API çağrıları
              "connect-src 'self' https://api.cloudinary.com https://res.cloudinary.com https://*.atakasa.com wss://*.atakasa.com",
              // Frame: hiçbir şeyi embed etme
              "frame-src 'none'",
              // Frame ancestors: başka siteler seni embed edemesin
              "frame-ancestors 'none'",
              // Form action
              "form-action 'self'",
              // Base URI
              "base-uri 'self'",
              // Manifest
              "manifest-src 'self'",
              // Worker (PWA için)
              "worker-src 'self' blob:",
            ].join("; "),
          },
          // ✅ DNS Prefetch Control
          { key: "X-DNS-Prefetch-Control", value: "on" },
        ],
      },

      // ─── STATİK VARLIKLAR — Uzun cache ───────────────────────────
      {
        source: "/(.*)\\.(jpg|jpeg|png|gif|webp|avif|svg|ico)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        source: "/(.*)\\.(js|css|woff|woff2|ttf|otf)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },

      // ─── API — Cache yok ─────────────────────────────────────────
      {
        source: "/api/(.*)",
        headers: [
          { key: "Cache-Control", value: "no-store, no-cache, must-revalidate" },
          { key: "Pragma", value: "no-cache" },
          // API CORS — sadece kendi domaininden
          { key: "Access-Control-Allow-Origin", value: "https://atakasa.com" },
          { key: "Access-Control-Allow-Methods", value: "GET, POST, PUT, DELETE, OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "Content-Type, Authorization" },
        ],
      },

      // ─── SİTEMAP — Kısa cache ────────────────────────────────────
      {
        source: "/sitemap(.*).xml",
        headers: [
          { key: "Cache-Control", value: "public, s-maxage=3600, stale-while-revalidate=7200" },
          { key: "Content-Type", value: "application/xml; charset=utf-8" },
        ],
      },
    ];
  },

  async redirects() {
    return [
      // www olmayan → www yönlendir (canonical)
      {
        source: "/(.*)",
        has: [{ type: "host", value: "atakasa.com" }],
        destination: "https://www.atakasa.com/:path*",
        permanent: true,
      },
      // /index → /
      { source: "/index", destination: "/", permanent: true },
      // /home → /
      { source: "/home", destination: "/", permanent: true },
      // Eski kategori URL'leri → yeni format
      { source: "/kategori/takas", destination: "/takas", permanent: true },
      { source: "/kategori/ikinci-el", destination: "/kategori/2. El", permanent: true },
      { source: "/kategori/elektronik", destination: "/kategori/Elektronik", permanent: true },
      { source: "/kategori/moda", destination: "/kategori/Tekstil", permanent: true },
      { source: "/kategori/antika", destination: "/kategori/Antika Eserler", permanent: true },
      { source: "/kategori/petshop", destination: "/kategori/Petshop", permanent: true },
      { source: "/kategori/kitap", destination: "/kategori/Kitap", permanent: true },
      { source: "/kategori/oyuncak", destination: "/kategori/Oyuncak", permanent: true },
      { source: "/kategori/dogal", destination: "/kategori/Doğal Ürünler", permanent: true },
      { source: "/kategori/kozmetik", destination: "/kategori/Kozmetik", permanent: true },
    ];
  },

  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
});

module.exports = nextConfig;
