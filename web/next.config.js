/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  transpilePackages: [],
  webpack: (config) => {
    // Resolver conflictos de lodash
    config.resolve.alias = {
      ...config.resolve.alias,
      'lodash': require.resolve('lodash'),
    };
    
    return config;
  },
  env: {
    CUSTOM_KEY: 'my-value',
  },
  async redirects() {
    return [];
  },
  async rewrites() {
    return [];
  },
};

module.exports = nextConfig;
