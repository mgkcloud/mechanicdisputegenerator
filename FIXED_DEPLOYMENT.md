# FIXED: Next.js 15 Deployment Guide for Cloudflare Workers

This guide addresses the 404 errors in static assets and provides the correct configuration for deploying Next.js 15 applications to Cloudflare Workers with OpenNext.

## Fixed Configuration

### 1. wrangler.toml

The key change is in the assets configuration:

```toml
name = "mechanicdispute-worker"
main = "./.open-next/worker.js"
compatibility_date = "2024-09-23"
compatibility_flags = ["nodejs_compat"]

# Assets configuration - FIXED format for static assets
assets = {
  browser_TTL = 60,
  serve_single_page_app = true,
  directory = ".open-next/assets"
}

# Configure routes for the Worker with custom domain
routes = [
  { pattern = "mechanicdispute.com.au", custom_domain = true }
]

# Configure environment variables
[vars]
BYPASS_PAYMENT = "false"

# Configure R2 bucket binding
[[r2_buckets]]
binding = "DOCUMENTS_BUCKET"
bucket_name = "mechanic-dispute-documents"
preview_bucket_name = "mechanic-dispute-documents-dev"

[[r2_buckets]]
binding = "NEXT_INC_CACHE_R2_BUCKET"
bucket_name = "mechanic-dispute-cache"
preview_bucket_name = "mechanic-dispute-cache-dev"

# Self-reference binding (required by OpenNext)
[[services]]
binding = "WORKER_SELF_REFERENCE"
service = "mechanicdispute-worker"
```

### 2. package.json scripts

Use the official OpenNext Cloudflare commands:

```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "next lint",
  "preview": "opennextjs-cloudflare build && opennextjs-cloudflare preview",
  "deploy": "opennextjs-cloudflare build && opennextjs-cloudflare deploy",
  "cf-typegen": "wrangler types --env-interface CloudflareEnv cloudflare-env.d.ts"
}
```

### 3. next.config.mjs

Initialize OpenNext Cloudflare adapter for development:

```js
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
initOpenNextCloudflareForDev();
```

## Deployment Steps

1. **Install latest wrangler**:
   ```bash
   npm install -g wrangler@latest
   ```

2. **Login to Cloudflare**:
   ```bash
   npx wrangler login
   ```

3. **Create R2 Buckets** (if not already created):
   ```bash
   npx wrangler r2 bucket create mechanic-dispute-documents
   npx wrangler r2 bucket create mechanic-dispute-documents-dev
   npx wrangler r2 bucket create mechanic-dispute-cache
   npx wrangler r2 bucket create mechanic-dispute-cache-dev
   ```

4. **Set up secrets**:
   ```bash
   npx wrangler secret put OPENAI_API_KEY
   npx wrangler secret put STRIPE_SECRET_KEY
   npx wrangler secret put STRIPE_PUBLISHABLE_KEY
   npx wrangler secret put STRIPE_WEBHOOK_SECRET
   ```

5. **Deploy the app**:
   ```bash
   npm run deploy
   ```

## Why These Changes Fix the 404 Errors

1. **Correct Assets Configuration**:
   - Changed from `[site]` configuration to `assets = {}` configuration
   - Added `serve_single_page_app = true` for proper routing
   - Ensured the assets directory path is correct

2. **Using Official Commands**:
   - Switched to using `opennextjs-cloudflare` commands instead of manual npx calls
   - These commands handle the build and deployment process correctly

3. **Consistent File Structure**:
   - Ensured the worker.js path is correct
   - Added proper OpenNext initialization in next.config.mjs

## Troubleshooting

If you still encounter issues:

1. **Clear Cloudflare cache**:
   - Go to Cloudflare dashboard → mechanicdispute.com.au → Caching → Configuration
   - Click "Purge Everything"

2. **Check worker logs**:
   ```bash
   npx wrangler tail mechanicdispute-worker
   ```

3. **Try a local preview first**:
   ```bash
   npm run preview
   ```

4. **Verify R2 buckets exist**:
   ```bash
   npx wrangler r2 bucket list
   ```

5. **Check for any build errors**:
   ```bash
   opennextjs-cloudflare build --verbose
   ``` 