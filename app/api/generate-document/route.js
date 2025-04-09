import { NextResponse } from "next/server"
import { generateLetterOfDemand } from "@/lib/letter-of-demand"
import { generateAustralianDocument } from "@/lib/document-generator-au"
import { generatePdfHtml } from "@/lib/pdf-generator"
import { storeDocument } from "@/lib/document-storage"
import { handleApiError, validateRequiredFields, ApiError } from "@/lib/error-utils"

/**
 * API route to generate a legal document
 * @param {Request} request - The incoming request
 */
export async function POST(request) {
  try {
    // Parse form data from the request
    const formData = await request.formData()
    const documentType = formData.get("document_type")

    // Validate required fields
    validateRequiredFields(Object.fromEntries(formData.entries()), [
      "document_type",
      "customer_name",
      "customer_email",
      "mechanic_name",
      "damage_description",
    ])

    let result
    // Choose the appropriate generator based on document type
    if (documentType === "letter_of_demand") {
      result = await generateLetterOfDemand(Object.fromEntries(formData.entries()))
    } else {
      result = await generateAustralianDocument(Object.fromEntries(formData.entries()))
    }

    // Get the raw document text from the generator result
    const rawDocumentText = result.letterText || result.documentText
    if (!rawDocumentText) {
      throw new ApiError("Document generation resulted in empty content.", 500)
    }

    // Generate HTML version of the document
    const customerName = formData.get("customer_name") || result.customerName || "Customer"
    const htmlDocument = generatePdfHtml(rawDocumentText, customerName, result.documentType)

    // Consistent filename (without extension)
    const documentKey = result.filename
    const r2ObjectKey = documentKey

    // Store the HTML document in S3/R2 storage
    await storeDocument(r2ObjectKey, htmlDocument, {
      contentType: "text/html",
      metadata: {
        documentType: result.documentType,
        customerName: customerName,
        filenameBase: documentKey,
      },
    })

    // Return success response with document info
    return NextResponse.json({
      success: true,
      filename: documentKey,
      documentType: result.documentType,
      customerName: customerName,
      generatedDate: new Date().toISOString(),
    })
  } catch (error) {
    const errorResponse = handleApiError(error)
    return NextResponse.json(errorResponse, { status: errorResponse.statusCode })
  }
}
