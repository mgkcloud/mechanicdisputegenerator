import { NextResponse } from "next/server"
import { createCheckoutSession } from "@/lib/stripe-integration"
import { handleApiError, validateRequiredFields } from "@/lib/error-utils"

/**
 * API route to create a Stripe checkout session
 * @param {Request} request - The incoming request
 */
export async function POST(request) {
  try {
    // Extract the metadata from the request
    const body = await request.json()

    // Validate required fields
    validateRequiredFields(body, ["filename"])

    // Create the checkout session
    const session = await createCheckoutSession(body, body.customerName || "Customer")

    // Return the session ID
    return NextResponse.json({
      id: session.id,
      url: session.url,
    })
  } catch (error) {
    const errorResponse = handleApiError(error)
    return NextResponse.json(errorResponse, { status: errorResponse.statusCode })
  }
}
