"use server"

import { redirect } from "next/navigation"
import { retrieveCheckoutSession } from "@/lib/stripe-integration"

/**
 * Page that handles the redirect from Stripe after successful payment
 * @param {Object} context - Page context
 * @param {Promise<{session_id?: string}>} context.searchParams - URL search parameters
 */
export default async function PaymentSuccessPage({ searchParams }) {
  let redirectTarget = "/payment-cancelled"; // Default redirect

  try {
    // Await searchParams to access its properties
    const { session_id: sessionId } = await searchParams

    if (!sessionId) {
      throw new Error("Missing Stripe session ID")
    }

    // Retrieve the session from Stripe
    const session = await retrieveCheckoutSession(sessionId)

    if (session && session.payment_status === "paid") {
      // Payment successful, retrieve metadata
      const filename = session.metadata?.filename

      if (!filename) {
        throw new Error("Filename missing from Stripe session metadata")
      }

      // Set the target for successful redirect
      redirectTarget = `/api/payment-finalize?filename=${encodeURIComponent(filename)}`
    } else {
      // Payment not successful or session invalid
      console.warn("Payment not successful or session invalid:", sessionId, session?.payment_status)
      // redirectTarget remains "/payment-cancelled"
    }
  } catch (error) {
    console.error("Error handling payment success during validation:", error)
    // redirectTarget remains "/payment-cancelled" on any error during validation
  }

  // Perform the redirect *after* the try...catch block
  // This allows NEXT_REDIRECT to propagate correctly without being caught above.
  redirect(redirectTarget)

  // Note: Execution stops here due to redirect, so nothing below this line runs.
  // Returning null or a fallback component isn't strictly necessary but can be good practice.
  // return null;
}
