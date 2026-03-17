/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // ✅ Modern format — AVIF/WebP otomatik sıkıştırma (LCP iyileşir)
    formats: ["image/avif", "image/webp"],

    // ✅ Cache — aynı görsel tekrar indirilmez
    minimumCacheTTL: 60 * 60 * 24 * 30,

    // ✅ Responsive breakpoint'ler
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],

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
      // ✅ Tüm sayfalar için güvenlik header'ları
      {
        source: "/(.*)",
        headers: [
          { key: "X-DNS-Prefetch-Control", value: "on" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(self), microphone=(self), geolocation=(self)",
          },
        ],
      },

      // ✅ Statik dosyalar — 1 yıl cache (font, JS, CSS)
      {
        source: "/_next/static/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },

      // ✅ Next.js görsel optimizasyon cache
      {
        source: "/_next/image(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, stale-while-revalidate=604800",
          },
        ],
      },

      // ✅ API cache — borsa verileri 30sn cache, 60sn stale
      {
        source: "/api/varliklar(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, s-maxage=30, stale-while-revalidate=60",
          },
        ],
      },

      // ✅ Statik sayfalar cache
      {
        source: "/((?!api|_next).*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, s-maxage=60, stale-while-revalidate=300",
          },
        ],
      },
    ];
  },

  // ✅ Brotli/Gzip sıkıştırma
  compress: true,

  // ✅ Cloudflare uyumu
  trailingSlash: false,

  // ✅ React strict mode
  reactStrictMode: true,

  // ✅ Modern JS — eski polyfill bundle'ı küçültür
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
};

export default nextConfig;
