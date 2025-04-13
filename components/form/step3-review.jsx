"use client"

import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import { AU_DOCUMENT_TYPES } from "@/lib/constants.js"

// Check if we're running on the server
const isServer = typeof window === 'undefined';

// Helper function to safely access nested properties for display
const getDisplayValue = (obj, path, defaultValue = "Not provided") => {
  const value = path.split('.').reduce((acc, key) => (acc && acc[key] !== undefined && acc[key] !== null) ? acc[key] : undefined, obj);
  // Handle empty strings, null, undefined. Allow 0.
  if (value === undefined || value === null || value === '') {
      return defaultValue;
  }
  // Handle boolean values
  if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
  }
  // Format numbers (like currency) - assuming a basic format
  if (typeof value === 'number') {
       // Basic currency format, consider using a dedicated formatter if needed
       if (path.toLowerCase().includes('amount')) {
           return `$${value.toFixed(2)}`;
       }
       return value.toString(); 
  }
  // Handle date strings - assumes YYYY-MM-DD
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
      try {
        return new Date(value + 'T00:00:00').toLocaleDateString('en-AU'); // Adjust locale if needed
      } catch (e) { return value; } // Fallback to original string if date parsing fails
  }
  return value;
};

// Map demand type keys to readable labels
const demandTypeLabels = {
    fullRepairCost: "Pay full cost of repairs",
    excessReimbursement: "Reimburse insurance excess",
    other: "Other (Specified)"
};

/**
 * Step 3: Review component
 * @param {Object} props - Component props
 * @param {Object} props.formData - Form data state
 * @param {Array} props.uploadedFiles - Array of uploaded files
 * @param {boolean} props.isGenerating - Whether document is being generated
 * @param {Function} props.handleBack - Function to go back to previous step
 * @param {Function} props.handleNext - Function to proceed to next step
 * @param {Function} props.goToStep - Function to navigate to a specific step (1 or 2)
 */
