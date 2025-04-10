/**
 * Stripe payment integration for Next.js
 */
import Stripe from "stripe"

// Initialize Stripe with the API key and proper Cloudflare Workers compatibility
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: '2024-06-20',
  httpClient: {
    // Custom HTTP client implementation using native fetch
    requestAsync: async (options) => {
      const url = new URL(options.host);
      url.pathname = options.path;
      url.protocol = options.protocol;
      
      const fetchOptions = {
        method: options.method,
        headers: {
          'Authorization': `Bearer ${process.env.STRIPE_SECRET_KEY}`,
          'Content-Type': 'application/x-www-form-urlencoded',
          'Stripe-Version': '2024-06-20',
          ...options.headers,
        },
        body: options.body || undefined,
      };
      
      try {
        const response = await fetch(url.toString(), fetchOptions);
        const data = await response.json();
        
        return {
          statusCode: response.status,
          headers: Object.fromEntries(response.headers.entries()),
          body: JSON.stringify(data)
        };
      } catch (error) {
        throw new Error(`Stripe API request failed: ${error.message}`);
      }
    }
  }
});

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

    try {
      // Direct implementation using fetch for Cloudflare Workers compatibility
      const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.STRIPE_SECRET_KEY}`,
          'Content-Type': 'application/x-www-form-urlencoded',
          'Stripe-Version': '2024-06-20'
        },
        body: new URLSearchParams({
          'payment_method_types[]': 'card',
          'mode': 'payment',
          'success_url': `${appUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
          'cancel_url': `${appUrl}/payment-cancelled`,
          'line_items[0][price_data][currency]': 'aud',
          'line_items[0][price_data][product_data][name]': `Legal Document: ${documentTypes[documentType] || "Australian Mechanic Dispute Document"}`,
          'line_items[0][price_data][product_data][description]': 'Professional legal document for resolving disputes with mechanics in Australia',
          'line_items[0][price_data][unit_amount]': '5499',
          'line_items[0][quantity]': '1',
          'metadata[filename]': filename,
          'metadata[documentType]': documentType,
          'metadata[customerName]': customerName,
          ...(metadata.customerEmail ? {'customer_email': metadata.customerEmail} : {})
        }).toString()
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to create checkout session');
      }

      const session = await response.json();
      
      return {
        id: session.id,
        url: session.url,
        filename,
      };
    } catch (error) {
      console.error("Direct Stripe API error:", error);
      throw error;
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

    // Direct implementation using fetch for Cloudflare Workers compatibility
    try {
      const response = await fetch(`https://api.stripe.com/v1/checkout/sessions/${sessionId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${process.env.STRIPE_SECRET_KEY}`,
          'Content-Type': 'application/x-www-form-urlencoded',
          'Stripe-Version': '2024-06-20'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to retrieve checkout session');
      }

      return await response.json();
    } catch (error) {
      console.error("Direct Stripe API error:", error);
      throw error;
    }
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

    try {
      // Verify the signature and construct the event
      const event = stripe.webhooks.constructEvent(payload, signature, process.env.STRIPE_WEBHOOK_SECRET)
      return event;
    } catch (error) {
      // Fallback to direct implementation if stripe SDK fails
      console.error("Stripe SDK webhook verification failed, trying manual verification:", error);
      
      // At this point we should implement manual webhook verification, but for now
      // we'll log the error and let the original error propagate
      throw error;
    }
  } catch (error) {
    console.error("Webhook signature verification failed:", error)
    throw new Error(`Webhook verification failed: ${error.message}`)
  }
}
