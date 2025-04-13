import { 
  generateFAQPageSchema,
  generateWebPageSchema, 
  generateJsonLd 
} from "@/lib/schema";

// Define the FAQs for the page - must match the actual content shown on the page
const faqs = [
  {
    question: "What types of mechanic disputes can your service help with?",
    answer: "Our service can help with most types of mechanic disputes, including issues with repairs, overcharging, unauthorized work, warranty disputes, and quality of service concerns. If you're unsure whether your specific situation is covered, please contact us for guidance."
  },
  {
    question: "How much does it cost to use your service?",
    answer: "Our service has a straightforward fee structure that you'll see before finalizing your document. The cost covers creating a professional dispute document tailored to your specific situation. Visit our pricing page for current rates."
  },
  {
    question: "How quickly can I get my dispute document?",
    answer: "Once you complete the process and make payment, your document is generated instantly and available for immediate download. The entire process from start to finish typically takes less than 30 minutes, depending on how quickly you can provide the necessary information and documentation."
  },
  {
    question: "Do I need to provide evidence for my dispute?",
    answer: "Yes, providing evidence strengthens your case significantly. This could include photos of vehicle damage or poor repairs, copies of invoices or receipts, written communication with the mechanic, warranty documents, or expert opinions. Our platform makes it easy to upload and organize this evidence."
  },
  {
    question: "Is my information secure?",
    answer: "Absolutely. We take data security very seriously. All information is encrypted and stored securely according to industry best practices. Your personal information will never be sold or shared with third parties without your explicit consent."
  },
  {
    question: "Can I edit my document after it's generated?",
    answer: "Once generated, the document is provided in a downloadable format. While we don't provide an online editing tool, you can download and make edits using your own word processing software if needed."
  },
  {
    question: "What happens after I download my dispute document?",
    answer: "After downloading your document, you should send it to the mechanic or repair shop according to the guidance provided. The document includes clear instructions on next steps and what to expect. If you need additional support, our customer service team is available to help."
  },
  {
    question: "Is there a guarantee that my dispute will be resolved?",
    answer: "While we provide professional, well-crafted dispute documents that significantly improve your chances of resolution, we cannot guarantee specific outcomes as each situation is unique. Success depends on factors like the strength of your case, evidence provided, and the responsiveness of the other party."
  },
  {
    question: "Can I use your service if I've already started a dispute process?",
    answer: "Yes, our service can be useful even if you've already begun the dispute process. A professionally prepared document can help clarify your position and potentially expedite resolution, especially if initial attempts haven't been successful."
  },
  {
    question: "Do you offer refunds?",
    answer: "We offer refunds in certain situations, such as if there was a technical error that prevented document generation. Please refer to our terms of service for detailed information about our refund policy."
  }
];

// Generate the FAQPage schema
const faqPageSchema = generateFAQPageSchema(faqs);

// Generate the WebPage schema
const webPageSchema = generateWebPageSchema({
  name: "Frequently Asked Questions | Australian Mechanic Dispute Resolution",
  description: "Find answers to common questions about our mechanic dispute resolution service.",
  url: "https://mechanicdispute.com.au/faq",
  datePublished: "2023-01-01T00:00:00Z",
  dateModified: new Date().toISOString(),
});

// Export the metadata
export default {
  title: "Frequently Asked Questions | Australian Mechanic Dispute Resolution",
  description: "Find answers to common questions about our mechanic dispute resolution service.",
  metadataBase: new URL("https://mechanicdispute.com.au"),
  alternates: {
    canonical: "/faq",
  },
  openGraph: {
    title: "Frequently Asked Questions | Australian Mechanic Dispute Resolution",
    description: "Find answers to common questions about our mechanic dispute resolution service.",
    url: "https://mechanicdispute.com.au/faq",
    siteName: "Australian Mechanic Dispute Resolution",
    locale: "en_AU",
    type: "website",
  },
  jsonLd: generateJsonLd([faqPageSchema, webPageSchema])
};