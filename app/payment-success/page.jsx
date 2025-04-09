import { redirect } from "next/navigation"
import { retrieveCheckoutSession } from "@/lib/stripe-integration"

/**
 * Page that handles the redirect from Stripe after successful payment
 * @param {Object} searchParams - URL search parameters including session_id
 */
export default async function PaymentSuccessPage({ searchParams }) {
  const sessionId = searchParams.session_id

  try {
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

      // Redirect to the thank-you page
      redirect(`/thank-you/${filename}`)
    } else {
      // Payment not successful or session invalid
      console.warn("Payment not successful or session invalid:", sessionId, session?.payment_status)
      redirect("/payment-cancelled")
    }
  } catch (error) {
    console.error("Error handling payment success:", error)

    // Show a simple loading message before redirecting
    // In a production app, you would handle this more gracefully
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#E8EAEC]">
        <div className="card p-8 text-center max-w-md">
          <h1 className="text-2xl font-bold mb-4">Processing Payment</h1>
          <p className="mb-6">Please wait while we verify your payment...</p>
          <div className="spinner mx-auto"></div>
          <p className="mt-4 text-gray-500">You will be redirected automatically.</p>

          <div className="mt-6 p-4 bg-[#f1f5f9] rounded-lg text-sm text-gray-500">
            <p>If you're not redirected within 10 seconds, please contact support with this session ID:</p>
            <p className="font-mono mt-2">{sessionId || "No session ID provided"}</p>
          </div>
        </div>
      </div>
    )
  }
}
