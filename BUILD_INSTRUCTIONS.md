# Build and Deployment Instructions

This document contains instructions for building and deploying the Mechanic Dispute application to Cloudflare Workers.

## Prerequisites

- Node.js 18 or later
- Cloudflare account with Workers and R2 storage enabled
- Wrangler CLI installed and authenticated (`npm install -g wrangler && wrangler login`)

## Local Development

1. Install dependencies:
   ```
   npm install
   ```

2. Start the development server:
   ```
   npm run dev
   ```

3. Visit http://localhost:3000 to view the application

## Building for Production

1. Prepare static routes:
   ```
   npm run prepare-routes
   ```
   This ensures all static routes (pages) are correctly configured with metadata.

2. Build the application:
   ```
   npm run build
   ```

3. Preview the production build locally:
   ```
   npm run preview
   ```

## Deploying to Cloudflare Workers

1. Set up your environment variables in either:
   - `.dev.vars` file for local development
   - Cloudflare Dashboard for production

2. Ensure your wrangler.toml is properly configured with:
   - Correct R2 bucket bindings
   - Proper routes and custom domain settings
   - Appropriate environment variables

3. Deploy to Cloudflare:
   ```
   npm run deploy
   ```

## Troubleshooting Common Issues

### 404 Errors on Static Pages

If you're seeing 404 errors for pages like `/how-it-works`, `/faq`, etc:

1. Make sure each page has:
   - A `page.jsx` file with `"use client"` directive
   - A separate `metadata.js` file for SEO metadata
   - No conflicting metadata exports in the page component itself

2. Run the prepare-routes script to ensure all metadata files are created:
   ```
   npm run prepare-routes
   ```

3. Check that the middleware properly handles these routes.

### File Upload Issues

If file uploads aren't working:

1. Ensure your Cloudflare R2 bucket is properly configured
2. Verify that the `wrangler.toml` has the correct bucket binding
3. Make sure the application has the appropriate permissions

### RSC Errors

If you see React Server Component related errors:

1. Check your middleware.js to ensure it handles RSC routes properly
2. Make sure your client components are using "use client" directive
3. Verify metadata is in separate files, not in the client components

## Configuration Files

Key configuration files:

- `next.config.mjs` - Next.js configuration
- `wrangler.toml` - Cloudflare Workers configuration
- `middleware.js` - Custom middleware for routing and RSC handling
- `ensure-static-routes.js` - Script to validate static routes 