import Stripe from 'stripe'

// Initialize Stripe with the fetch HTTP client for Cloudflare Workers compatibility
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-06-20', // Use the latest API version
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
 * API route to create a Stripe checkout session
 * @param {Request} request - The incoming request
 */
export async function POST(request) {
  try {
    console.log("Starting checkout session creation");
    const { filename, productName, amount } = await request.json(); // Expect filename, product name, and amount

    if (!filename || !productName || !amount) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters (filename, productName, amount)' }), 
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Ensure amount is an integer in the smallest currency unit (e.g., cents)
    const amountInCents = Math.round(parseFloat(amount) * 100);
    if (isNaN(amountInCents) || amountInCents <= 0) {
      return new Response(
        JSON.stringify({ error: 'Invalid amount' }), 
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Construct absolute URLs for success and cancel pages
    const origin = request.headers.get('origin') || 'http://localhost:3000'; // Fallback for local dev
    const successUrl = `${origin}/payment-success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${origin}/payment-cancelled`;

    console.log("Creating Stripe checkout session");
    
    // Direct implementation using fetch for Cloudflare Workers environment
    const checkoutResponse = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Stripe-Version': '2024-06-20'
      },
      body: new URLSearchParams({
        'payment_method_types[]': 'card',
        'mode': 'payment',
        'success_url': successUrl,
        'cancel_url': cancelUrl,
        'metadata[filename]': filename,
        'line_items[0][price_data][currency]': 'aud',
        'line_items[0][price_data][product_data][name]': productName,
        'line_items[0][price_data][unit_amount]': amountInCents.toString(),
        'line_items[0][quantity]': '1'
      }).toString()
    });

    if (!checkoutResponse.ok) {
      const errorData = await checkoutResponse.json();
      console.error("Stripe API error:", errorData);
      return new Response(
        JSON.stringify({ error: errorData.error?.message || 'Error creating checkout session' }), 
        { status: checkoutResponse.status, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const session = await checkoutResponse.json();
    console.log("Session created successfully:", session.id);
    
    // Return the session ID or URL to the client
    return new Response(
      JSON.stringify({ sessionId: session.id, url: session.url }), 
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error("Error creating Stripe checkout session:", error.message, error.stack);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal Server Error' }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
