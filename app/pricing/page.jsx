import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CheckCircle, X } from "lucide-react"
import { getBaseUrl, generateOpenGraph, generateTwitterCard } from "@/lib/metadataUtils"
import { generateWebPageSchema, generateJsonLd } from "@/lib/schema"

const pageTitle = "Pricing - Legal Documents for Mechanic Disputes Australia";
const pageDescription = "View our simple, one-time pricing for generating letters of demand and complete packages to resolve mechanic disputes in Australia. No hidden fees.";

export const metadata = {
  title: pageTitle,
  description: pageDescription,
  keywords: ["pricing", "cost", "mechanic dispute documents", "letter of demand price", "legal document generation", "Australia", "VCAT guidance cost"],
  openGraph: generateOpenGraph({
    title: pageTitle,
    description: pageDescription,
    url: `${getBaseUrl()}/pricing`,
    type: 'website'
  }),
  twitter: generateTwitterCard({
    title: pageTitle,
    description: pageDescription
  }),
  jsonLd: generateJsonLd([
    generateWebPageSchema({
      name: pageTitle,
      description: pageDescription,
      url: `${getBaseUrl()}/pricing`,
    })
  ])
}

export default function PricingPage() {
  return (
    <>
      <section className="bg-gradient-hero py-16 md:py-24">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="mb-4 text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">
              Simple, Transparent Pricing
            </h1>
            <p className="mb-8 text-lg text-muted-foreground md:text-xl">
              One-time payment. No subscriptions. No hidden fees.
            </p>
          </div>
        </div>
      </section>

      <section className="container py-16">
        <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3">
          {/* Basic Plan */}
          <div className="pricing-card">
            <h3 className="mb-2 text-xl font-bold text-gray-900">Letter of Demand</h3>
            <p className="mb-6 text-sm text-muted-foreground">Perfect for initial communication with the mechanic</p>
            <div className="mb-6">
              <span className="text-4xl font-bold text-gray-900">$49</span>
              <span className="text-muted-foreground">.99</span>
              <span className="ml-2 text-sm text-muted-foreground">one-time</span>
            </div>
            <ul className="mb-8 space-y-3">
              <li className="flex items-start">
                <CheckCircle className="mr-2 mt-0.5 h-5 w-5 flex-shrink-0 text-success" />
                <span className="text-sm">Professional Letter of Demand</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="mr-2 mt-0.5 h-5 w-5 flex-shrink-0 text-success" />
                <span className="text-sm">Australian Consumer Law references</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="mr-2 mt-0.5 h-5 w-5 flex-shrink-0 text-success" />
                <span className="text-sm">Customized to your situation</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="mr-2 mt-0.5 h-5 w-5 flex-shrink-0 text-success" />
                <span className="text-sm">Instant download (PDF format)</span>
              </li>
              <li className="flex items-start">
                <X className="mr-2 mt-0.5 h-5 w-5 flex-shrink-0 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">VCAT application guidance</span>
              </li>
            </ul>
            <Button className="w-full" asChild>
              <Link href="/">Generate Letter</Link>
            </Button>
          </div>

          {/* Standard Plan */}
          <div className="pricing-card popular">
            <div className="popular-badge">Most Popular</div>
            <h3 className="mb-2 text-xl font-bold text-gray-900">Complete Package</h3>
            <p className="mb-6 text-sm text-muted-foreground">Comprehensive solution for resolving your dispute</p>
            <div className="mb-6">
              <span className="text-4xl font-bold text-gray-900">$79</span>
              <span className="text-muted-foreground">.99</span>
              <span className="ml-2 text-sm text-muted-foreground">one-time</span>
            </div>
            <ul className="mb-8 space-y-3">
              <li className="flex items-start">
                <CheckCircle className="mr-2 mt-0.5 h-5 w-5 flex-shrink-0 text-success" />
                <span className="text-sm">Professional Letter of Demand</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="mr-2 mt-0.5 h-5 w-5 flex-shrink-0 text-success" />
                <span className="text-sm">Australian Consumer Law references</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="mr-2 mt-0.5 h-5 w-5 flex-shrink-0 text-success" />
                <span className="text-sm">Customized to your situation</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="mr-2 mt-0.5 h-5 w-5 flex-shrink-0 text-success" />
                <span className="text-sm">Instant download (PDF format)</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="mr-2 mt-0.5 h-5 w-5 flex-shrink-0 text-success" />
                <span className="text-sm">VCAT application guidance</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="mr-2 mt-0.5 h-5 w-5 flex-shrink-0 text-success" />
                <span className="text-sm">Follow-up letter template</span>
              </li>
            </ul>
            <Button className="w-full" variant="primary" asChild>
              <Link href="/">Choose Package</Link>
            </Button>
          </div>

          {/* Premium Plan */}
          <div className="pricing-card">
            <h3 className="mb-2 text-xl font-bold text-gray-900">Business Package</h3>
            <p className="mb-6 text-sm text-muted-foreground">For businesses dealing with mechanic disputes</p>
            <div className="mb-6">
              <span className="text-4xl font-bold text-gray-900">$129</span>
              <span className="text-muted-foreground">.99</span>
              <span className="ml-2 text-sm text-muted-foreground">one-time</span>
            </div>
            <ul className="mb-8 space-y-3">
              <li className="flex items-start">
                <CheckCircle className="mr-2 mt-0.5 h-5 w-5 flex-shrink-0 text-success" />
                <span className="text-sm">All Complete Package features</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="mr-2 mt-0.5 h-5 w-5 flex-shrink-0 text-success" />
                <span className="text-sm">Business-specific legal references</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="mr-2 mt-0.5 h-5 w-5 flex-shrink-0 text-success" />
                <span className="text-sm">Priority support</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="mr-2 mt-0.5 h-5 w-5 flex-shrink-0 text-success" />
                <span className="text-sm">Multiple document formats</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="mr-2 mt-0.5 h-5 w-5 flex-shrink-0 text-success" />
                <span className="text-sm">Editable document versions</span>
              </li>
            </ul>
            <Button className="w-full" asChild>
              <Link href="/">Get Business Package</Link>
            </Button>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mx-auto mt-16 max-w-3xl">
          <h2 className="mb-8 text-center text-2xl font-bold text-gray-900">Frequently Asked Questions</h2>

          <div className="space-y-6">
            <div className="rounded-lg border border-border/60 bg-card p-6">
              <h3 className="mb-2 text-lg font-medium text-gray-900">Are there any recurring fees?</h3>
              <p className="text-muted-foreground">
                No, all our packages are one-time payments. You pay once and get access to your document permanently.
              </p>
            </div>

            <div className="rounded-lg border border-border/60 bg-card p-6">
              <h3 className="mb-2 text-lg font-medium text-gray-900">Can I get a refund if I'm not satisfied?</h3>
              <p className="text-muted-foreground">
                Yes, we offer a 14-day money-back guarantee if you're not satisfied with the document generated.
              </p>
            </div>

            <div className="rounded-lg border border-border/60 bg-card p-6">
              <h3 className="mb-2 text-lg font-medium text-gray-900">How soon can I access my document?</h3>
              <p className="text-muted-foreground">
                Your document is generated instantly after payment and available for immediate download.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-muted py-16">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-4 text-2xl font-bold text-gray-900">Still have questions?</h2>
            <p className="mb-8 text-muted-foreground">
              Our team is here to help you choose the right package for your needs.
            </p>
            {/* <Button variant="outline" asChild>
              <Link href="/contact">Contact Us</Link>
            </Button> */}
          </div>
        </div>
      </section>
    </>
  )
}
