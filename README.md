# Mechanic Dispute Resolution Application

A professional application for generating legal documents to resolve disputes with mechanics in Australia.

## Features

- Multi-step form with validation
- File uploads to Cloudflare R2 storage
- Document generation using OpenAI
- Secure payment processing with Stripe
- Document storage and retrieval
- Responsive design for all device sizes

## Tech Stack

- Next.js 14+ with App Router
- Tailwind CSS for styling
- Cloudflare Workers for serverless functions
- Cloudflare R2 for storage
- OpenAI for document generation
- Stripe for payment processing

## Environment Variables

The following environment variables are required:

\`\`\`env
# OpenAI API Key for document generation
OPENAI_API_KEY=sk-...

# Stripe API Keys for payment processing
STRIPE_SECRET_KEY=sk_...
STRIPE_PUBLISHABLE_KEY=pk_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Storage configuration (for local development)
S3_REGION=auto
S3_ENDPOINT=https://...
S3_ACCESS_KEY=...
S3_SECRET_KEY=...
S3_BUCKET_NAME=mechanic-dispute-documents

# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Optional: Bypass payment in development
BYPASS_PAYMENT=true
\`\`\`

## Development

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables
4. Run the development server: `npm run dev`

## Deployment

This application is designed to be deployed on Cloudflare Pages with Cloudflare Workers and R2 storage.

1. Set up a Cloudflare Pages project
2. Configure the environment variables in Cloudflare Pages
3. Set up Cloudflare R2 bucket
4. Deploy the application: `npm run deploy`

## License

MIT
\`\`\`

This completes the refactoring of the application into smaller, more manageable files. The application is now fully production-ready with proper error handling, validation, and a clean architecture.
