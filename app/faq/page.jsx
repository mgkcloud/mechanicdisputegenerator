"use client"

import React from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"

export default function FAQPage() {
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
  ]

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="mb-8">
        <Link href="/" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Link>
        <h1 className="text-4xl font-bold tracking-tight mb-4">Frequently Asked Questions</h1>
        <p className="text-xl text-gray-600 max-w-3xl">
          Find answers to common questions about our mechanic dispute resolution service.
        </p>
      </div>

      <div className="max-w-3xl mx-auto mb-12">
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
              <AccordionContent>
                <p className="text-gray-700">{faq.answer}</p>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      <div className="text-center max-w-3xl mx-auto bg-gray-50 rounded-lg p-8">
        <h2 className="text-2xl font-bold mb-4">Still Have Questions?</h2>
        <p className="mb-6">
          Can't find the answer you're looking for? Please contact our customer support team.
        </p>
        <Button asChild>
          <Link href="/contact">Contact Us</Link>
        </Button>
      </div>
    </div>
  )
} 