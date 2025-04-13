/**
 * Generate document
 * @param {Object} formData - Form data
 * @param {Array} uploadedFiles - Uploaded files
 * @returns {Promise<Object>} - Generated document data
 */
export async function generateDocument(formData, uploadedFiles) {
  try {
    // Create form data to send to API
    const apiFormData = new FormData()

    // Add all form fields to the API request
    Object.entries(formData).forEach(([key, value]) => {
      // Check if the value is an object (not null, not FormData, not File) and needs to be stringified
      if (value !== null && typeof value === 'object' && !(value instanceof FormData) && !(value instanceof File)) {
        apiFormData.append(key, JSON.stringify(value))
      } else {
        apiFormData.append(key, value)
      }
    })

    // Add information about uploaded files
    uploadedFiles.forEach((file, index) => {
      apiFormData.append(`evidence_${index}`, file.name)
      apiFormData.append(`evidence_${index}_type`, file.type)
      apiFormData.append(`evidence_${index}_url`, file.url)
    })

    // Call the API to generate the document
    const response = await fetch("/api/generate-document", {
      method: "POST",
      body: apiFormData,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "Failed to generate document")
    }

    const data = await response.json()

    if (!data.success) {
      throw new Error(data.error || "Document generation failed")
    }

    return data
  } catch (error) {
    console.error("Error generating document:", error)
    throw error
  }
}

/**
 * Create checkout session
 * @param {Object} documentData - Generated document data
 * @param {Object} formData - Form data
 * @returns {Promise<Object>} - Checkout session data
 */
export async function createCheckoutSession(documentData, formData) {
  try {
    // Define product name based on document type
    const documentTypeName = formData.document_type === "letter_of_demand" 
      ? "Letter of Demand"
      : "Legal Document";
    
    // Set fixed price for the document (in AUD)
    const documentPrice = 49.99; 
    
    const response = await fetch("/api/create-checkout-session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        filename: documentData.filename,
        productName: documentTypeName,
        amount: documentPrice,
        customerName: formData.customer_name,
        customerEmail: formData.customer_email,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "Failed to create checkout session")
    }

    return await response.json()
  } catch (error) {
    console.error("Error creating checkout session:", error)
    throw error
  }
}

/**
 * Process payment
 * @param {Object} documentData - Generated document data
 * @param {Object} stripePromise - Stripe promise
 * @param {string} clientSecret - Stripe client secret
 * @param {boolean} bypassForUi - Bypass payment for enhanced UI preview
 * @returns {Promise<boolean>} - Whether payment was successful
 */
export async function processPayment(documentData, stripePromise, clientSecret, bypassForUi = false) {
  try {
    console.log("processPayment called with clientSecret:", clientSecret ? clientSecret.substring(0, 10) + "..." : "missing")
    
    // If we're bypassing payment for the enhanced UI experience
    if (bypassForUi) {
      console.log("Payment bypassed for enhanced UI experience")
      // Simulate successful payment
      await new Promise((resolve) => setTimeout(resolve, 1000))
      return true
    }
    
    // Check if all required parameters are present
    if (!stripePromise) {
      console.error("stripePromise is missing")
      throw new Error("Stripe is not properly initialized")
    }
    
    if (!clientSecret) {
      console.error("clientSecret is missing")
      throw new Error("No checkout session ID available")
    }
    
    // If we're bypassing payment in development
    if (process.env.NEXT_PUBLIC_BYPASS_PAYMENT === "true") {
      console.log("Payment bypassed in development mode")
      // Simulate successful payment
      await new Promise((resolve) => setTimeout(resolve, 1000))
      return true
    }

    // Redirect to Stripe Checkout
    console.log("Initializing Stripe and redirecting to checkout...")
    const stripe = await stripePromise
    
    if (!stripe) {
      console.error("Failed to initialize Stripe")
      throw new Error("Payment provider initialization failed")
    }
    
    console.log("Calling stripe.redirectToCheckout with sessionId:", clientSecret)
    const { error } = await stripe.redirectToCheckout({
      sessionId: clientSecret,
    })

    if (error) {
      console.error("Stripe redirectToCheckout error:", error)
      throw new Error(error.message)
    }

    // Note: The actual payment success will be handled by the redirect back from Stripe
    // We won't reach this point in normal flow as the page will redirect
    return true
  } catch (error) {
    console.error("Payment error:", error)
    throw error
  }
}

/**
 * Check payment status
 * @param {string} sessionId - Stripe session ID
 * @returns {Promise<boolean>} - Whether payment was successful
 */
export async function checkPaymentStatus(sessionId) {
  try {
    const response = await fetch(`/api/check-payment?session_id=${sessionId}`)

    if (!response.ok) {
      throw new Error("Failed to check payment status")
    }

    const data = await response.json()
    return data.status === "paid"
  } catch (error) {
    console.error("Error checking payment status:", error)
    return false
  }
}
