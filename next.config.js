/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  // Add compression
  compress: true,
};

module.exports = nextConfig;
