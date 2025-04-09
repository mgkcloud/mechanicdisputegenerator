"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { FileText, Upload, CheckCircle, CreditCard, Download } from "lucide-react"

// Import components
import HeroSection from "@/components/form/hero-section"
import StepIndicator from "@/components/form/step-indicator"
import Step1Details from "@/components/form/step1-details"
import Step2Upload from "@/components/form/step2-upload"
import Step3Review from "@/components/form/step3-review"
import Step4Payment from "@/components/form/step4-payment"
import Step5Download from "@/components/form/step5-download"
import Testimonials from "@/components/testimonials"
import CTASection from "@/components/cta-section"

// Import utility functions
import { validateForm, validateUploads, formatFileSize, formatCurrency } from "@/lib/form-utils"
import { uploadFileToR2 } from "@/lib/file-utils"
import { generateDocument, createCheckoutSession, processPayment, checkPaymentStatus } from "@/lib/payment-utils"

export default function HomePage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [claimStarted, setClaimStarted] = useState(false)
  const [errors, setErrors] = useState({})
  const [formTouched, setFormTouched] = useState({})
  const [uploadedFiles, setUploadedFiles] = useState([])
  const [isUploading, setIsUploading] = useState(false)
  const [formData, setFormData] = useState({})
  const [isGenerating, setIsGenerating] = useState(false)
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)
  const [documentData, setDocumentData] = useState(null)
  const [paymentSuccess, setPaymentSuccess] = useState(false)
  const [stripePromise, setStripePromise] = useState(null)
  const [clientSecret, setClientSecret] = useState("")
  const router = useRouter()
  const { toast } = useToast()

  // Initialize Stripe
  useEffect(() => {
    if (typeof window !== "undefined" && window.Stripe) {
      setStripePromise(window.Stripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY))
    }
  }, [])

  // Define steps for clarity
  const steps = [
    { id: 1, title: "Enter Details", icon: FileText },
    { id: 2, title: "Upload Evidence", icon: Upload },
    { id: 3, title: "Review", icon: CheckCircle },
    { id: 4, title: "Payment", icon: CreditCard },
    { id: 5, title: "Download", icon: Download },
  ]

  // Collect form data when inputs change
  const handleInputChange = (e) => {
    const { name, value } = e.target

    // Update form data
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    // Mark field as touched
    setFormTouched((prev) => ({
      ...prev,
      [name]: true,
    }))

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }))
    }
  }

  // Handler for insurance claim radio buttons to show/hide related fields
  const handleInsuranceChange = (event) => {
    const { value } = event.target

    // Update form data
    setFormData((prev) => ({
      ...prev,
      insurance_claim: value,
    }))
  }

  // Handle file selection
  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files)
    if (files.length === 0) return

    setIsUploading(true)

    try {
      const uploadPromises = files.map((file) => uploadFileToR2(file))
      const uploadedFiles = await Promise.all(uploadPromises)

      setUploadedFiles((prev) => [...prev, ...uploadedFiles])

      // Clear any upload errors
      if (errors.uploads) {
        setErrors((prev) => ({
          ...prev,
          uploads: undefined,
        }))
      }

      toast({
        title: "Files uploaded",
        description: `${files.length} file(s) uploaded successfully`,
      })
    } catch (error) {
      console.error("Error uploading files:", error)

      toast({
        title: "Upload failed",
        description: error.message || "There was a problem uploading your files. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)

      // Reset file input
      e.target.value = ""
    }
  }

  // Handle file removal
  const handleRemoveFile = (fileId) => {
    setUploadedFiles((prev) => prev.filter((file) => file.id !== fileId))

    // If no files left, show error
    if (uploadedFiles.length <= 1) {
      setErrors((prev) => ({
        ...prev,
        uploads: "Please upload at least one photo or document as evidence",
      }))
    }

    toast({
      title: "File removed",
      description: "The file has been removed from your evidence",
    })
  }

  const handleNext = async () => {
    // Different validation based on current step
    let isValid = true
    let shouldProceed = true

    if (currentStep === 1) {
      // Mark all fields as touched
      const form = document.getElementById("disputeForm")
      if (form) {
        const formElements = form.elements
        const touchedFields = {}

        for (let i = 0; i < formElements.length; i++) {
          const element = formElements[i]
          if (element.name) {
            touchedFields[element.name] = true
          }
        }

        setFormTouched(touchedFields)
      }

      // Validate form before proceeding
      const validation = validateForm(formData, formTouched)
      setErrors(validation.errors)
      isValid = validation.isValid
    } else if (currentStep === 2) {
      // Validate uploads
      const validation = validateUploads(uploadedFiles, errors)
      setErrors(validation.errors)
      isValid = validation.isValid
    } else if (currentStep === 3) {
      // Generate document before proceeding to payment
      setIsGenerating(true)
      try {
        const docData = await generateDocument(formData, uploadedFiles)
        setDocumentData(docData)

        // Create checkout session
        const checkoutData = await createCheckoutSession(docData, formData)
        setClientSecret(checkoutData.id)

        toast({
          title: "Document generated successfully",
          description: "Your document is ready for review",
        })

        shouldProceed = true
      } catch (error) {
        toast({
          title: "Error generating document",
          description: error.message || "There was a problem generating your document. Please try again.",
          variant: "destructive",
        })
        shouldProceed = false
      } finally {
        setIsGenerating(false)
      }
    } else if (currentStep === 4) {
      // Process payment before proceeding to download
      setIsProcessingPayment(true)
      try {
        const paymentResult = await processPayment(documentData, stripePromise, clientSecret)
        shouldProceed = paymentResult

        if (paymentResult) {
          setPaymentSuccess(true)
          toast({
            title: "Payment successful",
            description: "Your payment has been processed successfully",
          })
        }
      } catch (error) {
        toast({
          title: "Payment failed",
          description: error.message || "There was a problem processing your payment. Please try again.",
          variant: "destructive",
        })
        shouldProceed = false
      } finally {
        setIsProcessingPayment(false)
      }
    }

    if (isValid && shouldProceed) {
      if (currentStep < steps.length) {
        setCurrentStep(currentStep + 1)
        setClaimStarted(true)
        window.scrollTo(0, 0) // Scroll to top on step change

        // Show success toast when moving to next step
        toast({
          title: "Progress saved",
          description: `Moving to step ${currentStep + 1}: ${steps[currentStep].title}`,
        })
      }
    } else {
      // Show error toast if validation fails
      if (!isValid) {
        toast({
          title: "Validation failed",
          description: "Please correct the errors before proceeding",
          variant: "destructive",
        })

        // Scroll to the first error
        const firstErrorElement = document.querySelector(".error-message")
        if (firstErrorElement) {
          firstErrorElement.scrollIntoView({ behavior: "smooth", block: "center" })
        }
      }
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
      window.scrollTo(0, 0) // Scroll to top on step change
    }
  }

  // Simplified handler to jump to a specific step (e.g., for the stepper itself)
  const goToStep = (stepId) => {
    if (stepId <= currentStep) {
      setCurrentStep(stepId)
      window.scrollTo(0, 0)
    }
  }

  // Add a new function to start the claim process
  const startClaim = () => {
    setClaimStarted(true)
    setCurrentStep(1)
    window.scrollTo(0, 0)

    toast({
      title: "Let's get started",
      description: "Fill out the form to generate your legal document",
    })
  }

  // Handler for resetting the form
  const handleStartOver = () => {
    // Reset form fields
    setCurrentStep(1)
    setClaimStarted(false)
    setErrors({})
    setFormTouched({})
    setUploadedFiles([])
    setFormData({})
    setDocumentData(null)
    setPaymentSuccess(false)
    setClientSecret("")
    window.scrollTo(0, 0)

    toast({
      title: "Form reset",
      description: "You can start a new dispute claim",
    })
  }

  // Check for payment success on component mount (for redirect from Stripe)
  useEffect(() => {
    const checkPaymentFromUrl = async () => {
      const urlParams = new URLSearchParams(window.location.search)
      const sessionId = urlParams.get("session_id")

      if (sessionId) {
        const isPaid = await checkPaymentStatus(sessionId)

        if (isPaid) {
          setPaymentSuccess(true)
          setCurrentStep(5) // Move to download step

          toast({
            title: "Payment successful",
            description: "Your payment has been processed successfully",
          })

          // Clean up the URL
          window.history.replaceState({}, document.title, window.location.pathname)
        }
      }
    }

    checkPaymentFromUrl()
  }, [])

  return (
    <>
      {/* Hero Section */}
      <HeroSection
        claimStarted={claimStarted}
        startClaim={startClaim}
        handleStartOver={handleStartOver}
        currentStep={currentStep}
        steps={steps}
      />

      {/* Main Form Section */}
      <main className="container py-12">
        {/* Step Indicator */}
        {claimStarted && <StepIndicator steps={steps} currentStep={currentStep} goToStep={goToStep} />}

        {/* Step 1: Enter Details */}
        {currentStep === 1 && (
          <Step1Details
            formData={formData}
            formTouched={formTouched}
            errors={errors}
            handleInputChange={handleInputChange}
            handleInsuranceChange={handleInsuranceChange}
            handleNext={handleNext}
          />
        )}

        {/* Step 2: Upload Evidence */}
        {currentStep === 2 && (
          <Step2Upload
            uploadedFiles={uploadedFiles}
            errors={errors}
            isUploading={isUploading}
            handleFileSelect={handleFileSelect}
            handleRemoveFile={handleRemoveFile}
            handleBack={handleBack}
            handleNext={handleNext}
            formatFileSize={formatFileSize}
          />
        )}

        {/* Step 3: Review */}
        {currentStep === 3 && (
          <Step3Review
            formData={formData}
            uploadedFiles={uploadedFiles}
            isGenerating={isGenerating}
            handleBack={handleBack}
            handleNext={handleNext}
            goToStep={goToStep}
          />
        )}

        {/* Step 4: Payment */}
        {currentStep === 4 && (
          <Step4Payment
            documentData={documentData}
            isProcessingPayment={isProcessingPayment}
            handleBack={handleBack}
            handleNext={handleNext}
            formatCurrency={formatCurrency}
          />
        )}

        {/* Step 5: Download */}
        {currentStep === 5 && <Step5Download documentData={documentData} handleStartOver={handleStartOver} />}
      </main>

      {/* Testimonials Section */}
      <Testimonials />

      {/* CTA Section */}
      <CTASection startClaim={startClaim} />
    </>
  )
}
