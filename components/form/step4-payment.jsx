"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Info, Loader2, Shield } from "lucide-react"

/**
 * Step 4: Enhanced Payment component with document preview
 * @param {Object} props - Component props
 * @param {Object} props.documentData - Generated document data
 * @param {boolean} props.isProcessingPayment - Whether payment is being processed
 * @param {Function} props.handleBack - Function to go back to previous step
 * @param {Function} props.handleNext - Function to proceed to next step
 * @param {Function} props.formatCurrency - Function to format currency for display
 * @param {boolean} props.paymentSuccess - Whether payment was successful
 */
export default function Step4Payment({ 
  documentData, 
  isProcessingPayment, 
  handleBack, 
  handleNext, 
  formatCurrency,
  paymentSuccess = false
}) {
  const [documentHtml, setDocumentHtml] = useState(null)
  const [showFullDocument, setShowFullDocument] = useState(false)

  // Fetch the HTML document for preview
  useEffect(() => {
    if (documentData?.filename) {
      fetchDocumentHtml(documentData.filename)
    }
  }, [documentData])

  // Update document visibility when payment is successful
  useEffect(() => {
    if (paymentSuccess) {
      setShowFullDocument(true)
    }
  }, [paymentSuccess])

  // Function to fetch the document HTML
  const fetchDocumentHtml = async (filename) => {
    try {
      const response = await fetch(`/documents/view/${filename}`)
      if (!response.ok) {
        throw new Error("Failed to fetch document preview")
      }
      const htmlContent = await response.text()
      setDocumentHtml(htmlContent)
    } catch (error) {
      console.error("Error fetching document preview:", error)
    }
  }

  // Handle successful payment completion
  const completePayment = () => {
    setShowFullDocument(true)
    handleNext()
  }

  return (
    <div id="step4Content" className="relative min-h-[80vh] w-full document-preview">
      {/* Document Preview (Background) */}
      {documentHtml && (
        <div 
          className={`absolute inset-0 w-full transition-all duration-500 ease-in-out ${
            showFullDocument ? "z-50 document-focus document-reveal" : "z-0 document-blur document-preview-floating"
          }`}
        >
          <div className={`relative w-full mx-auto ${showFullDocument ? "" : "transform perspective-1000"}`}>
            <div 
              className="bg-white rounded-lg shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
              dangerouslySetInnerHTML={{ 
                __html: documentHtml 
              }}
            />
          </div>
        </div>
      )}

      {/* Payment Modal (Foreground) */}
      <div className={`relative z-10 transition-all duration-500 ease-in-out ${
        showFullDocument ? "opacity-0 pointer-events-none payment-modal-exit" : "opacity-100 pointer-events-auto"
      }`}>
        <div className="mx-auto max-w-2xl bg-white/95 backdrop-blur-sm rounded-xl p-8 shadow-xl border border-border/60 payment-card">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900">Complete Payment</h2>
            <p className="mt-2 text-muted-foreground">
              Your document is ready! Complete the payment to access the full document.
            </p>
          </div>

          {/* Document Summary */}
          <div className="mb-8 rounded-xl border border-border/60 bg-card p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">Document Summary</h3>

            <div className="mb-6 rounded-lg bg-muted p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">{documentData?.documentType || "Legal Document"}</h4>
                  <p className="text-sm text-muted-foreground">Professional document tailored to your situation</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold">{formatCurrency(49.99)}</p>
                </div>
              </div>
            </div>

            {/* Payment Summary */}
            <div className="space-y-2">
              <div className="flex justify-between py-1">
                <span>Document Fee</span>
                <span>{formatCurrency(49.99)}</span>
              </div>
              <div className="flex justify-between py-1">
                <span>GST (10%)</span>
                <span>{formatCurrency(49.99 * 0.1)}</span>
              </div>
              <div className="flex justify-between py-1 font-semibold border-t border-border/60 mt-2 pt-2">
                <span>Total</span>
                <span>{formatCurrency(49.99 * 1.1)}</span>
              </div>
            </div>
          </div>

          {/* Payment Form */}
          <div className="mb-8 rounded-xl border border-border/60 bg-card p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">Payment Details</h3>

            {process.env.NEXT_PUBLIC_BYPASS_PAYMENT === "true" ? (
              <div className="rounded-lg bg-muted p-4 text-sm">
                <p className="flex items-center">
                  <Info className="mr-2 h-4 w-4 text-primary" />
                  Payment is bypassed in development mode. Click "Complete Payment" to proceed.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  You will be redirected to our secure payment processor to complete your payment.
                </p>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Shield className="mr-2 h-4 w-4" />
                  <span>Your payment information is secure and encrypted</span>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="mt-8 flex justify-between">
            <Button onClick={handleBack} variant="outline" size="lg">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to Review
            </Button>
            <Button onClick={process.env.NEXT_PUBLIC_BYPASS_PAYMENT === "true" ? completePayment : handleNext} size="lg" disabled={isProcessingPayment}>
              {isProcessingPayment ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing Payment...
                </>
              ) : (
                <>
                  Complete Payment
                  <ChevronRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
