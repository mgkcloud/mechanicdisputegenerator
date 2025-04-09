import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  serverExternalPackages: ["@aws-sdk/client-s3"],
  env: {
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY,
    BYPASS_PAYMENT: process.env.BYPASS_PAYMENT,
  },
}

export default nextConfig

// Added by create cloudflare to enable calling `getCloudflareContext()` in `next dev`
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare"
initOpenNextCloudflareForDev()
