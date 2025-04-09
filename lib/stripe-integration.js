/**
 * Stripe payment integration for Next.js
 */
import Stripe from "stripe"

// Initialize Stripe with the API key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "")

/**
 * Create a checkout session with Stripe
 * @param {Object} metadata - Metadata to include with the session
 * @param {string} customerName - Customer's name
 * @returns {Promise<Object>} - Stripe checkout session
 */
export async function createCheckoutSession(metadata, customerName) {
  try {
    const bypassPayment = process.env.BYPASS_PAYMENT === "true"

    // If bypass is enabled, return mock data
    if (bypassPayment) {
      console.log("Payment bypassed per environment configuration")
      return getMockSession(metadata)
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      console.warn("Stripe API key not configured, using mock data")
      return getMockSession(metadata)
    }

    // Extract document details from metadata
    const { filename, documentType } = metadata

    // App URL for redirect URLs
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

    // Map document types to user-friendly names
    const documentTypes = {
      letter_of_demand: "Letter of Demand to Mechanic",
      consumer_complaint: "Consumer Affairs Victoria Complaint",
      vcat_application: "VCAT Application Form",
      insurance_claim: "Insurance Claim Support Letter",
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "aud",
            product_data: {
              name: `Legal Document: ${documentTypes[documentType] || "Australian Mechanic Dispute Document"}`,
              description: "Professional legal document for resolving disputes with mechanics in Australia",
            },
            unit_amount: 4999, // $49.99 AUD
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${appUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/payment-cancelled`,
      metadata: {
        filename,
        documentType,
        customerName,
      },
      customer_email: metadata.customerEmail, // If available
    })

    return {
      id: session.id,
      url: session.url,
      filename,
    }
  } catch (error) {
    console.error("Stripe checkout error:", error)

    // Fall back to mock data in development or if explicitly allowed
    if (process.env.NODE_ENV === "development" || process.env.BYPASS_PAYMENT === "true") {
      console.warn("Using mock checkout session due to error")
      return getMockSession(metadata)
    }

    throw new Error(`Failed to create checkout session: ${error.message}`)
  }
}

/**
 * Retrieve a checkout session from Stripe
 * @param {string} sessionId - Stripe checkout session ID
 * @returns {Promise<Object>} - Stripe checkout session
 */
export async function retrieveCheckoutSession(sessionId) {
  try {
    const bypassPayment = process.env.BYPASS_PAYMENT === "true"

    // If bypass is enabled, return mock data
    if (bypassPayment) {
      console.log("Payment verification bypassed per environment configuration")
      return getMockSessionInfo(sessionId)
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      console.warn("Stripe API key not configured, using mock data")
      return getMockSessionInfo(sessionId)
    }

    // Retrieve the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    return session
  } catch (error) {
    console.error("Stripe session retrieval error:", error)

    // Fall back to mock data in development or if explicitly allowed
    if (process.env.NODE_ENV === "development" || process.env.BYPASS_PAYMENT === "true") {
      console.warn("Using mock session info due to error")
      return getMockSessionInfo(sessionId)
    }

    throw new Error(`Failed to retrieve checkout session: ${error.message}`)
  }
}

/**
 * Get a mock session for development/testing
 * @param {Object} metadata - Session metadata
 * @returns {Object} - Mock session object
 */
function getMockSession(metadata) {
  // Generate unique IDs
  const sessionId = `cs_test_${Math.random().toString(36).substring(2, 15)}`
  const { filename, documentType, customerName } = metadata

  return {
    id: sessionId,
    url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/payment-success?session_id=${sessionId}`,
    filename,
    status: "created",
    client_secret: `cs_secret_${Math.random().toString(36).substring(2, 15)}`,
    expires_at: Math.floor(Date.now() / 1000) + 3600, // Expires in 1 hour
    payment_status: "unpaid",
    metadata: {
      filename,
      documentType,
      customerName,
    },
  }
}

/**
 * Get mock session info for development/testing
 * @param {string} sessionId - Session ID
 * @returns {Object} - Mock session info
 */
function getMockSessionInfo(sessionId) {
  return {
    id: sessionId || `cs_test_${Math.random().toString(36).substring(2, 15)}`,
    status: "complete",
    payment_status: "paid",
    customer_details: {
      email: "customer@example.com",
      name: "John Customer",
    },
    amount_total: 4999,
    currency: "aud",
    metadata: {
      filename: "letter_of_demand_mock",
      documentType: "letter_of_demand",
      customerName: "John Customer",
    },
  }
}

/**
 * Verify a Stripe webhook signature
 * @param {string} payload - Raw request body
 * @param {string} signature - Stripe signature from headers
 * @returns {Object} - Webhook event
 */
export function verifyWebhookSignature(payload, signature) {
  try {
    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      throw new Error("Stripe webhook secret not configured")
    }

    // Verify the signature and construct the event
    const event = stripe.webhooks.constructEvent(payload, signature, process.env.STRIPE_WEBHOOK_SECRET)

    return event
  } catch (error) {
    console.error("Webhook signature verification failed:", error)
    throw new Error(`Webhook verification failed: ${error.message}`)
  }
}
