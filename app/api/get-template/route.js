export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { getAustralianTemplate } from "@/lib/australian-templates"

/**
 * API route to retrieve a template by type
 * @param {Request} request - The incoming request
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const templateType = searchParams.get("type")

    if (!templateType) {
      return NextResponse.json(
        {
          error: "Missing template type parameter",
        },
        { status: 400 },
      )
    }

    // Log for debugging
    console.log("Template type requested:", templateType)

    // Get the template
    let template = getAustralianTemplate(templateType)

    // Basic sanitization
    template = template.replace(/[\x00-\x09\x0B\x0C\x0E-\x1F\x7F]/g, "")

    // Return the sanitized template as plain text
    return new NextResponse(template, {
      headers: { "Content-Type": "text/plain" },
    })
  } catch (error) {
    console.error("Template retrieval error:", error)

    // Send a simple fallback template in case of error
    const fallbackTemplate = `
[Your Name]
[Your Address]

Dear Sir/Madam,

RE: Mechanic Dispute - Vehicle Damage Claim

I am writing regarding damage to my vehicle that occurred while it was in your care for servicing.

Yours faithfully,
[Your Name]`

    return new NextResponse(fallbackTemplate, {
      headers: { "Content-Type": "text/plain" },
    })
  }
}
