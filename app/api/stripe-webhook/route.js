import Stripe from 'stripe'
import { NextResponse } from 'next/server'
import { headers } from 'next/headers'

// Initialize Stripe client using the secret key from environment variables
// Ensure STRIPE_SECRET_KEY is set in your .env.local or environment
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-06-20', // Use the API version you are developing against
  typescript: true,
})

// Get the webhook secret from environment variables
// Ensure STRIPE_WEBHOOK_SECRET is set in your .env.local or environment
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || ''

export async function POST(req) {
  if (!webhookSecret) {
    console.error('Stripe webhook secret is not configured.')
    return NextResponse.json({ error: 'Webhook secret not configured.' }, { status: 500 })
  }

  try {
    const rawBody = await req.text()
    const headerPayload = await headers()
    const signature = headerPayload.get('stripe-signature')

    if (!signature) {
      console.error('Missing stripe-signature header')
      return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
    }

    let event

    try {
      // Verify the event signature
      event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret)
    } catch (err) {
      console.error(`⚠️ Webhook signature verification failed: ${err.message}`)
      return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 })
    }

    // Handle the event
    console.log(`Received Stripe event: ${event.type}`, event.id)

    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object
        console.log(`Checkout session completed for session ID: ${session.id}`)
        // TODO: Fulfill the purchase, e.g., update database, grant access
        // Access session details: session.customer_details, session.metadata, session.payment_status etc.
        // Example: updateOrderStatus(session.id, session.payment_status);
        break
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object
        console.log(`PaymentIntent succeeded: ${paymentIntent.id}`)
        // Handle successful payment intent if needed (often covered by checkout.session.completed)
        break
      // ... handle other event types as needed
      default:
        console.warn(`Unhandled event type ${event.type}`)
    }

    // Return a 200 response to acknowledge receipt of the event
    return NextResponse.json({ received: true }, { status: 200 })
  } catch (error) {
    console.error('Error processing webhook:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
} 