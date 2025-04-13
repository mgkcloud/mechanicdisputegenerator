"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { FileText, Upload, CheckCircle, CreditCard, Download } from "lucide-react"
import useAnalytics from "@/lib/hooks/useAnalytics"

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
import { validateUploads, formatFileSize, formatCurrency } from "@/lib/form-utils"
import { uploadFileToR2 } from "@/lib/file-utils"
import { generateDocument, createCheckoutSession, processPayment, checkPaymentStatus } from "@/lib/payment-utils"

// Import Zod schemas and types
import { LetterOfDemandInputSchema, LetterOfDemandInput } from "@/lib/validation/zod-schemas"
import { STATE_TO_ESCALATION_BODY } from "@/lib/constants"
// Add other schema imports when needed
// import { ConsumerComplaintInputSchema } from "@/lib/validation/zod-schemas.ts";

// Define a map for Zod schema lookup
const zodSchemaMap = {
  letter_of_demand: LetterOfDemandInputSchema,
  // consumer_complaint: ConsumerComplaintInputSchema, // Add when needed
};

// Define a base type for the form data state for better type checking
interface BaseFormData {
  document_type: string;
  state: string;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  customer_address?: string;
  mechanic_name?: string;
  mechanic_abn?: string;
  mechanic_address?: string;
  vehicle_details?: string;
  service_date?: string;
  incident_date?: string;
  damage_description?: string;
  acknowledged_damage_description?: string;
  pre_service_evidence_available?: boolean;
  previous_communication_summary?: string;
  timelineEvents?: Array<{ timestamp?: string; description: string }>; 
  remedyDetails?: { 
    demandType?: string; 
    demandAmount?: string | number; 
    alternativeRemedyOffered?: string;
    insuranceDetails?: {
        insurer?: string;
        claimNumber?: string;
        excessAmount?: string | number; 
    };
    demandOtherDetails?: string;
  };
  escalationDetails?: { 
    responseDeadlineDays?: string | number; 
    escalationBody?: string;
    paymentMadeUnderProtest?: boolean;
  };
  repair_cost?: string;
  insurance_claim?: string;
  insurance_excess?: string;
  insurance_claim_number?: string;
}

// Local storage keys
const STORAGE_KEYS = {
  FORM_DATA: "mechanic_dispute_form_data",
  UPLOADED_FILES: "mechanic_dispute_uploaded_files",
  CURRENT_STEP: "mechanic_dispute_current_step",
  CLAIM_STARTED: "mechanic_dispute_claim_started",
  DOCUMENT_DATA: "mechanic_dispute_document_data"
}

const DEFAULT_FORM_DATA: BaseFormData = { 
  document_type: "",
  state: "",
  customer_name: "",
  customer_email: "",
  customer_phone: "",
  customer_address: "",
  mechanic_name: "",
  mechanic_abn: "",
  mechanic_address: "",
  vehicle_details: "",
  service_date: "",
  incident_date: "",
  damage_description: "",
  acknowledged_damage_description: "",
  pre_service_evidence_available: false,
  previous_communication_summary: "",
  timelineEvents: [],
  remedyDetails: {
    demandType: "",
    demandAmount: "",
    alternativeRemedyOffered: "",
    insuranceDetails: {
        insurer: "",
        claimNumber: "",
        excessAmount: ""
    },
    demandOtherDetails: ""
  },
  escalationDetails: {
    responseDeadlineDays: "14", 
    escalationBody: "",
    paymentMadeUnderProtest: false
  },
  repair_cost: "",
  insurance_claim: "no",
  insurance_excess: "",
  insurance_claim_number: ""
};

// Define interfaces for utility function returns
interface ValidateUploadsResult {
  isValid: boolean;
  errors?: Record<string, string>;
}

interface CheckoutSessionResult {
  sessionId?: string;
  id?: string;
  success: boolean;
}

