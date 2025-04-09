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
      apiFormData.append(key, value)
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
    const response = await fetch("/api/create-checkout-session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        filename: documentData.filename,
        documentType: formData.document_type,
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
 * @returns {Promise<boolean>} - Whether payment was successful
 */
export async function processPayment(documentData, stripePromise, clientSecret) {
  try {
    // If we're bypassing payment in development
    if (process.env.BYPASS_PAYMENT === "true") {
      // Simulate successful payment
      await new Promise((resolve) => setTimeout(resolve, 1000))
      return true
    }

    // Redirect to Stripe Checkout
    const stripe = await stripePromise
    const { error } = await stripe.redirectToCheckout({
      sessionId: clientSecret,
    })

    if (error) {
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
