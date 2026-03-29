/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    devtoolSegmentExplorer: false
  },
  webpack: (config, { dev }) => {
    if (dev) {
      config.cache = false;
    }
    return config;
  },
  images: {
    unoptimized: true
  }
};

export default nextConfig;
