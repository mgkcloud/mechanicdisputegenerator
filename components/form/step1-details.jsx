"use client"

import { Button } from "@/components/ui/button"
import { AlertCircle, ChevronRight } from "lucide-react"
import { AU_DOCUMENT_TYPES } from "@/lib/constants.js"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Define Australian states/territories for dropdown
const auStates = [
  { value: "ACT", label: "Australian Capital Territory" },
  { value: "NSW", label: "New South Wales" },
  { value: "NT", label: "Northern Territory" },
  { value: "QLD", label: "Queensland" },
  { value: "SA", label: "South Australia" },
  { value: "TAS", label: "Tasmania" },
  { value: "VIC", label: "Victoria" },
  { value: "WA", label: "Western Australia" },
]

// Define escalation bodies for dropdown/select
const escalationBodies = [
    { value: "ACAT", label: "ACAT (ACT Civil and Administrative Tribunal)" },
    { value: "NCAT", label: "NCAT (NSW Civil and Administrative Tribunal)" },
    { value: "NTCAT", label: "NTCAT (NT Civil and Administrative Tribunal)" },
    { value: "QCAT", label: "QCAT (Queensland Civil and Administrative Tribunal)" },
    { value: "SACAT", label: "SACAT (South Australian Civil and Administrative Tribunal)" },
    { value: "TASCAT", label: "TASCAT (Tasmanian Civil and Administrative Tribunal)" },
    { value: "VCAT", label: "VCAT (Victorian Civil and Administrative Tribunal)" },
    { value: "SAT", label: "SAT (WA State Administrative Tribunal)" },
    { value: "Federal Court", label: "Federal Court / Small Claims" },
    { value: "Other", label: "Other / Not Sure" },
]

/**
 * Step 1: Enter Details form component
 * @param {Object} props - Component props
 * @param {Object} props.formData - Form data state
 * @param {Object} props.formTouched - Tracks which fields have been touched
 * @param {Object} props.errors - Form validation errors
 * @param {Function} props.handleInputChange - Function to handle input changes
 * @param {Function} props.handleInsuranceChange - Function to handle insurance radio changes
 * @param {Function} props.handleNext - Function to proceed to next step
 * @param {Function} props.handleStateChange - Function to handle state dropdown change
 * @param {Function} props.handleDemandTypeChange - Function to handle remedy demand type radio change
 * @param {Function} props.handleEscalationBodyChange - Function to handle escalation body dropdown change
 */