export default function Step3Review({ formData, uploadedFiles, isGenerating, handleBack, handleNext, goToStep }) {
  // During server-side rendering, return a minimal placeholder
  if (isServer) {
    return (
      <div className="space-y-6">
        <div className="text-center py-6">
          <h2 className="text-xl font-semibold">Review Details</h2>
          <p className="text-muted-foreground">Loading review information...</p>
        </div>
      </div>
    );
  }

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

            {/* State/Territory */}
            <div className="rounded-lg bg-muted p-4">
                <h4 className="font-medium">State/Territory</h4>
                <p className="mt-1">{getDisplayValue(formData, 'state')}</p>
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
                  <p className="text-sm text-muted-foreground">Phone (Optional):</p>
                  <p>{getDisplayValue(formData, 'customer_phone')}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Address (Optional):</p>
                  <p>{getDisplayValue(formData, 'customer_address')}</p>
                </div>
              </div>
            </div>

            {/* Mechanic Information */}
            <div className="rounded-lg bg-muted p-4">
              <h4 className="font-medium">Mechanic Information</h4>
              <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Business Name:</p>
                  <p>{getDisplayValue(formData, 'mechanic_name')}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">ABN (Optional):</p>
                  <p>{getDisplayValue(formData, 'mechanic_abn')}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm text-muted-foreground">Address:</p>
                  <p>{getDisplayValue(formData, 'mechanic_address')}</p>
                </div>
              </div>
            </div>

            {/* Vehicle and Incident Details */}
            <div className="rounded-lg bg-muted p-4">
              <h4 className="font-medium">Vehicle and Incident Details</h4>
              <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-2">
                <div className="md:col-span-2">
                  <p className="text-sm text-muted-foreground">Vehicle:</p>
                  <p>{getDisplayValue(formData, 'vehicle_details')}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Service Date:</p>
                  <p>{getDisplayValue(formData, 'service_date')}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date Damage Noticed (Optional):</p>
                  <p>{getDisplayValue(formData, 'incident_date')}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm text-muted-foreground">Disputed Damage Description:</p>
                  <p className="whitespace-pre-wrap">{getDisplayValue(formData, 'damage_description')}</p>
                </div>
                 <div className="md:col-span-2">
                  <p className="text-sm text-muted-foreground">Damage Acknowledged by Mechanic (Optional):</p>
                  <p className="whitespace-pre-wrap">{getDisplayValue(formData, 'acknowledged_damage_description')}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pre-Service Evidence Available:</p>
                  <p>{getDisplayValue(formData, 'pre_service_evidence_available')}</p>
                </div>
                 <div className="md:col-span-2">
                  <p className="text-sm text-muted-foreground">Summary of Communication (Optional):</p>
                   <p className="whitespace-pre-wrap">{getDisplayValue(formData, 'previous_communication_summary')}</p>
                </div>
                 {/* Display Old/Redundant fields for review during transition */}
                {/* <div>
                  <p className="text-sm text-muted-foreground">(Old) Repair Cost Estimate:</p>
                  <p>{getDisplayValue(formData, 'repair_cost')}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">(Old) Insurance Claim:</p>
                  <p>{formData.insurance_claim === "yes" ? "Yes" : "No"}</p>
                </div> */}
              </div>
            </div>

             {/* Remedy Details */}
            <div className="rounded-lg bg-muted p-4">
                <h4 className="font-medium">Desired Remedy</h4>
                <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-2">
                    <div>
                        <p className="text-sm text-muted-foreground">Demand Type:</p>
                        <p>{demandTypeLabels[formData?.remedyDetails?.demandType] || getDisplayValue(formData, 'remedyDetails.demandType')}</p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Amount Claimed:</p>
                        <p>{getDisplayValue(formData, 'remedyDetails.demandAmount')}</p>
                    </div>

                    {/* Conditional display based on demand type */}
                    {formData?.remedyDetails?.demandType === 'excessReimbursement' && (
                        <>
                            <div>
                                <p className="text-sm text-muted-foreground">Insurer:</p>
                                <p>{getDisplayValue(formData, 'remedyDetails.insuranceDetails.insurer')}</p>
                            </div>
                             <div>
                                <p className="text-sm text-muted-foreground">Claim Number:</p>
                                <p>{getDisplayValue(formData, 'remedyDetails.insuranceDetails.claimNumber')}</p>
                            </div>
                             <div>
                                <p className="text-sm text-muted-foreground">Excess Amount:</p>
                                <p>{getDisplayValue(formData, 'remedyDetails.insuranceDetails.excessAmount')}</p>
                            </div>
                        </>
                    )}

                    {formData?.remedyDetails?.demandType === 'other' && (
                        <div className="md:col-span-2">
                            <p className="text-sm text-muted-foreground">Other Remedy Details:</p>
                            <p className="whitespace-pre-wrap">{getDisplayValue(formData, 'remedyDetails.demandOtherDetails')}</p>
                        </div>
                    )}

                    <div className="md:col-span-2">
                        <p className="text-sm text-muted-foreground">Alternative Resolution Offered (Optional):</p>
                        <p className="whitespace-pre-wrap">{getDisplayValue(formData, 'remedyDetails.alternativeRemedyOffered')}</p>
                    </div>
                </div>
            </div>

             {/* Escalation Plan */}
            <div className="rounded-lg bg-muted p-4">
                <h4 className="font-medium">Escalation Plan</h4>
                <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-2">
                     <div>
                        <p className="text-sm text-muted-foreground">Response Deadline:</p>
                        <p>{getDisplayValue(formData, 'escalationDetails.responseDeadlineDays')} business days</p>
                    </div>
                     <div>
                        <p className="text-sm text-muted-foreground">Intended Escalation Body:</p>
                        {/* Could potentially map value to label here if needed */}
                        <p>{getDisplayValue(formData, 'escalationDetails.escalationBody')}</p>
                    </div>
                    <div className="md:col-span-2">
                        <p className="text-sm text-muted-foreground">Paid Under Protest (Optional):</p>
                        <p>{getDisplayValue(formData, 'escalationDetails.paymentMadeUnderProtest')}</p>
                    </div>
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
              Edit Core Details
            </Button>
            <Button variant="outline" size="sm" onClick={() => goToStep(2)}>
              Edit Supporting Details & Evidence
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
            Back to Supporting Details
          </Button>
          <Button onClick={handleNext} size="lg" disabled={isGenerating}>
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Document...
              </>
            ) : (
              <>
                Generate Document
                <ChevronRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
