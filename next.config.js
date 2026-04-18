/** @type {import('next').NextConfig} */
const isStaticExport = process.env.STATIC_EXPORT === '1';

const nextConfig = {
  images: {
    unoptimized: true,
  },
  // Add compression
  compress: true,
  ...(isStaticExport
    ? {
        output: 'export',
        trailingSlash: true,
      }
    : {}),
};

module.exports = nextConfig;
