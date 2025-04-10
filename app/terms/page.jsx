import React from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export const metadata = {
  title: "Terms of Service | Mechanic Dispute",
  description: "Terms and conditions for using the Mechanic Dispute resolution service."
}

export default function TermsPage() {
  return (
    <div className="container mx-auto py-12 px-4">
      <div className="mb-8">
        <Link href="/" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Link>
        <h1 className="text-4xl font-bold tracking-tight mb-4">Terms of Service</h1>
        <p className="text-gray-600">Last updated: April 9, 2024</p>
      </div>

      <div className="prose prose-gray max-w-4xl">
        <h2>1. Acceptance of Terms</h2>
        <p>
          By accessing or using the Mechanic Dispute service (the "Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service.
        </p>

        <h2>2. Description of Service</h2>
        <p>
          Mechanic Dispute provides a platform for generating dispute documents related to automotive repair issues. The Service includes document generation, evidence management, and payment processing.
        </p>

        <h2>3. User Accounts</h2>
        <p>
          You are responsible for maintaining the confidentiality of any login information associated with your account. You are fully responsible for all activities that occur under your account.
        </p>

        <h2>4. User Content</h2>
        <p>
          By uploading content to our Service, you grant us a non-exclusive, transferable, sub-licensable, royalty-free, worldwide license to use, modify, and display that content solely for the purpose of providing the Service.
        </p>
        <p>
          You represent and warrant that you own or have the necessary rights to the content you submit, and that your content does not violate the rights of any third party.
        </p>

        <h2>5. Payments and Refunds</h2>
        <p>
          All payments are processed securely through our payment providers. Prices for services are displayed before purchase. Refunds are available in limited circumstances as described in our refund policy.
        </p>

        <h2>6. Disclaimer of Warranties</h2>
        <p>
          THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING, BUT NOT LIMITED TO, IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.
        </p>

        <h2>7. Limitation of Liability</h2>
        <p>
          IN NO EVENT SHALL MECHANIC DISPUTE BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL OR PUNITIVE DAMAGES, INCLUDING WITHOUT LIMITATION, LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING FROM YOUR ACCESS TO OR USE OF OR INABILITY TO ACCESS OR USE THE SERVICE.
        </p>

        <h2>8. Legal Disclaimer</h2>
        <p>
          The information provided by Mechanic Dispute is not legal advice. We are not lawyers, and the documents provided are not a substitute for professional legal advice. Your use of the generated documents is at your own risk.
        </p>

        <h2>9. Indemnification</h2>
        <p>
          You agree to defend, indemnify, and hold harmless Mechanic Dispute and its officers, directors, employees, and agents, from and against any claims, liabilities, damages, losses, and expenses, including, without limitation, reasonable legal fees, arising out of or in any way connected with your access to or use of the Service.
        </p>

        <h2>10. Governing Law</h2>
        <p>
          These Terms shall be governed by the laws of Australia, without regard to its conflict of law provisions. Any dispute arising from these Terms shall be resolved exclusively in the courts of New South Wales, Australia.
        </p>

        <h2>11. Changes to Terms</h2>
        <p>
          We reserve the right to modify these Terms at any time. We will provide notice of any material changes by updating the "Last updated" date at the top of this page. Your continued use of the Service following any changes constitutes your acceptance of the revised Terms.
        </p>

        <h2>12. Contact Information</h2>
        <p>
          If you have any questions about these Terms, please contact us at:
        </p>
        <p>
          Email: support@mechanicdispute.com.au<br />
          Phone: +61 2 1234 5678<br />
          Address: 123 Business Street, Sydney, NSW 2000, Australia
        </p>
      </div>

      <div className="mt-12 border-t pt-8">
        <p className="text-gray-600">
          By using our Service, you acknowledge that you have read and understand these Terms of Service and agree to be bound by them.
        </p>
        <div className="mt-4 flex flex-wrap gap-4">
          <Link href="/privacy" className="text-primary hover:underline">
            Privacy Policy
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