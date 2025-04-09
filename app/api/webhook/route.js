import { NextResponse } from "next/server"
import { verifyWebhookSignature } from "@/lib/stripe-integration"

/**
 * API route to handle Stripe webhooks
 * @param {Request} request - The incoming request
 */
export async function POST(request) {
  try {
    // Get the request body as text for signature verification
    const payload = await request.text()
    const signature = request.headers.get("stripe-signature")

    if (!signature) {
      return NextResponse.json(
        {
          error: "Missing stripe-signature header",
        },
        { status: 400 },
      )
    }

    // Verify the webhook signature
    const event = verifyWebhookSignature(payload, signature)

    // Handle different event types
    switch (event.type) {
      case "checkout.session.completed":
        const session = event.data.object
        console.log(`Checkout session completed: ${session.id}, Status: ${session.payment_status}`)

        // Handle successful payment (e.g., send confirmation email)
        // You can access the document filename from session.metadata.filename
        if (session.metadata?.filename) {
          // Here you could send an email with the document link
          console.log(`Document ${session.metadata.filename} is ready for customer ${session.customer_details?.email}`)
        }
        break

      // Add handlers for other event types as needed
      default:
        console.log(`Unhandled event type ${event.type}`)
    }

    // Return a 200 success response
    return NextResponse.json({ received: true })
  } catch (error) {
    console.error(`Webhook Error: ${error.message}`)
    return NextResponse.json(
      {
        error: `Webhook Error: ${error.message}`,
      },
      { status: 400 },
    )
  }
}
