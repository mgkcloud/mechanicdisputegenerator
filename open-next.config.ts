import { defineCloudflareConfig } from "@opennextjs/cloudflare"
import r2IncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache"

export default defineCloudflareConfig({
  // Enable R2 cache for better performance
  incrementalCache: r2IncrementalCache,

  // Define bindings for Cloudflare Workers
  bindings: {
    // R2 bucket for document storage
    DOCUMENTS_BUCKET: {
      type: "r2",
      name: "mechanic-dispute-documents",
    },

    // Environment variables
    OPENAI_API_KEY: {
      type: "secret",
      name: "OPENAI_API_KEY",
    },
    STRIPE_SECRET_KEY: {
      type: "secret",
      name: "STRIPE_SECRET_KEY",
    },
    STRIPE_PUBLISHABLE_KEY: {
      type: "secret",
      name: "STRIPE_PUBLISHABLE_KEY",
    },
    STRIPE_WEBHOOK_SECRET: {
      type: "secret",
      name: "STRIPE_WEBHOOK_SECRET",
    },
    BYPASS_PAYMENT: {
      type: "var",
      name: "BYPASS_PAYMENT",
    },
  },
})
