import React from "react"
import Link from "next/link"
import { ArrowLeft, FileText, Upload, CheckCircle, CreditCard, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata = {
  title: "How It Works | Mechanic Dispute",
  description: "Learn how our streamlined process helps you resolve mechanic disputes easily and effectively."
}

export default function HowItWorksPage() {
  const steps = [
    {
      id: 1,
      title: "Enter Details",
      icon: FileText,
      description: "Fill out a simple form with your personal information and details about your mechanic dispute.",
    },
    {
      id: 2,
      title: "Upload Evidence",
      icon: Upload,
      description: "Upload photos, documents, or any evidence related to your dispute to strengthen your case.",
    },
    {
      id: 3,
      title: "Review",
      icon: CheckCircle,
      description: "Review all the information and evidence you've provided to ensure accuracy.",
    },
    {
      id: 4,
      title: "Payment",
      icon: CreditCard,
      description: "Make a secure payment to generate your personalized dispute document.",
    },
    {
      id: 5,
      title: "Download",
      icon: Download,
      description: "Download your professionally formatted dispute document, ready to use.",
    },
  ]

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="mb-8">
        <Link href="/" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Link>
        <h1 className="text-4xl font-bold tracking-tight mb-4">How It Works</h1>
        <p className="text-xl text-gray-600 max-w-3xl">
          Our simple 5-step process makes resolving mechanic disputes straightforward and stress-free.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 mb-12">
        {steps.map((step) => (
          <Card key={step.id} className="flex flex-col">
            <CardHeader>
              <div className="mb-2 flex items-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary mr-3">
                  <step.icon className="h-5 w-5" />
                </div>
                <CardTitle className="text-xl">Step {step.id}: {step.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="flex-grow">
              <CardDescription className="text-base">{step.description}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="bg-gray-50 rounded-lg p-8 mb-12">
        <h2 className="text-2xl font-bold mb-4">Why Use Our Service?</h2>
        <ul className="space-y-3 list-disc pl-5 mb-6">
          <li>Professional documentation that stands up to scrutiny</li>
          <li>Easy-to-use platform that guides you through the entire process</li>
          <li>Save time and reduce stress compared to handling it yourself</li>
          <li>Expert guidance on best practices for dispute resolution</li>
          <li>Secure and confidential handling of your information</li>
        </ul>
        <Button asChild size="lg">
          <Link href="/">Start Your Dispute Now</Link>
        </Button>
      </div>

      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Still Have Questions?</h2>
        <p className="mb-6">Check our FAQ section for answers to common questions or contact us directly.</p>
        <div className="flex justify-center gap-4 flex-wrap">
          <Button asChild variant="outline">
            <Link href="/faq">View FAQ</Link>
          </Button>
          <Button asChild>
            <Link href="/contact">Contact Us</Link>
          </Button>
        </div>
      </div>
    </div>
  )
} 