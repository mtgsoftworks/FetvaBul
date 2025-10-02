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
  // Enable experimental features
  experimental: {
    optimizeCss: true,
  },
  // Netlify environment variables
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
};

module.exports = nextConfig;
