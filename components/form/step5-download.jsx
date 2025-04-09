"use client"

import { Button } from "@/components/ui/button"
import { CheckCircle, Download, Info } from "lucide-react"

/**
 * Step 5: Download component
 * @param {Object} props - Component props
 * @param {Object} props.documentData - Generated document data
 * @param {Function} props.handleStartOver - Function to reset the form
 */
export default function Step5Download({ documentData, handleStartOver }) {
  return (
    <div id="step5Content">
      <div className="mx-auto max-w-2xl text-center">
        <div className="mb-6 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/20 text-success">
            <CheckCircle className="h-8 w-8" />
          </div>
        </div>
        <h2 className="mb-3 text-2xl font-bold text-gray-900">Payment Successful!</h2>
        <p className="mb-8 text-muted-foreground">
          Your document has been generated successfully and is ready for download.
        </p>

        <div className="mb-8 rounded-xl border border-border/60 bg-card p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Your Document</h3>
          <p className="mb-4 text-sm text-muted-foreground">Download your professionally generated document below.</p>
          <Button
            size="lg"
            className="w-full"
            onClick={() => {
              if (documentData?.filename) {
                window.open(`/api/documents/${documentData.filename}?download=true`, "_blank")
              }
            }}
          >
            <Download className="mr-2 h-5 w-5" />
            Download PDF Document
          </Button>
          <p className="mt-4 text-xs text-muted-foreground">
            A copy of your document has also been sent to your email address.
          </p>
        </div>

        <div className="mb-8 rounded-xl border border-border/60 bg-card p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Document Details</h3>
          <div className="space-y-3 text-left">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Document Type:</span>
              <span className="font-medium">{documentData?.documentType || "Legal Document"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Generated On:</span>
              <span className="font-medium">{new Date().toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Reference Number:</span>
              <span className="font-medium">{documentData?.filename || "DOC12345678"}</span>
            </div>
          </div>
          <div className="mt-4 rounded-lg bg-muted p-3 text-sm">
            <p className="flex items-center">
              <Info className="mr-2 h-4 w-4 text-primary" />
              Your document is permanently stored and can be accessed at any time.
            </p>
          </div>
        </div>

        <div className="mt-8 rounded-xl border border-border/60 bg-card p-6 shadow-sm">
          <h3 className="mb-2 text-lg font-semibold text-gray-900">What's Next?</h3>
          <ol className="mb-4 list-inside list-decimal space-y-2 text-left text-sm text-muted-foreground">
            <li>Review your document carefully</li>
            <li>Print or save a copy for your records</li>
            <li>Send the document to the mechanic via registered mail or email</li>
            <li>Keep track of all communication with the mechanic</li>
            <li>Follow up after the specified response deadline</li>
          </ol>
          <Button variant="outline" onClick={handleStartOver} className="mt-4 w-full">
            Start a New Dispute
          </Button>
        </div>
      </div>
    </div>
  )
}
