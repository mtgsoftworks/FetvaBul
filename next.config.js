/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true, // Netlify için image optimization devre dışı
  },
  // Add compression
  compress: true,
};

module.exports = nextConfig;
