# Next.js 15 Deployment Guide for Cloudflare Workers

This guide provides the latest best practices for deploying Next.js 15 applications to Cloudflare Workers using OpenNext.

## Prerequisites

1. Cloudflare account with Workers and R2 enabled
2. Domain `mechanicdispute.com.au` added to your Cloudflare account
3. Node.js 18+ installed locally

## Configuration Files

### wrangler.toml

```toml
name = "mechanicdispute-worker"
main = "./.open-next/worker.js"
compatibility_date = "2024-04-01"
compatibility_flags = ["nodejs_compat"]

# Assets configuration
[site]
bucket = "./.open-next/assets"

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

### .dev.vars

Create a `.dev.vars` file in your project root for local development:

```
NEXTJS_ENV=development
```

## Next.js 15 Best Practices

### Server Components and Server Actions

Next.js 15 has stricter rules for server components and server actions:

1. **Server Actions in Separate Files**
   - Create server actions in separate files
   - Place "use server" directive at the top of the file
   - Export only async functions from these files

2. **Page Configuration**
   - Use `export const dynamic = 'force-dynamic'` for pages that need dynamic rendering
   - Don't mix "use server" with static exports like `dynamic = 'force-dynamic'`
   - For searchParams access, always mark the page as dynamic

Example of proper page configuration:

```jsx
// app/dynamic-page/page.jsx
export const dynamic = 'force-dynamic';

export default async function DynamicPage({ searchParams }) {
  // Code that uses searchParams
}
```

Example of correct server action:

```jsx
// app/actions.js
"use server"

export async function myServerAction(data) {
  // Server-side code
  return result;
}
```

## Deployment Steps

### 1. Login to Cloudflare

```bash
npx wrangler login
```

### 2. Create R2 Buckets

```bash
# Create the documents bucket for storing user files
npx wrangler r2 bucket create mechanic-dispute-documents
npx wrangler r2 bucket create mechanic-dispute-documents-dev

# Create the cache bucket for Next.js incremental cache
npx wrangler r2 bucket create mechanic-dispute-cache
npx wrangler r2 bucket create mechanic-dispute-cache-dev
```

### 3. Set Up Secrets

```bash
# Add OpenAI API key
npx wrangler secret put OPENAI_API_KEY

# Add Stripe API keys
npx wrangler secret put STRIPE_SECRET_KEY
npx wrangler secret put STRIPE_PUBLISHABLE_KEY
npx wrangler secret put STRIPE_WEBHOOK_SECRET
```

### 4. Build and Deploy

```bash
npm run deploy
```

This script runs:
```
npm run build:cf && npx wrangler deploy
```

Which first builds your Next.js application with OpenNext for Cloudflare, and then deploys it using Wrangler.

## Common Issues and Fixes

### Error: "Only async functions are allowed to be exported in a 'use server' file"

**Fix**: Remove non-async exports from server action files or move configuration exports to page files.

### Error: "No R2 binding found"

**Fix**: 
- Check that your R2 buckets are created
- Verify the bucket names in wrangler.toml match exactly
- Ensure the `main` field points to `./.open-next/worker.js`
- Add the self-reference binding

### Error: "Dynamic server usage"

**Fix**:
- Add `export const dynamic = 'force-dynamic'` to pages that use searchParams
- Don't use "use server" directive in page files

## After Deployment

1. Verify your custom domain configuration in Cloudflare dashboard
2. Test the deployment by visiting https://mechanicdispute.com.au
3. Check Worker logs if needed: `npx wrangler tail`

## References

- [Next.js 15 Documentation](https://nextjs.org/docs)
- [OpenNext Cloudflare Documentation](https://open-next.js.org/cloudflare/)
- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/) 