"use client"

import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Info, Loader2, Shield } from "lucide-react"

/**
 * Step 4: Payment component
 * @param {Object} props - Component props
 * @param {Object} props.documentData - Generated document data
 * @param {boolean} props.isProcessingPayment - Whether payment is being processed
 * @param {Function} props.handleBack - Function to go back to previous step
 * @param {Function} props.handleNext - Function to proceed to next step
 * @param {Function} props.formatCurrency - Function to format currency for display
 */
export default function Step4Payment({ documentData, isProcessingPayment, handleBack, handleNext, formatCurrency }) {
  return (
    <div id="step4Content">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900">Payment</h2>
        <p className="mt-2 text-muted-foreground">
          Complete your payment to generate and download your legal document.
        </p>
      </div>

      <div className="mx-auto max-w-2xl">
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
            <div className="payment-row">
              <span>Document Fee</span>
              <span>{formatCurrency(49.99)}</span>
            </div>
            <div className="payment-row">
              <span>GST (10%)</span>
              <span>{formatCurrency(49.99 * 0.1)}</span>
            </div>
            <div className="payment-total">
              <span>Total</span>
              <span>{formatCurrency(49.99 * 1.1)}</span>
            </div>
          </div>
        </div>

        {/* Payment Form */}
        <div className="mb-8 rounded-xl border border-border/60 bg-card p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Payment Details</h3>

          {process.env.BYPASS_PAYMENT === "true" ? (
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
          <Button onClick={handleNext} size="lg" disabled={isProcessingPayment}>
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
  )
}
