/** @type {import('next').NextConfig} */
const nextConfig = {
  // Your existing config options (if any) go here
  // e.g., experimental: { appDir: true }, reactStrictMode: true,

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'service.firecrawl.dev',
        // port: '', // Optional
        // pathname: '/storage/v1/object/public/media/**', // Optional, more specific path
      },
      // Add other allowed hostnames here if needed
      // e.g., { protocol: 'https', hostname: '**.anotherdomain.com' }
    ],
  },

  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Add rule to handle direct JSON imports
    config.module.rules.push({
      test: /\.json$/,
      type: 'json'
    });

    // Important: return the modified config
    return config;
  },
};

export default nextConfig; 