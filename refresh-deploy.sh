#!/bin/bash
set -e

echo "===== Starting Mechanic Dispute Cloudflare Refresh Deployment ====="

# Clear Cloudflare cache
echo "Clearing Cloudflare caches..."
npx wrangler pages deployment invalidate-cache || echo "Cache invalidation skipped"

# Clean previous builds
echo "Cleaning previous builds..."
rm -rf ./.open-next
rm -rf ./.next

# Install dependencies if needed
echo "Checking dependencies..."
npm install

# Build the Next.js app
echo "Building Next.js application..."
npx next build

# Bundle for Cloudflare using OpenNext
echo "Bundling for Cloudflare using OpenNext..."
npx @opennextjs/cloudflare build

# Deploy with Wrangler
echo "Deploying to Cloudflare Workers..."
npx wrangler deploy

echo "===== Deployment Complete ====="
echo "Visit your site at: https://mechanicdispute.com.au" 