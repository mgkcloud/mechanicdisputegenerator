#!/bin/bash
set -e

echo "===== Starting Mechanic Dispute Cloudflare Deployment ====="

# Create R2 buckets if they don't exist
echo "Creating R2 buckets if they don't exist..."
npx wrangler r2 bucket create mechanic-dispute-cache || echo "Bucket mechanic-dispute-cache already exists"
npx wrangler r2 bucket create mechanic-dispute-cache-dev || echo "Bucket mechanic-dispute-cache-dev already exists"
npx wrangler r2 bucket create mechanic-dispute-documents || echo "Bucket mechanic-dispute-documents already exists"
npx wrangler r2 bucket create mechanic-dispute-documents-dev || echo "Bucket mechanic-dispute-documents-dev already exists"

# Clear previous builds
echo "Cleaning previous builds..."
rm -rf ./.open-next

# Build the app using npx to ensure correct versions
echo "Building Next.js application with OpenNext..."
npx next build

# Bundle for Cloudflare using npx directly
echo "Bundling application for Cloudflare..."
npx @opennextjs/cloudflare build

# Deploy with Wrangler directly (more stable than opennextjs-cloudflare deploy)
echo "Deploying to Cloudflare Workers..."
npx wrangler deploy 

echo "===== Deployment Complete ====="
echo "Visit your site at: https://mechanicdispute.com.au" 