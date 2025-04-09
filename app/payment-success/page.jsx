import { redirect } from "next/navigation"
import { retrieveCheckoutSession } from "@/lib/stripe-integration"

// Mark the page as dynamic since it uses searchParams
export const dynamic = 'force-dynamic';

export default async function PaymentSuccessPage({ searchParams }) {
  let redirectTarget = "/payment-cancelled"; // Default redirect

  try {
    // Access searchParams directly
    const sessionId = searchParams.session_id

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

  // Perform the redirect
  redirect(redirectTarget)
}
