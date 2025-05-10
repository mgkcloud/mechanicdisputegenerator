import webpack from 'webpack';

let userConfig = undefined
try {
  // try to import ESM first
  userConfig = await import('./v0-user-next.config.mjs')
} catch (e) {
  try {
    // fallback to CJS import
    userConfig = await import("./v0-user-next.config");
  } catch (innerError) {
    // ignore error
  }
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'service.firecrawl.dev',
        pathname: '/storage/v1/object/public/media/**',
      },
    ],
  },
  experimental: {
    webpackBuildWorker: true,
    parallelServerBuildTraces: true,
    parallelServerCompiles: true,
  },
  serverExternalPackages: ['@aws-sdk'],
  
  // Add Webpack config to define __name globally
  webpack: (config, { isServer }) => {
    // Define __name polyfill globally for both server and client builds
    config.plugins.push(
      new webpack.DefinePlugin({
        '__name': JSON.stringify(function(target, value) {
          if (typeof Object.defineProperty === 'function') {
            Object.defineProperty(target, 'name', { value: value, configurable: true });
          }
          return target;
        }.toString())
      })
    );

    // Rule for .hbs files removed
    // config.module.rules.push({
    //   test: /\.hbs$/,
    //   use: 'raw-loader',
    // });

    return config;
  },
  
  // Remove custom headers block for simplification
  // async headers() { ... }
}

if (userConfig) {
  // ESM imports will have a "default" property
  const config = userConfig.default || userConfig

  for (const key in config) {
    if (
      typeof nextConfig[key] === 'object' &&
      !Array.isArray(nextConfig[key])
    ) {
      nextConfig[key] = {
        ...nextConfig[key],
        ...config[key],
      }
    } else {
      nextConfig[key] = config[key]
    }
  }
}

export default nextConfig

// Initialize OpenNext Cloudflare adapter for development
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
initOpenNextCloudflareForDev();
