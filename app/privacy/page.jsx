import React from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { getBaseUrl, generateOpenGraph, generateTwitterCard } from "@/lib/metadataUtils"
import { generateWebPageSchema, generateJsonLd } from "@/lib/schema"

const pageTitle = "Privacy Policy | Australian Mechanic Dispute Resolution";
const pageDescription = "Review the Mechanic Dispute Resolution privacy policy. Learn how we collect, use, store, and protect your personal information when you use our service.";

export const metadata = {
  title: pageTitle,
  description: pageDescription,
  keywords: ["privacy policy", "data protection", "personal information", "data security", "mechanic dispute service privacy", "Australia", "user privacy"],
  openGraph: generateOpenGraph({
    title: pageTitle,
    description: pageDescription,
    url: `${getBaseUrl()}/privacy`,
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
      url: `${getBaseUrl()}/privacy`,
    })
  ])
}

export default function PrivacyPage() {
  return (
    <div className="container mx-auto py-12 px-4">
      <div className="mb-8">
        <Link href="/" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Link>
        <h1 className="text-4xl font-bold tracking-tight mb-4">Privacy Policy</h1>
        <p className="text-gray-600">Last updated: April 9, 2024</p>
      </div>

      <div className="prose prose-gray max-w-4xl">
        <h2>Introduction</h2>
        <p>
          At Mechanic Dispute, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our service.
        </p>
        <p>
          Please read this Privacy Policy carefully. By accessing or using our service, you acknowledge that you have read, understood, and agree to be bound by all the terms of this Privacy Policy.
        </p>

        <h2>Information We Collect</h2>
        <p>We may collect the following types of information:</p>
        <h3>Personal Information</h3>
        <ul>
          <li>Name, email address, and contact details</li>
          <li>Billing information and payment details</li>
          <li>Information about your dispute, including evidence files you upload</li>
          <li>Communication records when you contact us</li>
        </ul>

        <h3>Automatically Collected Information</h3>
        <ul>
          <li>Device information (browser type, IP address, device type)</li>
          <li>Usage data (pages visited, time spent, actions taken)</li>
          <li>Cookies and similar technologies</li>
        </ul>

        <h2>How We Use Your Information</h2>
        <p>We use the information we collect to:</p>
        <ul>
          <li>Provide, maintain, and improve our services</li>
          <li>Process transactions and send related information</li>
          <li>Generate dispute documents based on your inputs</li>
          <li>Respond to your inquiries and provide customer support</li>
          <li>Send administrative information, updates, and service notices</li>
          <li>Protect against fraudulent, unauthorized, or illegal activity</li>
          <li>Conduct research and analysis to improve our service</li>
        </ul>

        <h2>Data Storage and Security</h2>
        <p>
          Your data is stored securely on Cloudflare's infrastructure and in our AWS S3 storage. We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
        </p>
        <p>
          While we strive to use commercially acceptable means to protect your information, no method of transmission over the internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
        </p>

        <h2>Data Retention</h2>
        <p>
          We retain your personal information for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law. We will securely delete your information when it is no longer needed.
        </p>

        <h2>Sharing Your Information</h2>
        <p>We may share your information with:</p>
        <ul>
          <li>Service providers who perform services on our behalf</li>
          <li>Payment processors for transaction processing</li>
          <li>Professional advisors, such as lawyers and accountants</li>
          <li>Law enforcement or other authorities when required by law</li>
        </ul>
        <p>
          We do not sell your personal information to third parties.
        </p>

        <h2>Your Privacy Rights</h2>
        <p>Depending on your location, you may have the right to:</p>
        <ul>
          <li>Access the personal information we hold about you</li>
          <li>Correct inaccurate or incomplete information</li>
          <li>Request deletion of your personal information</li>
          <li>Restrict or object to certain processing of your data</li>
          <li>Request a copy of your information in a structured, machine-readable format</li>
          <li>Withdraw consent where processing is based on consent</li>
        </ul>
        <p>
          To exercise these rights, please contact us using the information provided in the "Contact Us" section.
        </p>

        <h2>Children's Privacy</h2>
        <p>
          Our service is not directed to individuals under 18 years of age, and we do not knowingly collect personal information from children. If you become aware that a child has provided us with personal information, please contact us immediately.
        </p>

        <h2>Changes to This Privacy Policy</h2>
        <p>
          We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date. You are advised to review this Privacy Policy periodically for any changes.
        </p>

        <h2>Contact Us</h2>
        <p>
          If you have any questions about this Privacy Policy, please contact us at:
        </p>
        <p>
          Email: privacy@mechanicdispute.com.au<br />
         </p>
      </div>

      <div className="mt-12 border-t pt-8">
        <div className="flex flex-wrap gap-4">
          <Link href="/terms" className="text-primary hover:underline">
            Terms of Service
          </Link>
          <Link href="/disclaimer" className="text-primary hover:underline">
            Disclaimer
          </Link>
          <Link href="/contact" className="text-primary hover:underline">
            Contact Us
          </Link>
        </div>
      </div>
    </div>
  )
} 