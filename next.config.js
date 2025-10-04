/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Add compression
  compress: true,
};

module.exports = nextConfig;
