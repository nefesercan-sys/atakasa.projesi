/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['res.cloudinary.com'], // Siber resim bulutu izni
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '50mb', // 50MB'a kadar veri enjeksiyonu izni
    },
  },
};

export default nextConfig;
