"use client"

import { useRef } from "react"
import { Button } from "@/components/ui/button"
import { AlertCircle, ChevronLeft, ChevronRight, Upload, Camera, File, Trash2 } from "lucide-react"
import Image from "next/image"

/**
 * Step 2: Upload Evidence component
 * @param {Object} props - Component props
 * @param {Array} props.uploadedFiles - Array of uploaded files
 * @param {Object} props.errors - Form validation errors
 * @param {boolean} props.isUploading - Whether files are currently being uploaded
 * @param {Function} props.handleFileSelect - Function to handle file selection
 * @param {Function} props.handleRemoveFile - Function to remove a file
 * @param {Function} props.handleBack - Function to go back to previous step
 * @param {Function} props.handleNext - Function to proceed to next step
 * @param {Function} props.formatFileSize - Function to format file size for display
 */
export default function Step2Upload({
  uploadedFiles,
  errors,
  isUploading,
  handleFileSelect,
  handleRemoveFile,
  handleBack,
  handleNext,
  formatFileSize,
}) {
  const fileInputRef = useRef(null)

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
        <h2 className="text-2xl font-bold text-gray-900">Upload Evidence</h2>
        <p className="mt-2 text-muted-foreground">
          Upload photos and documents that support your case. This evidence strengthens your claim.
        </p>
      </div>

      <div className="mx-auto max-w-4xl">
        {/* Upload Area */}
        <div className="mb-8 rounded-xl border border-border/60 bg-card p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Upload Photos & Documents</h3>

          <div
            className={`mb-6 flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors ${
              errors.uploads ? "border-destructive bg-destructive/5" : "border-muted-foreground/25 hover:bg-muted/50"
            }`}
          >
            <input
              type="file"
              id="fileUpload"
              ref={fileInputRef}
              className="hidden"
              multiple
              accept="image/*,.pdf,.doc,.docx"
              onChange={handleFileSelect}
            />

            <Upload className="mb-3 h-10 w-10 text-muted-foreground" />
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
              Supported formats: JPG, PNG, PDF, DOC, DOCX (Max 10MB per file)
            </p>

            {isUploading && (
              <div className="mt-4 flex items-center">
                <div className="spinner mr-2" />
                <span className="text-sm">Uploading...</span>
              </div>
            )}

            {errors.uploads && (
              <p className="error-message mt-3 text-sm text-destructive flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.uploads}
              </p>
            )}
          </div>

          {/* Evidence Types Guide */}
          <div className="mb-6 rounded-lg bg-muted p-4">
            <h4 className="mb-2 font-medium">Recommended Evidence Types:</h4>
            <ul className="ml-5 list-disc space-y-1 text-sm text-muted-foreground">
              <li>Photos of the vehicle damage (before and after service)</li>
              <li>Service invoice or receipt</li>
              <li>Written communications with the mechanic</li>
              <li>Independent mechanic assessment or quote</li>
              <li>Vehicle registration documents</li>
            </ul>
          </div>

          {/* Uploaded Files List */}
          {uploadedFiles.length > 0 && (
            <div>
              <h4 className="mb-3 font-medium">Uploaded Files ({uploadedFiles.length})</h4>
              <div className="space-y-3">
                {uploadedFiles.map((file) => (
                  <div key={file.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div className="flex items-center">
                      {file.type.startsWith("image/") ? (
                        <div className="relative h-10 w-10 overflow-hidden rounded-md mr-3">
                          <Image src={file.url || "/placeholder.svg"} alt={file.name} fill className="object-cover" />
                        </div>
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted mr-3">
                          {getFileIcon(file.type)}
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium truncate max-w-[200px] sm:max-w-[300px]">{file.name}</p>
                        <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveFile(file.id)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Remove file</span>
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="mt-8 flex justify-between">
          <Button onClick={handleBack} variant="outline" size="lg">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Details
          </Button>
          <Button onClick={handleNext} size="lg">
            Continue to Review
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
