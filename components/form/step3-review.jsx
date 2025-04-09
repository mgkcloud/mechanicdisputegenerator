"use client"

import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import { AU_DOCUMENT_TYPES } from "@/lib/document-generator-au"

/**
 * Step 3: Review component
 * @param {Object} props - Component props
 * @param {Object} props.formData - Form data state
 * @param {Array} props.uploadedFiles - Array of uploaded files
 * @param {boolean} props.isGenerating - Whether document is being generated
 * @param {Function} props.handleBack - Function to go back to previous step
 * @param {Function} props.handleNext - Function to proceed to next step
 * @param {Function} props.goToStep - Function to navigate to a specific step
 */
export default function Step3Review({ formData, uploadedFiles, isGenerating, handleBack, handleNext, goToStep }) {
  return (
    <div id="step3Content">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900">Review Your Information</h2>
        <p className="mt-2 text-muted-foreground">
          Please review all details before proceeding to payment and document generation.
        </p>
      </div>

      <div className="mx-auto max-w-4xl">
        {/* Review Summary */}
        <div className="mb-8 rounded-xl border border-border/60 bg-card p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Document Summary</h3>

          <div className="space-y-6">
            {/* Document Type */}
            <div className="rounded-lg bg-muted p-4">
              <h4 className="font-medium">Document Type</h4>
              <p className="mt-1">
                {formData.document_type ? AU_DOCUMENT_TYPES[formData.document_type] : "Not selected"}
              </p>
            </div>

            {/* Your Information */}
            <div className="rounded-lg bg-muted p-4">
              <h4 className="font-medium">Your Information</h4>
              <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Name:</p>
                  <p>{formData.customer_name || "Not provided"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email:</p>
                  <p>{formData.customer_email || "Not provided"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone:</p>
                  <p>{formData.customer_phone || "Not provided"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Address:</p>
                  <p>{formData.customer_address || "Not provided"}</p>
                </div>
              </div>
            </div>

            {/* Mechanic Information */}
            <div className="rounded-lg bg-muted p-4">
              <h4 className="font-medium">Mechanic Information</h4>
              <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Business Name:</p>
                  <p>{formData.mechanic_name || "Not provided"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">ABN:</p>
                  <p>{formData.mechanic_abn || "Not provided"}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm text-muted-foreground">Address:</p>
                  <p>{formData.mechanic_address || "Not provided"}</p>
                </div>
              </div>
            </div>

            {/* Vehicle and Damage Details */}
            <div className="rounded-lg bg-muted p-4">
              <h4 className="font-medium">Vehicle and Damage Details</h4>
              <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Vehicle:</p>
                  <p>{formData.vehicle_details || "Not provided"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Service Date:</p>
                  <p>{formData.service_date || "Not provided"}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm text-muted-foreground">Damage Description:</p>
                  <p>{formData.damage_description || "Not provided"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Repair Cost Estimate:</p>
                  <p>{formData.repair_cost || "Not provided"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Insurance Claim:</p>
                  <p>{formData.insurance_claim === "yes" ? "Yes" : "No"}</p>
                </div>
                {formData.insurance_claim === "yes" && (
                  <>
                    <div>
                      <p className="text-sm text-muted-foreground">Insurance Excess:</p>
                      <p>{formData.insurance_excess || "Not provided"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Claim Number:</p>
                      <p>{formData.insurance_claim_number || "Not provided"}</p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Uploaded Evidence */}
            <div className="rounded-lg bg-muted p-4">
              <h4 className="font-medium">Uploaded Evidence</h4>
              {uploadedFiles.length > 0 ? (
                <div className="mt-2">
                  <p className="text-sm text-muted-foreground">Files Uploaded: {uploadedFiles.length}</p>
                  <ul className="mt-1 ml-5 list-disc space-y-1 text-sm">
                    {uploadedFiles.map((file) => (
                      <li key={file.id}>{file.name}</li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="mt-1 text-sm text-destructive">No files uploaded</p>
              )}
            </div>
          </div>

          {/* Edit Buttons */}
          <div className="mt-6 flex flex-wrap gap-3">
            <Button variant="outline" size="sm" onClick={() => goToStep(1)}>
              Edit Details
            </Button>
            <Button variant="outline" size="sm" onClick={() => goToStep(2)}>
              Edit Evidence
            </Button>
          </div>
        </div>

        {/* Terms and Conditions */}
        <div className="mb-8 rounded-xl border border-border/60 bg-card p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Terms and Conditions</h3>
          <div className="mb-4 rounded-lg bg-muted p-4 text-sm text-muted-foreground">
            <p className="mb-2">By proceeding to payment, you acknowledge that:</p>
            <ul className="ml-5 list-disc space-y-1">
              <li>The information you have provided is accurate and complete.</li>
              <li>The document generated is based on the information you have provided.</li>
              <li>This service provides document templates and is not a substitute for professional legal advice.</li>
              <li>
                You have read and agree to our{" "}
                <a href="#" className="text-primary underline">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="#" className="text-primary underline">
                  Privacy Policy
                </a>
                .
              </li>
            </ul>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="mt-8 flex justify-between">
          <Button onClick={handleBack} variant="outline" size="lg">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Evidence
          </Button>
          <Button onClick={handleNext} size="lg" disabled={isGenerating}>
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Document...
              </>
            ) : (
              <>
                Continue to Payment
                <ChevronRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
