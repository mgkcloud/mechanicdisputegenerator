# Cloudflare Deployment Guide for MechanicDispute.com.au

This guide provides step-by-step instructions for deploying your Next.js application to Cloudflare Workers with custom domain and R2 bucket bindings.

## 1. Login to Cloudflare

First, login to Cloudflare using Wrangler:

```bash
npx wrangler login
```

## 2. Create R2 Buckets

Create the required R2 buckets for your application:

```bash
# Create the documents bucket for storing user files
npx wrangler r2 bucket create mechanic-dispute-documents
npx wrangler r2 bucket create mechanic-dispute-documents-dev

# Create the cache bucket for Next.js incremental cache
npx wrangler r2 bucket create mechanic-dispute-cache
npx wrangler r2 bucket create mechanic-dispute-cache-dev
```

## 3. Set Up Secrets

Add your environment secrets to Cloudflare Workers:

```bash
# Add OpenAI API key
npx wrangler secret put OPENAI_API_KEY
# Enter your key when prompted: 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

# Add Stripe API keys
npx wrangler secret put STRIPE_SECRET_KEY
# Enter your key when prompted: sk_test_51PxizFK4JiRaEXouh2y2G2UI8s1A6CUBvPx3tmWuRBLzusRCpg8zJE27TQsvaC2OLrjHXqtSkiHJ3PfNXMs4XQyl00OM9ZOeJY

# Add Stripe publishable key
npx wrangler secret put STRIPE_PUBLISHABLE_KEY
# Enter your key when prompted: pk_test_... (from your .env.local file)

# Add Stripe webhook secret
npx wrangler secret put STRIPE_WEBHOOK_SECRET
# Enter your key when prompted: whsec_... (from your .env.local file)
```

## 4. Add Your Domain to Cloudflare

Make sure your domain `mechanicdispute.com.au` is added to your Cloudflare account:

1. Go to Cloudflare dashboard
2. Add a new website or ensure your domain is already added
3. Configure your DNS settings at your domain registrar to use Cloudflare nameservers

## 5. Deploy Your Application

Use the deploy script to build and deploy your application:

```bash
npm run deploy
```

This will:
1. Build your Next.js application with OpenNext
2. Deploy it to Cloudflare Workers

## 6. Configure Custom Domain

After deployment, connect your Worker to your custom domain:

1. Go to Cloudflare dashboard → Workers & Pages
2. Find your deployed Worker (mechanicdispute-worker)
3. Go to Settings → Custom Domains
4. Add your domain: mechanicdispute.com.au

## 7. Verify Deployment

After deployment completes, visit your site:

```
https://mechanicdispute.com.au
```

## Troubleshooting

### Common Deployment Issues

1. **R2 Bucket Errors**:
   - Make sure all buckets are created and correctly named in wrangler.toml
   - Ensure your Cloudflare account has R2 enabled

2. **Next.js Errors**:
   - For dynamic pages, ensure they have `export const dynamic = 'force-dynamic';`
   - Use `export const runtime = 'nodejs';` for Node.js specific features

3. **Custom Domain Issues**:
   - Ensure DNS is properly configured
   - Check that the domain is active in your Cloudflare account

4. **Logs and Debugging**:
   - View Worker logs with: `npx wrangler tail`

### Updating Your Site

To deploy updates:

1. Make your changes
2. Run `npm run deploy` again 