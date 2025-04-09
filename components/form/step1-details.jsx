"use client"

import { Button } from "@/components/ui/button"
import { AlertCircle, ChevronRight } from "lucide-react"
import { AU_DOCUMENT_TYPES } from "@/lib/document-generator-au"

/**
 * Step 1: Enter Details form component
 * @param {Object} props - Component props
 * @param {Object} props.formData - Form data state
 * @param {Object} props.formTouched - Tracks which fields have been touched
 * @param {Object} props.errors - Form validation errors
 * @param {Function} props.handleInputChange - Function to handle input changes
 * @param {Function} props.handleInsuranceChange - Function to handle insurance radio changes
 * @param {Function} props.handleNext - Function to proceed to next step
 */
export default function Step1Details({
  formData,
  formTouched,
  errors,
  handleInputChange,
  handleInsuranceChange,
  handleNext,
}) {
  return (
    <div id="step1Content">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900">Enter Your Dispute Details</h2>
        <p className="mt-2 text-muted-foreground">
          Provide accurate information to generate the most effective document for your case.
        </p>
      </div>

      <form id="disputeForm" onSubmit={(e) => e.preventDefault()} className="mx-auto max-w-4xl">
        {/* Document Type */}
        <div className="mb-8 rounded-xl border border-border/60 bg-card p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Select Document Type</h3>
          <div className="form-group">
            <label htmlFor="documentType" className="form-label">
              What type of document do you need?
            </label>
            <select
              id="documentType"
              name="document_type"
              required
              className={`form-select ${
                formTouched.document_type && errors.document_type ? "border-destructive ring-destructive" : ""
              }`}
              value={formData.document_type || ""}
              onChange={handleInputChange}
            >
              <option value="" disabled>
                -- Select an option --
              </option>
              {Object.entries(AU_DOCUMENT_TYPES).map(([value, text]) => (
                <option key={value} value={value}>
                  {text}
                </option>
              ))}
            </select>
            {formTouched.document_type && errors.document_type && (
              <p className="error-message mt-1 text-sm text-destructive flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.document_type}
              </p>
            )}
            <p className="form-helper">Choose the document that best fits your situation and desired outcome.</p>
          </div>
        </div>

        {/* Your Information */}
        <div className="mb-8 rounded-xl border border-border/60 bg-card p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Your Information</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="form-group">
              <label htmlFor="customerName" className="form-label">
                Your Full Name
              </label>
              <input
                type="text"
                id="customerName"
                name="customer_name"
                required
                className={`form-input ${
                  formTouched.customer_name && errors.customer_name ? "border-destructive ring-destructive" : ""
                }`}
                onChange={handleInputChange}
                value={formData.customer_name || ""}
              />
              {formTouched.customer_name && errors.customer_name && (
                <p className="error-message mt-1 text-sm text-destructive flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.customer_name}
                </p>
              )}
            </div>
            <div className="form-group">
              <label htmlFor="customerEmail" className="form-label">
                Email Address
              </label>
              <input
                type="email"
                id="customerEmail"
                name="customer_email"
                required
                className={`form-input ${
                  formTouched.customer_email && errors.customer_email ? "border-destructive ring-destructive" : ""
                }`}
                placeholder="you@example.com"
                onChange={handleInputChange}
                value={formData.customer_email || ""}
              />
              {formTouched.customer_email && errors.customer_email && (
                <p className="error-message mt-1 text-sm text-destructive flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.customer_email}
                </p>
              )}
            </div>
            <div className="form-group">
              <label htmlFor="customerPhone" className="form-label">
                Phone Number <span className="text-xs text-muted-foreground">(Optional)</span>
              </label>
              <input
                type="tel"
                id="customerPhone"
                name="customer_phone"
                className={`form-input ${
                  formTouched.customer_phone && errors.customer_phone ? "border-destructive ring-destructive" : ""
                }`}
                placeholder="0400 123 456"
                onChange={handleInputChange}
                value={formData.customer_phone || ""}
              />
              {formTouched.customer_phone && errors.customer_phone && (
                <p className="error-message mt-1 text-sm text-destructive flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.customer_phone}
                </p>
              )}
            </div>
            <div className="form-group">
              <label htmlFor="customerAddress" className="form-label">
                Your Address <span className="text-xs text-muted-foreground">(Optional)</span>
              </label>
              <input
                type="text"
                id="customerAddress"
                name="customer_address"
                className="form-input"
                placeholder="123 Example St, Sydney NSW 2000"
                onChange={handleInputChange}
                value={formData.customer_address || ""}
              />
            </div>
          </div>
        </div>

        {/* Mechanic Information */}
        <div className="mb-8 rounded-xl border border-border/60 bg-card p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Mechanic Information</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="form-group">
              <label htmlFor="mechanicName" className="form-label">
                Mechanic Business Name
              </label>
              <input
                type="text"
                id="mechanicName"
                name="mechanic_name"
                required
                className={`form-input ${
                  formTouched.mechanic_name && errors.mechanic_name ? "border-destructive ring-destructive" : ""
                }`}
                onChange={handleInputChange}
                value={formData.mechanic_name || ""}
              />
              {formTouched.mechanic_name && errors.mechanic_name && (
                <p className="error-message mt-1 text-sm text-destructive flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.mechanic_name}
                </p>
              )}
            </div>
            <div className="form-group">
              <label htmlFor="mechanicABN" className="form-label">
                ABN <span className="text-xs text-muted-foreground">(Optional)</span>
              </label>
              <input
                type="text"
                id="mechanicABN"
                name="mechanic_abn"
                className="form-input"
                placeholder="12 345 678 901"
                onChange={handleInputChange}
                value={formData.mechanic_abn || ""}
              />
            </div>
            <div className="form-group md:col-span-2">
              <label htmlFor="mechanicAddress" className="form-label">
                Mechanic Address <span className="text-xs text-muted-foreground">(Optional)</span>
              </label>
              <input
                type="text"
                id="mechanicAddress"
                name="mechanic_address"
                className="form-input"
                placeholder="456 Workshop St, Melbourne VIC 3000"
                onChange={handleInputChange}
                value={formData.mechanic_address || ""}
              />
            </div>
          </div>
        </div>

        {/* Vehicle and Damage Information */}
        <div className="mb-8 rounded-xl border border-border/60 bg-card p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Vehicle and Damage Details</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="form-group">
              <label htmlFor="vehicleDetails" className="form-label">
                Vehicle Details
              </label>
              <input
                type="text"
                id="vehicleDetails"
                name="vehicle_details"
                className="form-input"
                placeholder="2018 Toyota Corolla, Rego: ABC123"
                onChange={handleInputChange}
                value={formData.vehicle_details || ""}
              />
            </div>
            <div className="form-group">
              <label htmlFor="serviceDate" className="form-label">
                Service Date
              </label>
              <input
                type="date"
                id="serviceDate"
                name="service_date"
                className="form-input"
                onChange={handleInputChange}
                value={formData.service_date || ""}
              />
            </div>
            <div className="form-group md:col-span-2">
              <label htmlFor="damageDescription" className="form-label">
                Damage Description
              </label>
              <textarea
                id="damageDescription"
                name="damage_description"
                required
                className={`form-textarea ${
                  formTouched.damage_description && errors.damage_description
                    ? "border-destructive ring-destructive"
                    : ""
                }`}
                placeholder="Describe the damage to your vehicle in detail..."
                onChange={handleInputChange}
                value={formData.damage_description || ""}
              ></textarea>
              {formTouched.damage_description && errors.damage_description && (
                <p className="error-message mt-1 text-sm text-destructive flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.damage_description}
                </p>
              )}
            </div>
            <div className="form-group">
              <label htmlFor="repairCost" className="form-label">
                Repair Cost Estimate <span className="text-xs text-muted-foreground">(Optional)</span>
              </label>
              <input
                type="text"
                id="repairCost"
                name="repair_cost"
                className="form-input"
                placeholder="$1,500"
                onChange={handleInputChange}
                value={formData.repair_cost || ""}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Insurance Claim Filed?</label>
              <div className="mt-2 flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="insurance_claim"
                    value="yes"
                    className="mr-2"
                    onChange={handleInsuranceChange}
                    checked={formData.insurance_claim === "yes"}
                  />
                  Yes
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="insurance_claim"
                    value="no"
                    className="mr-2"
                    onChange={handleInsuranceChange}
                    checked={formData.insurance_claim === "no" || !formData.insurance_claim}
                  />
                  No
                </label>
              </div>
            </div>
            <div className={`form-group insurance-fields ${formData.insurance_claim !== "yes" ? "hidden" : ""}`}>
              <label htmlFor="insuranceExcess" className="form-label">
                Insurance Excess Amount
              </label>
              <input
                type="text"
                id="insuranceExcess"
                name="insurance_excess"
                className="form-input"
                placeholder="$500"
                onChange={handleInputChange}
                value={formData.insurance_excess || ""}
              />
            </div>
            <div className={`form-group insurance-fields ${formData.insurance_claim !== "yes" ? "hidden" : ""}`}>
              <label htmlFor="insuranceClaimNumber" className="form-label">
                Insurance Claim Number
              </label>
              <input
                type="text"
                id="insuranceClaimNumber"
                name="insurance_claim_number"
                className="form-input"
                placeholder="CLM123456789"
                onChange={handleInputChange}
                value={formData.insurance_claim_number || ""}
              />
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <Button onClick={handleNext} size="lg">
            Continue to Evidence Upload
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  )
}
