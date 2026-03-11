/** @type {import('next').NextConfig} */
const nextConfig = {
  
  // Cloudinary ve diğer harici görseller için
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
    ],
  },

  // Vercel + Cloudflare için
  poweredByHeader: false, // "X-Powered-By: Next.js" header'ını gizler

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
          // Cloudinary görselleri ve fontlar için izin
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'", // Next.js için gerekli
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https://res.cloudinary.com https://placehold.co",
              "media-src 'self' https://res.cloudinary.com",
              "connect-src 'self' https://api.cloudinary.com",
              "frame-ancestors 'self'",
            ].join('; ')
          },
          // Cloudflare cache kontrolü
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate'
          },
          // Kullanıcı gizliliği için
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          }
        ],
      },
      // API route'ları için ayrı kurallar
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          }
        ],
      },
      // Statik dosyalar için uzun cache
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ],
      },
      // Cloudinary'den gelen görseller için
      {
        source: '/images/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, stale-while-revalidate=43200'
          }
        ],
      },
    ]
  },

  // Vercel build optimizasyonu
  compress: true,

  // Cloudflare ile uyumlu — gereksiz redirect'leri önler  
  trailingSlash: false,

};

export default nextConfig;
