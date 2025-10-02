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
  // Serverless function optimization for Netlify
  experimental: {
    serverComponentsExternalPackages: [],
    optimizePackageImports: ['lucide-react', '@radix-ui/react-*'],
  },
  // Reduce server function size
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Exclude large unused dependencies from server bundle
      config.externals = config.externals || [];
      config.externals.push({
        'sharp': 'commonjs sharp',
      });
    }
    return config;
  },
};

module.exports = nextConfig;
