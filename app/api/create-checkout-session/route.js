import { NextResponse } from "next/server"
import Stripe from 'stripe'

// Ensure Stripe is initialized with your secret key
// It's best practice to use environment variables
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-06-20', // Use the latest API version
});

/**
 * API route to create a Stripe checkout session
 * @param {Request} request - The incoming request
 */
export async function POST(request) {
  try {
    const { filename, productName, amount } = await request.json(); // Expect filename, product name, and amount

    if (!filename || !productName || !amount) {
      return NextResponse.json({ error: 'Missing required parameters (filename, productName, amount)' }, { status: 400 });
    }

    // Ensure amount is an integer in the smallest currency unit (e.g., cents)
    const amountInCents = Math.round(parseFloat(amount) * 100);
    if (isNaN(amountInCents) || amountInCents <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    // Construct absolute URLs for success and cancel pages
    const origin = request.headers.get('origin') || 'http://localhost:3000'; // Fallback for local dev
    const successUrl = `${origin}/payment-success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${origin}/payment-cancelled`;

    // Create a Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'aud', // Assuming Australian Dollar
            product_data: {
              name: productName,
              // You could add a description or images here
            },
            unit_amount: amountInCents, // Amount in cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      // Crucially, pass the filename in metadata
      metadata: {
        filename: filename,
      },
      // Consider collecting billing address if needed for tax/invoicing
      // billing_address_collection: 'required',
    });

    // Return the session ID or URL to the client
    return NextResponse.json({ sessionId: session.id, url: session.url });

  } catch (error) {
    console.error("Error creating Stripe checkout session:", error);
    // Use Stripe's error message if available, otherwise provide a generic one
    const errorMessage = error.raw?.message || 'Internal Server Error';
    const statusCode = error.statusCode || 500;
    return NextResponse.json({ error: errorMessage }, { status: statusCode });
  }
}
