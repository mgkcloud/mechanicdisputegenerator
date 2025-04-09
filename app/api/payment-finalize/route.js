import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const filename = searchParams.get('filename')

  if (!filename) {
    console.error("Payment Finalize: Filename missing from query parameters.")
    // Redirect to a generic error or cancelled page if filename is missing
    return NextResponse.redirect(new URL('/payment-cancelled', request.url))
  }

  try {
    // Set the cookie to clear localStorage on the client-side
    cookies().set("clear_form_storage", "true", { 
      maxAge: 60, // Short expiry (seconds)
      path: "/",
      httpOnly: false, // Needs to be readable by client-side JS
      secure: process.env.NODE_ENV === 'production', // Use secure in production
      sameSite: 'lax' // Recommended setting
    })

    // Construct the final redirect URL to the thank-you page
    const thankYouUrl = new URL(`/thank-you/${filename}`, request.url)

    // Perform the redirect
    return NextResponse.redirect(thankYouUrl)

  } catch (error) {
    console.error("Error in payment finalize route:", error)
    // Redirect to a generic error or cancelled page on error
    return NextResponse.redirect(new URL('/payment-cancelled', request.url))
  }
} 