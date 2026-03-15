/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "placehold.co" },
      // 🚨 DÜZELTME: AI'ın ürettiği resimlerin görünmesi için Unsplash ve Avatarlar beyaz listeye eklendi!
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
          // 🚨 DÜZELTME: Kamera, Mikrofon ve Konum izni yasaklıdan, "Kullanılabilir (self)" durumuna getirildi!
          { key: "Permissions-Policy", value: "camera=(self), microphone=(self), geolocation=(self)" },
        ],
      },
    ];
  },

  // Vercel build optimizasyonu
  compress: true,

  // Cloudflare ile uyum - gereksiz redirect'leri önler
  trailingSlash: false,
};

export default nextConfig;
