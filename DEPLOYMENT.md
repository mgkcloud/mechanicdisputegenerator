# Deployment Guide for MechanicDispute.com.au

This guide explains how to deploy the Mechanic Dispute Resolution application to Cloudflare Workers using OpenNext.

## Prerequisites

1. A Cloudflare account with Workers enabled
2. The domain `mechanicdispute.com.au` added to your Cloudflare account
3. Cloudflare R2 bucket created for document storage
4. Cloudflare Workers configuration set up with necessary secrets

## Setup Secrets in Cloudflare

Before deploying, make sure you have set up these secrets in your Cloudflare account:

```bash
# Log in to Cloudflare (if not already logged in)
npx wrangler login

# Set up secrets
npx wrangler secret put OPENAI_API_KEY
npx wrangler secret put STRIPE_SECRET_KEY
npx wrangler secret put STRIPE_PUBLISHABLE_KEY
npx wrangler secret put STRIPE_WEBHOOK_SECRET
```

## Create R2 Bucket

If you haven't created the R2 bucket yet, run:

```bash
npx wrangler r2 bucket create mechanic-dispute-documents
npx wrangler r2 bucket create mechanic-dispute-documents-dev
```

## Deployment Steps

### 1. Build and Deploy

Run the deployment script:

```bash
# Deploy without custom domain
npm run deploy

# OR deploy with custom domain
npm run deploy:custom-domain
```

### 2. Verify Domain Configuration

1. Ensure your DNS settings in Cloudflare are pointing to the Worker
2. You should see a DNS record with type CNAME for `mechanicdispute.com.au` 
3. Verify SSL is set to "Full" or "Full (Strict)" in the SSL/TLS section

### 3. Test the Deployment

Visit `https://mechanicdispute.com.au` to verify your site is working correctly.

## Troubleshooting

### Common Issues

1. **Worker deployment fails**: Check your wrangler.toml configuration and ensure R2 bucket names are correct
2. **Image loading issues**: Verify the remotePatterns in next.config.mjs are correct
3. **API errors**: Check Cloudflare logs to ensure all secrets are properly set

### Logs and Debugging

View your Worker logs:

```bash
npx wrangler tail
```

## Updating the Site

To update the site after making changes:

1. Make your code changes
2. Commit changes to version control
3. Run `npm run deploy:custom-domain` again

## Additional Resources

- [OpenNext Documentation](https://open-next.js.org/)
- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [Cloudflare R2 Documentation](https://developers.cloudflare.com/r2/) 