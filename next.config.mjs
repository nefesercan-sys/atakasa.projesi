/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // ✅ YENİ: AVIF + WebP formatları — görsel boyutunu %30-50 küçültür (LCP iyileşir)
    formats: ["image/avif", "image/webp"],

    // ✅ YENİ: Cache süresi — her ziyarette yeniden indirilmez
    minimumCacheTTL: 60 * 60 * 24 * 30,

    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "placehold.co" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "source.unsplash.com" },
      { protocol: "https", hostname: "ui-avatars.com" },
    ],
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-DNS-Prefetch-Control", value: "on" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(self), microphone=(self), geolocation=(self)" },
        ],
      },
      // ✅ YENİ: Statik dosyalar için agresif cache — font/görsel tekrar indirilmez
      {
        source: "/_next/static/(.*)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      // ✅ YENİ: Görseller için cache
      {
        source: "/_next/image(.*)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" },
        ],
      },
    ];
  },

  // ✅ KORUNDU: Vercel build optimizasyonu
  compress: true,

  // ✅ KORUNDU: Cloudflare uyumu
  trailingSlash: false,

  // ✅ YENİ: React strict mode — hataları erkenden yakala
  reactStrictMode: true,
};

export default nextConfig;
