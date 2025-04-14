import { NextResponse } from "next/server"
import { getDocument } from "@/lib/document-storage"
import { handleApiError, ApiError } from "@/lib/error-utils"

/**
 * Route handler for document downloads
 * @param {Request} request - The incoming request
 * @param {Object} context - Context containing params
 * @param { { params: { filename: string } } } context - Context containing params
 * @param {string} context.params.filename - Document filename
 */
export async function GET(request, { params }) {
  try {
    const { filename } = params
    
    if (!filename) {
      throw new ApiError("Filename is required", 400)
    }
    
    // Retrieve the document from storage
    const document = await getDocument(filename)
    
    if (!document) {
      throw new ApiError("Document not found", 404)
    }
    
    // Return the document with headers that will trigger a download
    return new NextResponse(document, {
      headers: {
        "Content-Type": "text/html",
        "Content-Disposition": `attachment; filename="${filename}.html"`,
      },
    })
  } catch (error) {
    const errorResponse = handleApiError(error)
    return NextResponse.json(errorResponse, { status: errorResponse.statusCode })
  }
} 