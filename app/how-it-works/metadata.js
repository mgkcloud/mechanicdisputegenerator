import { 
  generateWebPageSchema, 
  generateHowToSchema,
  generateServiceSchema,
  generateJsonLd 
} from "@/lib/schema";

// Define steps for the how-to schema
const howToSteps = [
  {
    name: "Enter Details",
    text: "Fill out a simple form with your personal information and details about your mechanic dispute.",
    url: "https://mechanicdispute.com.au/#step1",
  },
  {
    name: "Upload Evidence",
    text: "Upload photos, documents, or any evidence related to your dispute to strengthen your case.",
    url: "https://mechanicdispute.com.au/#step2",
  },
  {
    name: "Review",
    text: "Review all the information and evidence you've provided to ensure accuracy.",
    url: "https://mechanicdispute.com.au/#step3",
  },
  {
    name: "Payment",
    text: "Make a secure payment to generate your personalized dispute document.",
    url: "https://mechanicdispute.com.au/#step4",
  },
  {
    name: "Download",
    text: "Download your professionally formatted dispute document, ready to use.",
    url: "https://mechanicdispute.com.au/#step5",
  }
];

// Generate the HowTo schema
const howToSchema = generateHowToSchema(
  {
    name: "How to Resolve a Mechanic Dispute in Australia",
    description: "Step-by-step guide to resolving a dispute with a mechanic in Australia using our document generation service.",
    totalTime: "PT30M",
    estimatedCost: {
      currency: "AUD",
      value: "79.99"
    },
    supply: [
      "Vehicle repair documentation",
      "Repair invoices or receipts",
      "Photos of vehicle damage or poor repairs",
      "Communications with the mechanic"
    ],
    tool: [
      "Computer or mobile device",
      "Internet connection",
      "Credit card for payment"
    ]
  },
  howToSteps
);

// Generate the Service schema
const serviceSchema = generateServiceSchema({
  name: "Mechanic Dispute Resolution Document Service",
  description: "Professional document generation service to help resolve disputes with mechanics in Australia.",
  url: "https://mechanicdispute.com.au/how-it-works",
  areaServed: "Australia",
  serviceType: "Legal Document Generation",
});

// Generate the WebPage schema
const webPageSchema = generateWebPageSchema({
  name: "How It Works | Australian Mechanic Dispute Resolution",
  description: "Learn how our streamlined process helps you resolve mechanic disputes easily and effectively.",
  url: "https://mechanicdispute.com.au/how-it-works",
  datePublished: "2023-01-01T00:00:00Z",
  dateModified: new Date().toISOString(),
});

// Export the metadata
export default {
  title: "How It Works | Australian Mechanic Dispute Resolution",
  description: "Learn how our streamlined process helps you resolve mechanic disputes easily and effectively.",
  metadataBase: new URL("https://mechanicdispute.com.au"),
  alternates: {
    canonical: "/how-it-works",
  },
  openGraph: {
    title: "How It Works | Australian Mechanic Dispute Resolution",
    description: "Learn how our streamlined process helps you resolve mechanic disputes easily and effectively.",
    url: "https://mechanicdispute.com.au/how-it-works",
    siteName: "Australian Mechanic Dispute Resolution",
    locale: "en_AU",
    type: "website",
  },
  jsonLd: generateJsonLd([howToSchema, serviceSchema, webPageSchema])
};