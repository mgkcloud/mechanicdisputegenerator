"use client"

import { useRef } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { AlertCircle, ChevronLeft, ChevronRight, Upload, Camera, File, Trash2 } from "lucide-react"
import Image from "next/image"

/**
 * Step 2: Upload Evidence component
 * @param {Object} props - Component props
 * @param {Object} props.formData - Form data state
 * @param {Object} props.formTouched - Tracks which fields have been touched
 * @param {Array} props.uploadedFiles - Array of uploaded files
 * @param {Object} props.errors - Form validation errors
 * @param {boolean} props.isUploading - Whether files are currently being uploaded
 * @param {Function} props.handleFileSelect - Function to handle file selection
 * @param {Function} props.handleInputChange - Function to handle input changes
 * @param {Function} props.handleCheckboxChange - Function to handle checkbox change
 * @param {Function} props.handleRemoveFile - Function to remove a file
 * @param {Function} props.handleBack - Function to go back to previous step
 * @param {Function} props.handleNext - Function to proceed to next step
 * @param {Function} props.formatFileSize - Function to format file size for display
 */
export default function Step2Upload({
  uploadedFiles,
  formData = {},
  formTouched = {},
  errors,
  isUploading,
  handleFileSelect,
  handleInputChange,
  handleCheckboxChange,
  handleRemoveFile,
  handleBack,
  handleNext,
  formatFileSize,
}) {
  const fileInputRef = useRef(null)

  // Helper to check touched status using flat key
  const isTouched = (key) => !!formTouched?.[key];
  // Helper to get error message using flat key
  const getError = (key) => errors?.[key];

  // Get file icon based on type
  const getFileIcon = (fileType) => {
    if (fileType.startsWith("image/")) {
      return <Camera className="h-5 w-5 text-primary" />
    } else {
      return <File className="h-5 w-5 text-primary" />
    }
  }

  return (
    <div id="step2Content">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900">Supporting Details & Evidence Upload</h2>
        <p className="mt-2 text-muted-foreground">
          Provide supplementary information and upload photos/documents to support your case.
        </p>
      </div>

      <form onSubmit={(e) => e.preventDefault()} className="mx-auto max-w-4xl">

        {/* === Upload Area (Moved to Top) === */}
        <div className="mb-6 rounded-xl border border-border/60 bg-card p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Upload Supporting Evidence</h3>

          <div
            className={`mb-4 flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors ${
              errors.uploads ? "border-destructive bg-destructive/5" : "border-muted-foreground/25 hover:bg-muted/50"
            }`}
          >
            <input
              type="file"
              id="fileUpload"
              ref={fileInputRef}
              className="hidden"
              multiple
              accept="image/*,.pdf,.doc,.docx,.txt"
              onChange={handleFileSelect}
              disabled={isUploading}
            />

            <Upload className="mb-3 h-8 w-8 text-muted-foreground" />
            <p className="mb-2 text-center text-sm font-medium">
              Drag and drop files here, or{" "}
              <Button
                variant="link"
                className="p-0 h-auto text-primary"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                browse
              </Button>
            </p>
            <p className="text-center text-xs text-muted-foreground">
              Formats: JPG, PNG, PDF, DOC(X), TXT (Max 10MB each)
            </p>

            {isUploading && (
              <div className="mt-3 flex items-center">
                <div className="spinner mr-2" />
                <span className="text-sm">Uploading...</span>
              </div>
            )}

            {errors.uploads && (
              <p className="error-message mt-2 text-sm text-destructive flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.uploads}
              </p>
            )}
          </div>

          {/* File List */}
          {uploadedFiles && uploadedFiles.length > 0 && (
            <div className="mt-4 space-y-3">
              <h4 className="text-sm font-medium text-gray-700">Uploaded files:</h4>
              <ul className="space-y-2">
                {uploadedFiles.map((file) => (
                  <li
                    key={file.id}
                    className="flex items-center justify-between rounded-md bg-muted/50 p-2 text-sm"
                  >
                    <div className="flex items-center space-x-2 overflow-hidden">
                      {getFileIcon(file.type)}
                      <span className="truncate font-medium text-gray-800" title={file.name}>
                        {file.name}
                      </span>
                      <span className="flex-shrink-0 text-xs text-muted-foreground">
                        ({formatFileSize(file.size)})
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                      onClick={() => handleRemoveFile(file.id)}
                      aria-label={`Remove ${file.name}`}
                      disabled={isUploading}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Evidence Types Guide (Collapsed into a paragraph) */}
          <p className="mt-4 text-xs text-muted-foreground">
            <strong>Helpful evidence includes:</strong> Photos of damage (before/after if possible), original quotes, final invoices, previous repair records, expert reports, communication records (emails, texts).
          </p>
        </div>

        {/* === Optional Sections (Grouped & Compressed) === */}
        <div className="space-y-4"> 
          {/* Optional Contact Information */}
          <div className="rounded-xl border border-border/60 bg-card p-4 shadow-sm">
            <h3 className="mb-3 text-base font-semibold text-gray-900">Optional Contact Information</h3>
            <div className="grid grid-cols-1 gap-x-4 gap-y-3 md:grid-cols-3">
                <div className="form-group">
                    <label htmlFor="customerPhone" className="form-label text-sm">
                        Your Phone <span className="text-xs text-muted-foreground">(Optional)</span>
                    </label>
                    <input
                        type="tel"
                        id="customerPhone"
                        name="customer_phone"
                        className={`neumorphic-input text-sm h-9 ${
                        isTouched('customer_phone') && getError('customer_phone') ? "neumorphic-input-error" : ""
                        }`}
                        placeholder="0400 123 456"
                        onChange={handleInputChange}
                        value={formData?.customer_phone || ""}
                    />
                    {isTouched('customer_phone') && getError('customer_phone') && (
                        <p className="error-message mt-1 text-xs text-destructive flex items-center">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        {getError('customer_phone')}
                        </p>
                    )}
                </div>
                <div className="form-group">
                    <label htmlFor="customerAddress" className="form-label text-sm">
                        Your Address <span className="text-xs text-muted-foreground">(Optional)</span>
                    </label>
                    <input
                        type="text"
                        id="customerAddress"
                        name="customer_address"
                        className="neumorphic-input text-sm h-9"
                        placeholder="123 Example St, Sydney NSW 2000"
                        onChange={handleInputChange}
                        value={formData?.customer_address || ""}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="mechanicABN" className="form-label text-sm">
                        Mechanic ABN <span className="text-xs text-muted-foreground">(Optional)</span>
                    </label>
                    <input
                        type="text"
                        id="mechanicABN"
                        name="mechanic_abn"
                        className="neumorphic-input text-sm h-9"
                        placeholder="12 345 678 901"
                        onChange={handleInputChange}
                        value={formData?.mechanic_abn || ""}
                    />
                </div>
            </div>
          </div>

          {/* Incident Details & Communication */}
          <div className="rounded-xl border border-border/60 bg-card p-4 shadow-sm">
            <h3 className="mb-3 text-base font-semibold text-gray-900">Optional Incident Details & Communication</h3>
            <div className="grid grid-cols-1 gap-x-4 gap-y-3 md:grid-cols-2">
              <div className="form-group">
                <label htmlFor="incidentDate" className="form-label text-sm">
                  Date Damage Noticed <span className="text-xs text-muted-foreground">(If different)</span>
                </label>
                <input
                  type="date"
                  id="incidentDate"
                  name="incident_date" 
                  className={`neumorphic-input text-sm h-9 ${
                    isTouched('incident_date') && getError('incident_date') ? "neumorphic-input-error" : "" 
                  }`}
                  onChange={handleInputChange}
                  value={formData?.incident_date || ""}
                />
              </div>
              <div className="form-group flex items-center space-x-2 py-2 md:col-span-2">
                  <Checkbox
                      id="preServiceEvidence"
                      name="pre_service_evidence_available"
                      checked={!!formData?.pre_service_evidence_available}
                      onCheckedChange={(checked) => handleCheckboxChange("pre_service_evidence_available", checked)}
                      className={`${isTouched('pre_service_evidence_available') && getError('pre_service_evidence_available') ? "ring-1 ring-destructive" : ""}`}
                  />
                  <label htmlFor="preServiceEvidence" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer">
                      Have photos/videos BEFORE the service?
                  </label>
                  {isTouched('pre_service_evidence_available') && getError('pre_service_evidence_available') && (
                      <p className="error-message text-xs text-destructive flex items-center">
                          <AlertCircle className="h-3 w-3 mr-1" /> {getError('pre_service_evidence_available')}
                      </p>
                  )}
              </div>
              <div className="form-group md:col-span-2">
                <label htmlFor="acknowledgedDamage" className="form-label text-sm">
                  Damage Acknowledged by Mechanic <span className="text-xs text-muted-foreground">(Optional)</span>
                </label>
                <textarea
                  id="acknowledgedDamage"
                  name="acknowledged_damage_description"
                  rows={2}
                  className={`neumorphic-input text-sm ${ 
                    isTouched('acknowledged_damage_description') && getError('acknowledged_damage_description') ? 'neumorphic-input-error' : ''
                  }`}
                  placeholder="Did the mechanic acknowledge any damage? Describe what."
                  onChange={handleInputChange}
                  value={formData?.acknowledged_damage_description || ""}
                ></textarea>
              </div>
              <div className="form-group md:col-span-2">
                  <label htmlFor="previousCommunication" className="form-label text-sm">
                      Communication Summary <span className="text-xs text-muted-foreground">(Optional)</span>
                  </label>
                  <textarea
                      id="previousCommunication"
                      name="previous_communication_summary"
                      rows={2}
                      className={`neumorphic-input text-sm ${ 
                        isTouched('previous_communication_summary') && getError('previous_communication_summary') ? 'neumorphic-input-error' : ''
                      }`}
                      placeholder="Summarize discussions/correspondence (e.g., 'Called 20/01, spoke to Bob, denied responsibility. Emailed 22/01, no reply.')."
                      onChange={handleInputChange}
                      value={formData?.previous_communication_summary || ""}
                  ></textarea>
              </div>
            </div>
          </div>

          {/* Alternative Resolution & Payment Status */}
          <div className="rounded-xl border border-border/60 bg-card p-4 shadow-sm">
            <h3 className="mb-3 text-base font-semibold text-gray-900">Optional Resolution & Payment Status</h3>
            <div className="grid grid-cols-1 gap-x-4 gap-y-3 md:grid-cols-2">
                  <div className="form-group md:col-span-2">
                      <label htmlFor="alternativeRemedy" className="form-label text-sm">
                          Alternative Resolution Offered <span className="text-xs text-muted-foreground">(Optional)</span>
                      </label>
                      <textarea
                          id="alternativeRemedy"
                          name="remedyDetails.alternativeRemedyOffered"
                          rows={2}
                          className={`neumorphic-input text-sm ${ 
                            isTouched('remedyDetails.alternativeRemedyOffered') && getError('remedyDetails.alternativeRemedyOffered') ? 'neumorphic-input-error' : ''
                          }`}
                          placeholder="Have you proposed or are you willing to accept an alternative? (e.g., 'Offered to accept $1000 settlement')."
                          onChange={handleInputChange}
                          value={formData?.remedyDetails?.alternativeRemedyOffered || ""}
                      ></textarea>
                  </div>
                  <div className="form-group flex items-center space-x-2 py-2 md:col-span-2">
                      <Checkbox
                          id="paymentUnderProtest"
                          name="escalationDetails.paymentMadeUnderProtest"
                          checked={!!formData?.escalationDetails?.paymentMadeUnderProtest}
                          onCheckedChange={(checked) => handleCheckboxChange("escalationDetails.paymentMadeUnderProtest", checked)}
                          className={`${isTouched('escalationDetails.paymentMadeUnderProtest') && getError('escalationDetails.paymentMadeUnderProtest') ? "ring-1 ring-destructive" : ""}`}
                      />
                      <label htmlFor="paymentUnderProtest" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer">
                         Paid invoice "under protest" to get vehicle back?
                      </label>
                      {isTouched('escalationDetails.paymentMadeUnderProtest') && getError('escalationDetails.paymentMadeUnderProtest') && (
                          <p className="error-message text-xs text-destructive flex items-center">
                              <AlertCircle className="h-3 w-3 mr-1" /> {getError('escalationDetails.paymentMadeUnderProtest')}
                          </p>
                      )}
                  </div>
            </div>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="mt-6 flex justify-between">
          <Button variant="outline" onClick={handleBack} disabled={isUploading}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Core Details
          </Button>
          <Button onClick={handleNext} size="lg">
            Continue to Review
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  )
}
