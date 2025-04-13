import { 
  generateOrganizationSchema, 
  generateServiceSchema, 
  generateWebPageSchema, 
  generateJsonLd 
} from "@/lib/schema";

// Generate the organization schema for the entire site
const organizationSchema = generateOrganizationSchema({
  name: "Australian Mechanic Dispute Resolution",
  url: "https://mechanicdispute.com.au",
  logo: "https://mechanicdispute.com.au/logo.png",
  sameAs: [
    "https://facebook.com/mechanicdispute",
    "https://twitter.com/mechanicdispute",
    "https://linkedin.com/company/mechanicdispute"
  ],
  description: "Professional legal document generation service for resolving mechanic disputes in Australia."
});

// Generate the service schema for the mechanic dispute resolution service
const serviceSchema = generateServiceSchema({
  name: "Mechanic Dispute Resolution Service",
  description: "Professional document generation service for resolving disputes with mechanics in Australia.",
  url: "https://mechanicdispute.com.au",
  areaServed: "Australia",
  serviceType: "Legal Document Generation",
});

// Generate the webpage schema for the homepage
const webPageSchema = generateWebPageSchema({
  name: "Australian Mechanic Dispute Resolution | Home",
  description: "Generate professional legal documents for resolving disputes with mechanics in Australia",
  url: "https://mechanicdispute.com.au",
  datePublished: "2023-01-01T00:00:00Z",
  dateModified: new Date().toISOString(),
});

// Metadata for the homepage
export default {
  title: "Australian Mechanic Dispute Resolution",
  description: "Generate professional legal documents for resolving disputes with mechanics in Australia",
  metadataBase: new URL("https://mechanicdispute.com.au"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Australian Mechanic Dispute Resolution",
    description: "Generate professional legal documents for resolving disputes with mechanics in Australia",
    url: "https://mechanicdispute.com.au",
    siteName: "Australian Mechanic Dispute Resolution",
    locale: "en_AU",
    type: "website",
    images: [
      {
        url: "https://mechanicdispute.com.au/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Australian Mechanic Dispute Resolution",
      }
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Australian Mechanic Dispute Resolution",
    description: "Generate professional legal documents for resolving disputes with mechanics in Australia",
    images: ["https://mechanicdispute.com.au/og-image.jpg"],
  },
  jsonLd: generateJsonLd([organizationSchema, serviceSchema, webPageSchema])
}; 