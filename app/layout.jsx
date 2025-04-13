import "./globals.css"
import "@/styles/calendar.css"
import { Inter } from "next/font/google"
import Script from "next/script"
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from "@/components/theme-provider"
import Header from "@/components/header"
import Footer from "@/components/footer"
import ClearStorageListener from "@/components/form/clear-storage-listener"
// Import polyfill for __name
import "./index.js"
import ErrorBoundary from "@/components/ErrorBoundary"
import GlobalErrorHandler from "@/components/GlobalErrorHandler"
import { generateOrganizationSchema, generateJsonLd } from "@/lib/schema"
import { getBaseUrl } from "@/lib/metadataUtils" // Import the helper

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })

// Replace static metadata export with generateMetadata function
export async function generateMetadata({ params }, parent) {
  // Generate the organization schema for the entire site
  const organizationSchema = generateOrganizationSchema({
    name: "Australian Mechanic Dispute Resolution",
    url: getBaseUrl(), // Use helper for consistency
    logo: `${getBaseUrl()}/logo.png`, // Use helper for consistency
    sameAs: [
      "https://facebook.com/mechanicdispute",
      "https://twitter.com/mechanicdispute",
      "https://linkedin.com/company/mechanicdispute"
    ],
    description: "Professional legal document generation service for resolving mechanic disputes in Australia."
  });

  return {
    metadataBase: new URL(getBaseUrl()), // Use helper
    title: {
      template: '%s | Australian Mechanic Dispute Resolution',
      default: 'Australian Mechanic Dispute Resolution',
    },
    description: "Generate professional legal documents for resolving disputes with mechanics in Australia",
    icons: {
      icon: [
        { url: '/favicon.svg', type: 'image/svg+xml' }
      ]
    },
    openGraph: {
      siteName: "Australian Mechanic Dispute Resolution",
      images: [
        {
          url: `${getBaseUrl()}/og-image.png`, // Use helper
          width: 1200,
          height: 630,
          alt: 'Australian Mechanic Dispute Resolution',
        },
      ],
      locale: "en_AU",
      type: "website",
    },
    twitter: {
      card: 'summary_large_image',
      images: [`${getBaseUrl()}/og-image.png`], // Use helper
    },
    jsonLd: generateJsonLd([organizationSchema])
  }
}

// Viewport remains a separate export
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#ffffff',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Stripe.js script */}
        <Script src="https://js.stripe.com/v3/" strategy="beforeInteractive" />
        
        {/* Zaraz is already included by Cloudflare automatically - no need for manual initialization */}
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <GlobalErrorHandler />
        <ThemeProvider attribute="class" defaultTheme="light">
          <ClearStorageListener />
          <Header />
          <ErrorBoundary>
            <main className="flex-1">{children}</main>
          </ErrorBoundary>
          <Footer />
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}


import './globals.css'