export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { retrieveCheckoutSession } from "@/lib/stripe-integration"

/**
 * API route to check the status of a Stripe payment
 * @param {Request} request - The incoming request
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get("session_id")

    if (!sessionId) {
      return NextResponse.json(
        {
          error: "Missing session_id",
        },
        { status: 400 },
      )
    }

    // Retrieve the session from Stripe
    const session = await retrieveCheckoutSession(sessionId)

    // Return the payment status
    return NextResponse.json({
      status: session.payment_status,
      customer_email: session.customer_details?.email,
      metadata: session.metadata,
    })
  } catch (error) {
    console.error("Stripe session retrieval failed:", error)
    return NextResponse.json(
      {
        error: error.message,
      },
      { status: 500 },
    )
  }
}
