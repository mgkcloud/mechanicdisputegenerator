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

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })

export const metadata = {
  title: "Australian Mechanic Dispute Resolution",
  description: "Generate professional legal documents for resolving disputes with mechanics in Australia",
    icons: {
      icon: [
        { url: '/favicon.svg', type: 'image/svg+xml' }
      ]
    }
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Stripe.js script */}
        <Script src="https://js.stripe.com/v3/" strategy="beforeInteractive" />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="light">
          <ClearStorageListener />
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}


import './globals.css'