export default function Step1Details({
  formData = {},
  formTouched = {},
  errors = {},
  handleInputChange,
  handleInsuranceChange,
  handleNext,
  handleStateChange,
  handleDemandTypeChange,
  handleEscalationBodyChange
}) {
  // Helper to check touched status using flat key
  const isTouched = (key) => !!formTouched?.[key];
  // Helper to get error message using flat key
  const getError = (key) => errors?.[key];

  return (
    <div id="step1Content">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900">Enter Your Dispute Details</h2>
        <p className="mt-2 text-muted-foreground">
          Provide accurate information to generate the most effective document for your case.
        </p>
      </div>

      <form id="disputeForm" onSubmit={(e) => e.preventDefault()} className="mx-auto max-w-4xl mb-16">
        {/* Document Type */}
        <div className="mb-8 rounded-xl border border-neutral-200 bg-card p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Select Document Type</h3>
          <div className="form-group">
            <label htmlFor="documentType" className="form-label">
              What type of document do you need?
            </label>
            <select
              id="documentType"
              name="document_type"
              required
              className={`neumorphic-input ${
                isTouched('document_type') && getError('document_type') ? "neumorphic-input-error" : ""
              }`}
              value={formData?.document_type || ""}
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
            {isTouched('document_type') && getError('document_type') && (
              <p className="error-message mt-1 text-sm text-destructive flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {getError('document_type')}
              </p>
            )}
            <p className="form-helper">Choose the document that best fits your situation and desired outcome.</p>
          </div>
        </div>

        {/* State/Territory - Reverted to Native Select */}
        <div className="form-group mb-8 rounded-xl border border-neutral-200 bg-card p-6 shadow-sm">
          <label htmlFor="state" className="form-label block mb-2">
            State/Territory of Dispute
          </label>
          <select
            id="state"
            name="state"
            value={formData?.state || ""}
            onChange={(e) => handleStateChange(e.target.value)}
            required
            className={`neumorphic-input ${isTouched('state') && getError('state') ? "neumorphic-input-error" : ""}`}
          >
            <option value="" disabled>-- Select State/Territory --</option>
            {auStates.map((state) => (
              <option key={state.value} value={state.value}>
                {state.label} ({state.value})
              </option>
            ))}
          </select>
          {isTouched('state') && getError('state') && (
            <p className="error-message mt-1 text-sm text-destructive flex items-center">
              <AlertCircle className="h-4 w-4 mr-1" />
              {getError('state')}
            </p>
          )}
          <p className="form-helper mt-1">Select the state where the service was performed or the dispute occurred.</p>
        </div>

        {/* Your Information */}
        <div className="mb-8 rounded-xl border border-neutral-200 bg-card p-6 shadow-sm">
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
                className={`neumorphic-input ${
                  isTouched('customer_name') && getError('customer_name') ? "neumorphic-input-error" : ""
                }`}
                onChange={handleInputChange}
                value={formData?.customer_name || ""}
              />
              {isTouched('customer_name') && getError('customer_name') && (
                <p className="error-message mt-1 text-sm text-destructive flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {getError('customer_name')}
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
                className={`neumorphic-input ${
                  isTouched('customer_email') && getError('customer_email') ? "neumorphic-input-error" : ""
                }`}
                placeholder="you@example.com"
                onChange={handleInputChange}
                value={formData?.customer_email || ""}
              />
              {isTouched('customer_email') && getError('customer_email') && (
                <p className="error-message mt-1 text-sm text-destructive flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {getError('customer_email')}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Mechanic Information */}
        <div className="mb-8 rounded-xl border border-neutral-200 bg-card p-6 shadow-sm">
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
                className={`neumorphic-input ${
                  isTouched('mechanic_name') && getError('mechanic_name') ? "neumorphic-input-error" : ""
                }`}
                onChange={handleInputChange}
                value={formData?.mechanic_name || ""}
              />
              {isTouched('mechanic_name') && getError('mechanic_name') && (
                <p className="error-message mt-1 text-sm text-destructive flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {getError('mechanic_name')}
                </p>
              )}
            </div>
            <div className="form-group md:col-span-2">
              <label htmlFor="mechanicAddress" className="form-label">
                Mechanic Address <span className="text-xs text-muted-foreground">(Required for formal letter)</span>
              </label>
              <input
                type="text"
                id="mechanicAddress"
                name="mechanic_address"
                required
                className={`neumorphic-input ${
                  isTouched('mechanic_address') && getError('mechanic_address') ? "neumorphic-input-error" : ""
                }`}
                placeholder="456 Workshop St, Melbourne VIC 3000"
                onChange={handleInputChange}
                value={formData?.mechanic_address || ""}
              />
              {isTouched('mechanic_address') && getError('mechanic_address') && (
                <p className="error-message mt-1 text-sm text-destructive flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {getError('mechanic_address')}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Vehicle and Incident Information */}
        <div className="mb-8 rounded-xl border border-neutral-200 bg-card p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Vehicle and Incident Details</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="form-group md:col-span-2">
              <label htmlFor="vehicleDetails" className="form-label">
                Vehicle Details (Year Make Model, Rego: XXXYYY)
              </label>
              <input
                type="text"
                id="vehicleDetails"
                name="vehicle_details"
                required
                className={`neumorphic-input ${
                  isTouched('vehicle_details') && getError('vehicle_details') ? "neumorphic-input-error" : ""
                }`}
                placeholder="e.g., 2018 Toyota Corolla, Rego: ABC123"
                onChange={handleInputChange}
                value={formData?.vehicle_details || ""}
              />
              {isTouched('vehicle_details') && getError('vehicle_details') && (
                <p className="error-message mt-1 text-sm text-destructive flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {getError('vehicle_details')}
                </p>
              )}
            </div>
            <div className="form-group">
              <label htmlFor="serviceDate" className="form-label">
                Service Date
              </label>
              <input
                type="date"
                id="serviceDate"
                name="service_date"
                required
                className={`neumorphic-input ${
                  isTouched('service_date') && getError('service_date') ? "neumorphic-input-error" : ""
                }`}
                onChange={handleInputChange}
                value={formData?.service_date || ""}
              />
              {isTouched('service_date') && getError('service_date') && (
                <p className="error-message mt-1 text-sm text-destructive flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {getError('service_date')}
                </p>
              )}
            </div>
            <div className="form-group">
              <label htmlFor="incidentDate" className="form-label">
                Incident Date (if different)
              </label>
              <input
                type="date"
                id="incidentDate"
                name="incident_date"
                className={`neumorphic-input ${
                  isTouched('incident_date') && getError('incident_date') ? "neumorphic-input-error" : ""
                }`}
                onChange={handleInputChange}
                value={formData?.incident_date || ""}
              />
              {isTouched('incident_date') && getError('incident_date') && (
                <p className="error-message mt-1 text-sm text-destructive flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {getError('incident_date')}
                </p>
              )}
            </div>
            <div className="form-group md:col-span-2">
              <label htmlFor="damageDescription" className="form-label">
                Describe the Disputed Damage
              </label>
              <textarea
                id="damageDescription"
                name="damage_description"
                required
                rows={4}
                className={`neumorphic-input ${
                  isTouched('damage_description') && getError('damage_description')
                    ? "neumorphic-input-error"
                    : ""
                }`}
                placeholder="Describe the damage you believe the mechanic caused (e.g., 'Deep scratch on driver side door', 'Engine making rattling noise after service')."
                onChange={handleInputChange}
                value={formData?.damage_description || ""}
              ></textarea>
              {isTouched('damage_description') && getError('damage_description') && (
                <p className="error-message mt-1 text-sm text-destructive flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {getError('damage_description')}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Remedy Section */}
        <div className="mb-8 rounded-xl border border-neutral-200 bg-card p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">Desired Remedy</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="form-group md:col-span-2">
                    <label className="form-label block mb-2">What are you asking the mechanic to do?</label>
                    <RadioGroup
                        name="remedyDetails.demandType"
                        value={formData?.remedyDetails?.demandType || ""}
                        onValueChange={(value) => handleDemandTypeChange(value)}
                        className={`space-y-2 p-3 rounded-md ${isTouched('remedyDetails.demandType') && getError('remedyDetails.demandType') ? 'border border-destructive' : 'border border-transparent'}`}
                    >
                        <div className="flex items-center space-x-3">
                            <RadioGroupItem value="fullRepairCost" id="demandFullCost" className="flex-shrink-0" />
                            <Label htmlFor="demandFullCost" className="cursor-pointer">Pay the full cost of repairs</Label>
                        </div>
                        <div className="flex items-center space-x-3">
                            <RadioGroupItem value="excessReimbursement" id="demandExcess" className="flex-shrink-0" />
                            <Label htmlFor="demandExcess" className="cursor-pointer">Reimburse my insurance excess</Label>
                        </div>
                        <div className="flex items-center space-x-3">
                            <RadioGroupItem value="other" id="demandOther" className="flex-shrink-0" />
                            <Label htmlFor="demandOther" className="cursor-pointer">Other (Specify below)</Label>
                        </div>
                    </RadioGroup>
                     {isTouched('remedyDetails.demandType') && getError('remedyDetails.demandType') && (
                        <p className="error-message mt-1 text-sm text-destructive flex items-center">
                            <AlertCircle className="h-4 w-4 mr-1" /> {getError('remedyDetails.demandType')}
                        </p>
                     )}
                </div>

                <div className="form-group">
                    <label htmlFor="demandAmount" className="form-label">
                       Amount Claimed ($)
                    </label>
                    <input
                        type="number"
                        id="demandAmount"
                        name="remedyDetails.demandAmount"
                        required
                        min="0"
                        step="0.01"
                        className={`neumorphic-input ${isTouched('remedyDetails.demandAmount') && getError('remedyDetails.demandAmount') ? "neumorphic-input-error" : ""}`}
                        placeholder="e.g., 1250.50"
                        onChange={handleInputChange}
                        value={formData?.remedyDetails?.demandAmount || ""}
                    />
                    {isTouched('remedyDetails.demandAmount') && getError('remedyDetails.demandAmount') && (
                        <p className="error-message mt-1 text-sm text-destructive flex items-center">
                           <AlertCircle className="h-4 w-4 mr-1" /> {getError('remedyDetails.demandAmount')}
                        </p>
                    )}
                    <p className="form-helper">Enter the total dollar amount you are demanding.</p>
                </div>

                {formData?.remedyDetails?.demandType === 'excessReimbursement' && (
                    <>
                        <div className="form-group">
                            <label htmlFor="insuranceInsurer" className="form-label">Insurer Name</label>
                            <input
                                type="text"
                                id="insuranceInsurer"
                                name="remedyDetails.insuranceDetails.insurer"
                                className="neumorphic-input"
                                placeholder="e.g., ABC Insurance"
                                onChange={handleInputChange}
                                value={formData?.remedyDetails?.insuranceDetails?.insurer || ""}
                            />
                        </div>
                         <div className="form-group">
                            <label htmlFor="insuranceClaimNumber" className="form-label">Claim Number</label>
                            <input
                                type="text"
                                id="insuranceClaimNumber"
                                name="remedyDetails.insuranceDetails.claimNumber"
                                className="neumorphic-input"
                                placeholder="e.g., CLM12345"
                                onChange={handleInputChange}
                                value={formData?.remedyDetails?.insuranceDetails?.claimNumber || ""}
                            />
                        </div>
                         <div className="form-group">
                            <label htmlFor="insuranceExcess" className="form-label">Excess Amount Paid ($)</label>
                            <input
                                type="number"
                                id="insuranceExcess"
                                name="remedyDetails.insuranceDetails.excessAmount"
                                min="0"
                                step="0.01"
                                className="neumorphic-input"
                                placeholder="e.g., 500.00"
                                onChange={handleInputChange}
                                value={formData?.remedyDetails?.insuranceDetails?.excessAmount || ""}
                            />
                             <p className="form-helper">Should match the 'Amount Claimed' for this demand type.</p>
                        </div>
                    </>
                )}

                 {formData?.remedyDetails?.demandType === 'other' && (
                    <div className="form-group md:col-span-2">
                        <label htmlFor="demandOtherDetails" className="form-label">Specify Other Remedy</label>
                        <textarea
                            id="demandOtherDetails"
                            name="remedyDetails.demandOtherDetails"
                            rows={3}
                            required
                             className={`neumorphic-input ${isTouched('remedyDetails.demandOtherDetails') && getError('remedyDetails.demandOtherDetails') ? "neumorphic-input-error" : ""}`}
                            placeholder="Clearly describe the specific action or compensation you are seeking."
                            onChange={handleInputChange}
                            value={formData?.remedyDetails?.demandOtherDetails || ""}
                        ></textarea>
                        {isTouched('remedyDetails.demandOtherDetails') && getError('remedyDetails.demandOtherDetails') && (
                            <p className="error-message mt-1 text-sm text-destructive flex items-center">
                                <AlertCircle className="h-4 w-4 mr-1" /> {getError('remedyDetails.demandOtherDetails')}
                            </p>
                        )}
                    </div>
                 )}
            </div>
        </div>

         {/* Escalation Section */}
        <div className="mb-8 rounded-xl border border-neutral-200 bg-card p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">Escalation Plan</h3>
             <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                 <div className="form-group">
                    <label htmlFor="responseDeadlineDays" className="form-label">
                        Response Deadline (Business Days)
                    </label>
                    <input
                        type="number"
                        id="responseDeadlineDays"
                        name="escalationDetails.responseDeadlineDays"
                        required
                        min="5" max="30" step="1"
                        className={`neumorphic-input ${isTouched('escalationDetails.responseDeadlineDays') && getError('escalationDetails.responseDeadlineDays') ? "neumorphic-input-error" : ""}`}
                        placeholder="e.g., 14"
                        onChange={handleInputChange}
                        value={formData?.escalationDetails?.responseDeadlineDays || "14"}
                    />
                    {isTouched('escalationDetails.responseDeadlineDays') && getError('escalationDetails.responseDeadlineDays') && (
                        <p className="error-message mt-1 text-sm text-destructive flex items-center">
                            <AlertCircle className="h-4 w-4 mr-1" /> {getError('escalationDetails.responseDeadlineDays')}
                        </p>
                    )}
                    <p className="form-helper">How long will you give the mechanic to respond? (Suggest 10-14 days). The escalation body will be determined by the State/Territory selected.</p>
                </div>
             </div>
         </div>

        <div className="mt-8 flex justify-end">
          <Button onClick={handleNext} size="lg"> {/* No validation check here, assuming parent handles */}
            Continue to Supporting Details
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  )
}