export default function HomePage() {
  // Initialize with default values instead of empty objects/arrays
  // to ensure consistent state between server and client
  const [currentStep, setCurrentStep] = useState(1)
  const [claimStarted, setClaimStarted] = useState(false)
  const [errors, setErrors] = useState<Record<string, any>>({})
  const [formTouched, setFormTouched] = useState<Record<string, any>>({})
  // Define a type for uploaded files (adjust as needed)
  type UploadedFileType = { id: string; url: string; name: string; size: number; type: string };
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFileType[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [formData, setFormData] = useState<BaseFormData>(DEFAULT_FORM_DATA)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)
  const [documentData, setDocumentData] = useState<Record<string, any> | null>(null)
  const [paymentSuccess, setPaymentSuccess] = useState(false)
  const [stripePromise, setStripePromise] = useState(null)
  const [clientSecret, setClientSecret] = useState("")
  
  // Add a state for client-side rendering detection to avoid hydration issues
  const [isClient, setIsClient] = useState(false)
  
  const router = useRouter()
  const { toast } = useToast()
  const analytics: any = useAnalytics()

  // Use an effect that only runs on the client to set isClient state
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Initialize Stripe
  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).Stripe) {
      setStripePromise((window as any).Stripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY))
    }
  }, [])

  // Load persisted form data from localStorage on initial render
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        // Load form data
        const savedFormData = localStorage.getItem(STORAGE_KEYS.FORM_DATA)
        if (savedFormData) {
          // Merge saved data with default structure to ensure all fields exist
          setFormData({...DEFAULT_FORM_DATA, ...JSON.parse(savedFormData)})
        }
        
        // Load uploaded files
        const savedUploadedFiles = localStorage.getItem(STORAGE_KEYS.UPLOADED_FILES)
        if (savedUploadedFiles) {
          setUploadedFiles(JSON.parse(savedUploadedFiles))
        }
        
        // Load document data
        const savedDocumentData = localStorage.getItem(STORAGE_KEYS.DOCUMENT_DATA)
        if (savedDocumentData) {
          setDocumentData(JSON.parse(savedDocumentData))
        }
        
        // Load current step
        const savedCurrentStep = localStorage.getItem(STORAGE_KEYS.CURRENT_STEP)
        if (savedCurrentStep) {
          setCurrentStep(parseInt(savedCurrentStep, 10))
        }
        
        // Load claim started
        const savedClaimStarted = localStorage.getItem(STORAGE_KEYS.CLAIM_STARTED)
        if (savedClaimStarted) {
          setClaimStarted(JSON.parse(savedClaimStarted))
        } else {
          // Default to false if not saved
          setClaimStarted(false)
        }
      } catch (error) {
        console.error("Error loading saved form data:", error)
        // If there's an error, clear localStorage to prevent future issues
        clearPersistedData()
      }
    }
  }, [])

  // Save form data to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== "undefined" && Object.keys(formData).length > 0) {
      localStorage.setItem(STORAGE_KEYS.FORM_DATA, JSON.stringify(formData))
    }
  }, [formData])

  // Save uploaded files to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== "undefined" && uploadedFiles.length > 0) {
      localStorage.setItem(STORAGE_KEYS.UPLOADED_FILES, JSON.stringify(uploadedFiles))
    }
  }, [uploadedFiles])

  // Save document data to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== "undefined" && documentData) {
      localStorage.setItem(STORAGE_KEYS.DOCUMENT_DATA, JSON.stringify(documentData))
    }
  }, [documentData])

  // Save current step to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEYS.CURRENT_STEP, currentStep.toString())
    }
  }, [currentStep])

  // Save claim started to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEYS.CLAIM_STARTED, JSON.stringify(claimStarted))
    }
  }, [claimStarted])

  // Clear all persisted data
  const clearPersistedData = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEYS.FORM_DATA)
      localStorage.removeItem(STORAGE_KEYS.UPLOADED_FILES)
      localStorage.removeItem(STORAGE_KEYS.CURRENT_STEP)
      localStorage.removeItem(STORAGE_KEYS.CLAIM_STARTED)
      localStorage.removeItem(STORAGE_KEYS.DOCUMENT_DATA)
    }
  }

  // Define steps for clarity
  const steps = [
    { id: 1, title: "Enter Details", icon: FileText },
    { id: 2, title: "Upload Evidence", icon: Upload },
    { id: 3, title: "Review", icon: CheckCircle },
    { id: 4, title: "Payment", icon: CreditCard },
    { id: 5, title: "Download", icon: Download },
  ]

  // Collect form data when inputs change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    
    setFormData((prev: BaseFormData) => {
        if (name.includes('.')) {
            const keys = name.split('.');
            let updatedValue: BaseFormData = { ...prev };
            let currentLevel: any = updatedValue;

            for (let i = 0; i < keys.length - 1; i++) {
                if (!currentLevel[keys[i]]) {
                    currentLevel[keys[i]] = {};
                }
                currentLevel = currentLevel[keys[i]];
            }
            
            const finalValue = (e.target instanceof HTMLInputElement && type === 'checkbox') ? e.target.checked : value;
            currentLevel[keys[keys.length - 1]] = finalValue;
            return updatedValue;
        } else {
             const finalValue = (e.target instanceof HTMLInputElement && type === 'checkbox') ? e.target.checked : value;
             return { ...prev, [name as keyof BaseFormData]: finalValue };
        }
    });

    // Mark field as touched
    setFormTouched((prev) => ({ ...prev, [name]: true }))

    // Clear validation error for the field being changed
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors: Record<string, any> = { ...prev }
        delete newErrors[name]
        // Also clear nested errors if name indicates nesting
        if (name.includes('.')) {
             const keys = name.split('.');
             let currentLevel: any = newErrors;
             // Basic clearing - might need refinement for complex cases
             if(currentLevel[keys[0]] && currentLevel[keys[0]][keys[1]]) {
                  delete currentLevel[keys[0]][keys[1]];
             }
        }
        return newErrors
      })
    }
  }

  // Specific handler for Shadcn Select components (State)
  const handleStateChange = (value: string) => {
      // Use type assertion to tell TypeScript this is a valid key
      const safeValue = value as keyof typeof STATE_TO_ESCALATION_BODY;
      const newEscalationBody = STATE_TO_ESCALATION_BODY[safeValue] || ""; // Now TypeScript knows this is valid
      setFormData((prev: BaseFormData) => ({ 
          ...prev, 
          state: value,
          escalationDetails: {
              ...prev.escalationDetails,
              escalationBody: newEscalationBody // Set the mapped body
          }
       }));
      setFormTouched((prev) => ({ ...prev, state: true, 'escalationDetails.escalationBody': true })); // Mark both as touched
      // Clear state error
      if (errors.state) {
          setErrors((prev) => { const newErrors = { ...prev }; delete newErrors.state; return newErrors; });
      }
      // Clear escalation body error if it exists (since we just set it)
      if (errors['escalationDetails.escalationBody']) {
           setErrors((prev) => { const newErrors = { ...prev }; delete newErrors['escalationDetails.escalationBody']; return newErrors; });
      }
       if (errors.escalationDetails && typeof errors.escalationDetails === 'string') {
           // Also clear the general object error if it was the specific message we were seeing
           setErrors((prev) => { const newErrors = { ...prev }; delete newErrors.escalationDetails; return newErrors; });
       }
  };

  // Specific handler for Shadcn RadioGroup (Demand Type)
  const handleDemandTypeChange = (value: string) => {
      setFormData((prev: BaseFormData) => ({ 
          ...prev, 
          remedyDetails: { ...prev.remedyDetails, demandType: value }
      }));
      // Mark nested field as touched
      setFormTouched((prev) => ({ ...prev, remedyDetails: { ...prev.remedyDetails, demandType: true } }));
      if (errors.remedyDetails?.demandType) {
           setErrors((prev) => { 
               const newErrors = { ...prev }; 
               if(newErrors.remedyDetails) delete newErrors.remedyDetails.demandType; 
               return newErrors; 
            });
      }
  };

  // Specific handler for Shadcn Checkbox
  const handleCheckboxChange = (name: string, checked: boolean) => {
       setFormData((prev) => ({
           ...prev,
           [name]: checked,
       }));
       // Mark field as touched
       setFormTouched((prev) => ({ ...prev, [name]: true }))
       // Clear potential error (might need refinement for nested)
       if (errors[name]) {
           setErrors((prev) => { const newErrors: Record<string, any> = { ...prev }; delete newErrors[name]; return newErrors; });
       }
  };

  // Remove or adapt old insurance change handler if necessary
  const handleInsuranceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name as keyof BaseFormData]: value }))
    // May need additional logic if insurance_claim is still used independently
  }

  // Handle file selection
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    setIsUploading(true)

    try {
      const uploadPromises = files.map((file: File) => uploadFileToR2(file))
      // Explicitly type the result to match UploadedFileType
      const uploadedFilesData = await Promise.all(uploadPromises) as UploadedFileType[];

      setUploadedFiles((prev: UploadedFileType[]) => {
        const newFiles = [...prev, ...uploadedFilesData];
        
        // Track file upload event
        files.forEach((file: File) => {
          analytics.trackFileUpload(
            file.type, 
            file.size, 
            newFiles.length
          );
        });
        
        return newFiles;
      })

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
    } catch (error: any) {
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
  const handleRemoveFile = (fileId: string) => {
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
    // Variable to store validation errors that will be accessible in the scope where we need it
    let validationErrors: Record<string, any> = {};

    if (currentStep === 1) {
      // Mark all fields as touched (including new nested ones if possible)
      // This simple approach might not mark nested fields correctly, relies on handlers
      const form = document.getElementById("disputeForm") as HTMLFormElement | null
      if (form) {
        const formElements = form.elements
        const touchedFields: Record<string, boolean> = { ...formTouched }; // Properly type touchedFields

        for (let i = 0; i < formElements.length; i++) {
          const element = formElements[i] as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
          if (element.name && !touchedFields[element.name]) {
            // Properly type the form element
            touchedFields[element.name] = true 
          }
        }
        setFormTouched(touchedFields)
      }

      // --- Zod Client-side Validation --- 
      const documentType = formData.document_type as keyof typeof zodSchemaMap; // Type assertion
      const schemaToUse = zodSchemaMap[documentType];
      validationErrors = {}; // Initialize here for proper scope
      isValid = true;

      if (schemaToUse) {
          console.log(`Validating client-side with Zod schema: ${documentType}`);
          
          // --- Transform formData to match Zod schema structure ---
          const dataToValidate = {
              ...formData, // Keep existing fields
              senderInfo: {
                  name: formData.customer_name,
                  email: formData.customer_email,
                  phone: formData.customer_phone, 
                  address: formData.customer_address
              },
              recipientInfo: {
                  name: formData.mechanic_name,
                  address: formData.mechanic_address,
                  abn: formData.mechanic_abn
              },
              // Ensure nested objects exist if not already handled by inputChange
              remedyDetails: formData.remedyDetails || DEFAULT_FORM_DATA.remedyDetails,
              escalationDetails: formData.escalationDetails || DEFAULT_FORM_DATA.escalationDetails,
          };
          // Remove the potentially duplicated flat fields if necessary (optional, Zod might ignore)
          // delete dataToValidate.customer_name; 
          // delete dataToValidate.customer_email; 
          // ... etc. for other mapped fields
          console.log("Data prepared for Zod validation:", dataToValidate);
          // --- End Transformation ---

          // Use safeParse with the *transformed* data
          const validationResult = schemaToUse.safeParse(dataToValidate);
          
          if (!validationResult.success) {
              isValid = false;
              const flattenedErrors = validationResult.error.flatten(); // Use Zod's flatten method
              console.warn("Client-side Zod validation errors:", flattenedErrors);
              
              // Transform Zod errors into flat error object for the form state
              validationErrors = Object.entries(flattenedErrors.fieldErrors).reduce((acc: Record<string, any>, [field, messages]) => {
                  // Take the first message for each field
                  if (messages && messages.length > 0) {
                      acc[field] = messages[0];
                  }
                  return acc;
              }, {});

               // Handle nested paths (adjust if Zod outputs differently)
               // Example: If Zod gives {"remedyDetails.demandAmount": ["Error"]} need to parse that key
               // The flatten() method usually handles nesting, but let's double check the output if errors arise.
               // For now, assume flatten provides keys like 'remedyDetails.demandAmount' directly if needed
               // OR provides nested objects that need processing.
               // Let's refine error transformation if needed based on actual Zod output.
               const processNestedErrors = (errorsObj: Record<string, any>, prefix = '') => {
                  let flatErrors: Record<string, any> = {};
                  for (const key in errorsObj) {
                      const fullPath = prefix ? `${prefix}.${key}` : key;
                      if (Array.isArray(errorsObj[key]) && errorsObj[key].length > 0) {
                          // This is likely the _errors array for the object itself or a direct field error array
                          if (key === '_errors') {
                              // Assign error to the parent path if it's an object-level error
                              if(prefix && !flatErrors[prefix]) flatErrors[prefix] = errorsObj[key][0]; 
                          } else if (!flatErrors[fullPath]) {
                              flatErrors[fullPath] = errorsObj[key][0];
                          }
                      } else if (typeof errorsObj[key] === 'object' && errorsObj[key] !== null && !Array.isArray(errorsObj[key])) {
                          // Recurse into nested objects
                          Object.assign(flatErrors, processNestedErrors(errorsObj[key], fullPath));
                      }
                  }
                  return flatErrors;
              };

              validationErrors = processNestedErrors(flattenedErrors.fieldErrors);

              console.log("Transformed Zod errors for state:", validationErrors);
              setErrors(validationErrors);
          } else {
              // Clear previous errors if validation passes now
              console.log("Client-side Zod validation successful.");
              setErrors({});
              // Optionally update formData with transformed data from Zod (e.g., defaults, parsed numbers)
              // setFormData(validationResult.data);
          }
      } else {
          console.warn(`No Zod schema found for document type: ${documentType}. Skipping client-side validation.`);
          // Fallback? Or assume documentType is always valid by this point?
          isValid = false; // Treat missing schema as invalid for safety
          setErrors({ document_type: "Unsupported document type selected." });
      }
      // --- End Zod Client-side Validation ---

      // Track any form errors
      if (!isValid) {
        Object.entries(validationErrors || {}).forEach(([fieldName, errorMessage]) => {
          analytics.trackFormError(fieldName, errorMessage, currentStep);
        });
      } else {
        // If validation passed, collect user identity data for advanced matching
        // This improves conversion tracking in ad platforms
        await analytics.trackUserIdentity(formData, currentStep);
      }
    } else if (currentStep === 2) {
      console.log("[Step 2] Starting validation..."); // DEBUG
      // Validate uploads using the utility function
      const uploadValidation = validateUploads(uploadedFiles, errors) as ValidateUploadsResult;
      console.log("[Step 2] validateUploads result:", uploadValidation); // DEBUG
      // Update errors state based *only* on uploadValidation result
      setErrors(uploadValidation.errors || {}); 
      isValid = uploadValidation.isValid; // Update isValid based on upload check
      console.log("[Step 2] isValid after upload check:", isValid); // DEBUG
      
      // Track upload errors if any
      if (!isValid && uploadValidation.errors?.uploads) {
        console.log("[Step 2] Tracking upload error:", uploadValidation.errors.uploads); // DEBUG
        analytics.trackFormError('uploads', uploadValidation.errors.uploads, currentStep);
      }
      
      // REMOVED the specific check for 'some_type_requiring_uploads' and its scroll logic.
      // The general error handling below will now cover Step 2 errors.

    } else if (currentStep === 3) {
      // Track checkout start before generating document
      analytics.trackCheckoutStart(49.95); // Assuming fixed price - update if dynamic
      
      // Generate document before proceeding to payment
      setIsGenerating(true)
      try {
        const docData = await generateDocument(formData, uploadedFiles);
        
        // Validate the document data before proceeding
        if (!docData) {
          throw new Error("Document generation failed - no data returned");
        }
        
        setDocumentData(docData);
        
        // Track successful document generation with safe property access
        analytics.trackDocumentGeneration(
          safeGetProperty(docData, 'documentType', 'mechanic_dispute')
        );

        // Create checkout session
        const checkoutData = await createCheckoutSession(docData, formData) as CheckoutSessionResult;
        setClientSecret((checkoutData as any)?.sessionId || (checkoutData as any)?.id || "");

        toast({
          title: "Document generated successfully",
          description: "Your document is ready for review",
        });

        shouldProceed = true;
      } catch (error: any) {
        toast({
          title: "Error generating document",
          description: error.message || "There was a problem generating your document. Please try again.",
          variant: "destructive",
        })
        shouldProceed = false
        
        // --- Improved Error Logging ---
        console.error("Error generating document details:", error); 
        if (error.response) {
          console.error("Error response data:", error.response.data);
          console.error("Error response status:", error.response.status);
          console.error("Error response headers:", error.response.headers);
        } else if (error.request) {
          console.error("Error request:", error.request);
        } else {
          console.error('Error message:', error.message);
        }
        console.error("Error config:", error.config);
        // --- End Improved Error Logging ---

        // Track document generation failure
        analytics.trackEvent({
          event: 'document_generation_error',
          error_message: error.message || 'Unknown error'
        });
      } finally {
        setIsGenerating(false)
      }
    } else if (currentStep === 4) {
      // Process payment before proceeding to download
      setIsProcessingPayment(true)
      try {
        console.log("Payment step handleNext called, clientSecret:", clientSecret ? "exists" : "missing")
        
        // Handle payment for the enhanced UI experience
        if (process.env.NEXT_PUBLIC_BYPASS_PAYMENT === "true") {
          // For development mode, bypass payment
          if (!documentData) {
            throw new Error("Document data is missing. Please go back and regenerate the document.");
          }
          // Use a more specific any type assertion to handle the null issue
          const paymentResult = await (processPayment as any)(documentData, stripePromise, clientSecret, true);
          shouldProceed = !!paymentResult

          if (paymentResult) {
            setPaymentSuccess(true)
            
            // Track successful payment with user identity data for enhanced conversion tracking
            analytics.trackPaymentSuccess('dev-bypass-' + Date.now(), 49.95);
            
            toast({
              title: "Payment successful",
              description: "Your payment has been processed successfully",
            })
          }
        } else {
          // Ensure we have a valid client secret before redirecting to Stripe
          if (!clientSecret) {
            console.log("No client secret found, regenerating checkout session...")
            // No client secret available, regenerate checkout session
            const success = await regenerateCheckoutSession()
            if (!success) {
              throw new Error("Failed to prepare payment. Please try again.")
            }
            console.log("Regenerated client secret:", clientSecret ? "exists" : "still missing")
          }
          
          console.log("Proceeding with payment using clientSecret:", clientSecret)
          if (!documentData) {
            throw new Error("Document data is missing. Please go back and regenerate the document.");
          }
          // Use a more specific any type assertion to handle the null issue
          const paymentResult = await (processPayment as any)(documentData, stripePromise, clientSecret);
          shouldProceed = !!paymentResult

          if (paymentResult) {
            setPaymentSuccess(true)
            
            // Track successful payment with user identity data for enhanced conversion tracking
            analytics.trackPaymentSuccess(clientSecret, 49.95);
            
            toast({
              title: "Payment successful",
              description: "Your payment has been processed successfully",
            })
          }
        }
        
        // Clear persisted data on successful payment
        if (shouldProceed) {
          clearPersistedData()
        }
      } catch (error: any) {
        console.error("Payment process error:", error)
        
        // Track payment failure
        analytics.trackPaymentFailure(
          error.code || 'unknown', 
          error.message || 'Unknown payment error'
        );
        
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
        // Track step completion before moving to next step
        analytics.trackStepCompletion(
          currentStep, 
          steps[currentStep - 1].title.toLowerCase().replace(' ', '_'),
          { form_type: 'mechanic_dispute' }
        );
        
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
      // Show error toast if validation fails for *any* step
      if (!isValid) {
        console.log(`[Step ${currentStep}] Validation FAILED. isValid:`, isValid); // DEBUG
        // Use a generic message unless a specific one exists (like from Zod)
        const currentErrors = validationErrors && Object.keys(validationErrors).length > 0 ? validationErrors : errors;
        const firstErrorKey = Object.keys(currentErrors)[0];
        const errorDesc = currentErrors[firstErrorKey] || "Please fix the errors before proceeding.";
        console.log(`[Step ${currentStep}] First error key:`, firstErrorKey, "Description:", errorDesc); // DEBUG
        
        toast({
          title: "Validation Error",
          description: typeof errorDesc === 'string' ? errorDesc : "Please review the highlighted fields.",
          variant: "destructive",
        })

        // --- Scroll to first error field ---
        if (currentStep === 1) {
            console.log("[Step 1 Error Scroll] Trying to scroll to input..."); // DEBUG
            const errorKeys = Object.keys(validationErrors); // Use Zod errors for Step 1
            if (errorKeys.length > 0) {
              const firstErrorKey = errorKeys[0];
              // Attempt to find the element by name attribute
              const errorElement = document.querySelector(`[name="${firstErrorKey}"]`) as HTMLElement | null;
              console.log(`[Step 1 Error Scroll] Found element for ${firstErrorKey}:`, errorElement); // DEBUG
              
              if (errorElement) {
                errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                errorElement.classList.add('input-error-throb');
                setTimeout(() => { errorElement.classList.remove('input-error-throb'); }, 1500); 
              } else {
                 console.warn(`Could not find element for error key: ${firstErrorKey}`);
                 const formSection = document.getElementById(`step${currentStep}Content`);
                 formSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }
            }
        } else if (currentStep === 2) {
            console.log("[Step 2 Error Scroll] Trying to scroll to upload area..."); // DEBUG
            // --- Scroll to upload area for Step 2 errors ---
            const uploadSection = document.getElementById('fileUpload'); 
            console.log("[Step 2 Error Scroll] Found #fileUpload element:", uploadSection); // DEBUG
            if (uploadSection) {
              const uploadContainer = uploadSection.closest('div.border-dashed') as HTMLElement | null; 
              console.log("[Step 2 Error Scroll] Found upload container:", uploadContainer); // DEBUG
              if(uploadContainer) {
                  uploadContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  uploadContainer.classList.add('input-error-throb'); 
                  setTimeout(() => { uploadContainer.classList.remove('input-error-throb'); }, 1500);
              } else {
                  console.warn("Could not find upload container (.border-dashed) for scrolling.");
                  // Fallback scroll to the input itself if container not found
                  uploadSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }
            } else {
               console.warn("Could not find upload section (#fileUpload) for error scrolling.");
               const formSection = document.getElementById(`step${currentStep}Content`);
               formSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
            // --- End scroll to upload area ---
        }
        // --- End scroll to first error field ---
      }
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
      window.scrollTo(0, 0) // Scroll to top on step change
    }
  }

  // Add a function to regenerate checkout session
  const regenerateCheckoutSession = async () => {
    console.log("Starting checkout session regeneration...")
    setIsProcessingPayment(true);
    
    try {
      // Check if document data is missing and form data + uploaded files are available
      if (!documentData && Object.keys(formData).length > 0 && uploadedFiles.length > 0) {
        console.log("Document data missing, regenerating document first...")
        try {
          // Generate the document data first
          const docData = await generateDocument(formData, uploadedFiles)
          setDocumentData(docData)
          
          console.log("Document regeneration successful:", docData)
          
          // Create a new checkout session with the regenerated document data
          console.log("Creating checkout session with regenerated document data...")
          const checkoutData = await createCheckoutSession(docData, formData) as any;
          
          if (!checkoutData || (!checkoutData.sessionId && !checkoutData.id)) {
            throw new Error("Invalid checkout session response from server")
          }
          
          const sessionId = checkoutData.sessionId || checkoutData.id;
          console.log("Successfully obtained new checkout session ID:", sessionId)
          setClientSecret(sessionId || "");
          setIsProcessingPayment(false)
          return true
        } catch (docError) {
          console.error("Error regenerating document:", docError)
          toast({
            title: "Error preparing document",
            description: "There was a problem regenerating your document. Please go back to the review step and try again.",
            variant: "destructive",
          })
          setIsProcessingPayment(false)
          return false
        }
      }
      
      // If we reach here and still don't have document data, show an error
      if (!documentData) {
        console.error("Cannot regenerate checkout session: No document data available")
        toast({
          title: "Error preparing payment",
          description: "Unable to prepare payment. Please generate your document first.",
          variant: "destructive",
        })
        setIsProcessingPayment(false)
        return false
      }
      
      // Create a new checkout session
      console.log("Calling createCheckoutSession API...")
      const checkoutData = await createCheckoutSession(documentData, formData) as any;
      
      if (!checkoutData || (!checkoutData.sessionId && !checkoutData.id)) {
        throw new Error("Invalid checkout session response from server")
      }
      
      const sessionId = checkoutData.sessionId || checkoutData.id;
      console.log("Successfully obtained new checkout session ID:", sessionId)
      setClientSecret(sessionId || "");
      setIsProcessingPayment(false)
      return true
    } catch (error: any) {
      console.error("Error regenerating checkout session:", error)
      toast({
        title: "Error preparing payment",
        description: "There was a problem preparing the payment. Please try again.",
        variant: "destructive",
      })
      setIsProcessingPayment(false)
      return false
    }
  }

  // Simplified handler to jump to a specific step (e.g., for the stepper itself)
  const goToStep = (stepId: number) => {
    if (stepId <= currentStep) {
      setCurrentStep(stepId)
      window.scrollTo(0, 0)
      
      // If going back to the payment step, regenerate checkout session
      if (stepId === 4) {
        regenerateCheckoutSession()
      }
    }
  }

  // Add a new function to start the claim process
  const startClaim = () => {
    setClaimStarted(true)
    setCurrentStep(1)
    
    // Track claim start
    analytics.trackClaimStart();
    
    // Scroll to top of form
    window.scrollTo(0, 0)
  }

  // Handler for resetting the form
  const handleStartOver = () => {
    // Reset form fields
    setCurrentStep(1)
    setClaimStarted(false)
    setErrors({})
    setFormTouched({})
    setUploadedFiles([])
    setFormData(DEFAULT_FORM_DATA)
    setDocumentData(null)
    setPaymentSuccess(false)
    setClientSecret("")
    window.scrollTo(0, 0)
    
    // Clear persisted data
    clearPersistedData()

    toast({
      title: "Form reset",
      description: "You can start a new dispute claim",
    })
  }

  // Check for payment_cancelled parameter on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const paymentCancelled = urlParams.get("payment_cancelled")

    if (paymentCancelled === "true" && documentData) {
      // If payment was cancelled and we have document data,
      // set the current step to review (step 3)
      setCurrentStep(3)
      
      // Clean up the URL
      window.history.replaceState({}, document.title, window.location.pathname)
      
      toast({
        title: "Payment cancelled",
        description: "You can try again or make changes to your document",
      })
    }
  }, [documentData])
  
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
          
          // Clear persisted data on successful payment
          clearPersistedData()

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
  
  // Regenerate checkout session when entering the payment step
  useEffect(() => {
    // Always regenerate the checkout session when at the payment step
    if (currentStep === 4) {
      console.log("On payment step, checking requirements...", {
        hasDocumentData: !!documentData,
        hasFormData: Object.keys(formData).length > 0,
        hasUploadedFiles: uploadedFiles.length > 0
      })
      
      // Add a small delay to ensure all states are settled
      const timer = setTimeout(() => {
        regenerateCheckoutSession()
      }, 300)
      
      return () => clearTimeout(timer)
    }
  }, [currentStep])

  // Helper function to safely get nested properties (could be used throughout the component)
  const safeGetProperty = (obj: any, path: string, fallback: any = '') => {
    try {
      return path.split('.').reduce((o, p) => (o || {})[p], obj) || fallback;
    } catch (e) {
      return fallback;
    }
  }

  const renderCurrentStep = () => {
    // Use type assertions to bypass component prop errors since we can't modify the component files directly
    try {
      switch (currentStep) {
        case 1:
          return (
            <Step1Details
              {...({
                formData,
                formTouched,
                errors,
                handleInputChange,
                handleNext,
                handleStateChange,
                handleDemandTypeChange,
                handleEscalationBodyChange: () => {}, // Add a no-op function to satisfy the interface
                handleInsuranceChange
              } as any)}
            />
          );
        case 2:
          return (
            <Step2Upload
              uploadedFiles={uploadedFiles}
              formData={formData}
              formTouched={formTouched}
              handleInputChange={handleInputChange}
              handleCheckboxChange={handleCheckboxChange}
              handleFileSelect={handleFileSelect}
              handleRemoveFile={handleRemoveFile}
              isUploading={isUploading}
              errors={errors}
              handleNext={handleNext}
              handleBack={handleBack}
              formatFileSize={formatFileSize}
            />
          );
        case 3:
          return (
            <Step3Review 
              goToStep={goToStep}
              formData={formData} 
              uploadedFiles={uploadedFiles} 
              handleNext={handleNext}
              handleBack={handleBack}
              isGenerating={isGenerating}
            />
          );
        case 4:
          return (
            <Step4Payment
              {...({
                isProcessingPayment,
                clientSecret,
                documentData: documentData || {}, // Provide empty object when null
                checkPaymentStatus,
                stripePromise,
                handleNext,
                handleBack,
                formatCurrency,
                paymentSuccess,
              } as any)}
            />
          );
        case 5:
          return (
            <Step5Download 
              documentData={documentData || {} as any} // Provide empty object when null
              onDownload={handleDownload}
            />
          );
        default:
          return null;
      }
    } catch (error) {
      console.error("Error rendering step:", error);
      return (
        <div className="p-4 border border-red-300 bg-red-50 rounded">
          <h3 className="text-lg font-medium text-red-800">Something went wrong</h3>
          <p className="mt-2 text-sm text-red-700">
            There was an error displaying this step. Please try refreshing the page.
          </p>
        </div>
      );
    }
  };

  // Handle document download in the final step
  const handleDownload = (format: string) => {
    // Skip if there's no document data or if not in browser
    if (typeof window === 'undefined' || !documentData) return;
    
    // Ensure format is a string
    const safeFormat = String(format || 'pdf');
    
    // Track document download with extra safety against undefined values
    analytics.trackDocumentDownload(
      safeGetProperty(documentData, 'documentType', 'mechanic_dispute'), 
      safeFormat
    );
    
    // Get the URL safely
    const downloadUrl = safeGetProperty(documentData, `${safeFormat}Url`);
    
    // Only try to open if we have a valid URL
    if (downloadUrl && typeof downloadUrl === 'string') {
      window.open(downloadUrl, '_blank');
    } else {
      console.warn(`No download URL available for format: ${safeFormat}`);
      toast({
        title: "Download Error",
        description: `Document is not available in ${safeFormat.toUpperCase()} format.`,
        variant: "destructive"
      });
    }
  };

  return (
    <main>
      {/* Hero Section */}
      <HeroSection 
        claimStarted={claimStarted} 
        startClaim={startClaim}
        handleStartOver={handleStartOver}
        currentStep={currentStep}
        steps={steps}
      />

      {/* Main Content - Always shown */}
      <div className="mt-4 sm:mt-8 mb-16 mx-auto px-4 sm:px-6 md:px-8 max-w-4xl">
        {/* Step Indicator */}
        <StepIndicator 
          currentStep={currentStep} 
          steps={steps} 
          goToStep={goToStep} 
        />

        {/* Render Current Step */}
        <div className="mt-10">
          {isClient ? renderCurrentStep() : (
            <div className="p-4 border border-muted rounded-md animate-pulse">
              <div className="text-center py-6">
                <div className="h-7 w-64 mx-auto bg-muted-foreground/20 rounded"></div>
                <div className="h-4 w-48 mx-auto mt-4 bg-muted-foreground/20 rounded"></div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Show testimonials and CTA only before the claim begins */}
      {!claimStarted && (
        <>
          <Testimonials />
          <CTASection startClaim={startClaim} />
        </>
      )}
    </main>
  )
}
