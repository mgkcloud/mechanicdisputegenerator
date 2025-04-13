import { 
  generateWebPageSchema, 
  generateServiceSchema,
  generateOfferSchema,
  generateJsonLd 
} from "@/lib/schema";

// Generate the WebPage schema
const webPageSchema = generateWebPageSchema({
  name: "Pricing | Australian Mechanic Dispute Resolution",
  description: "Simple, transparent pricing for our legal document generation service.",
  url: "https://mechanicdispute.com.au/pricing",
  datePublished: "2023-01-01T00:00:00Z",
  dateModified: new Date().toISOString(),
});

// Generate the Service schema
const serviceSchema = generateServiceSchema({
  name: "Mechanic Dispute Resolution Document Service",
  description: "Professional document generation service to help resolve disputes with mechanics in Australia.",
  url: "https://mechanicdispute.com.au/pricing",
  areaServed: "Australia",
  serviceType: "Legal Document Generation",
});

// Generate individual offer schemas for each pricing tier
const basicOfferSchema = generateOfferSchema({
  name: "Letter of Demand",
  description: "Professional Letter of Demand for mechanic disputes with Australian Consumer Law references.",
  price: "49.99",
  priceCurrency: "AUD",
  url: "https://mechanicdispute.com.au/pricing#basic",
  validFrom: "2023-01-01T00:00:00Z",
});

const standardOfferSchema = generateOfferSchema({
  name: "Complete Package",
  description: "Comprehensive solution for resolving mechanic disputes including Letter of Demand, follow-up templates, and VCAT application guidance.",
  price: "79.99",
  priceCurrency: "AUD",
  url: "https://mechanicdispute.com.au/pricing#standard",
  validFrom: "2023-01-01T00:00:00Z",
});

const premiumOfferSchema = generateOfferSchema({
  name: "Business Package",
  description: "Advanced document package for businesses dealing with mechanic disputes, including business-specific legal references and multiple document formats.",
  price: "129.99",
  priceCurrency: "AUD",
  url: "https://mechanicdispute.com.au/pricing#premium",
  validFrom: "2023-01-01T00:00:00Z",
});

// Export the metadata
export default {
  title: "Pricing | Australian Mechanic Dispute Resolution",
  description: "Simple, transparent pricing for our legal document generation service.",
  metadataBase: new URL("https://mechanicdispute.com.au"),
  alternates: {
    canonical: "/pricing",
  },
  openGraph: {
    title: "Pricing | Australian Mechanic Dispute Resolution",
    description: "Simple, transparent pricing for our legal document generation service.",
    url: "https://mechanicdispute.com.au/pricing",
    siteName: "Australian Mechanic Dispute Resolution",
    locale: "en_AU",
    type: "website",
  },
  jsonLd: generateJsonLd([
    webPageSchema, 
    serviceSchema, 
    basicOfferSchema, 
    standardOfferSchema, 
    premiumOfferSchema
  ])
}; 