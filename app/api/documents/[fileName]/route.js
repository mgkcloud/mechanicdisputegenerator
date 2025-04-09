import { NextResponse } from "next/server"
import { getDocument } from "@/lib/document-storage"
import { handleApiError, ApiError } from "@/lib/error-utils"

/**
 * API route to retrieve a document by filename
 * @param {Request} request - The incoming request
 * @param {Object} params - Route params including fileName
 */
export async function GET(request, { params }) {
  try {
    const { fileName } = params
    const { searchParams } = new URL(request.url)
    const download = searchParams.get("download") === "true"

    if (!fileName) {
      throw new ApiError("Invalid filename parameter", 400)
    }

    // Append .html to get the full R2/S3 key
    const r2ObjectKey = fileName + ".html"

    // Get document from storage
    const document = await getDocument(r2ObjectKey)

    if (!document) {
      throw new ApiError(`Document not found: ${fileName}`, 404)
    }

    // Set headers for the response
    const headers = {
      "Content-Type": document.contentType || "text/html",
      "Cache-Control": "public, max-age=31536000",
    }

    // Add content disposition header for downloads
    if (download) {
      headers["Content-Disposition"] = `attachment; filename="${fileName}.html"`
    }

    // Return the document content with appropriate headers
    return new NextResponse(document.content, { headers })
  } catch (error) {
    // For document retrieval, we want to return HTML error page for browser requests
    if (error instanceof ApiError && error.statusCode === 404) {
      return new NextResponse(
        `<!DOCTYPE html>
        <html>
          <head>
            <title>Document Not Found</title>
            <style>
              body { font-family: system-ui, sans-serif; line-height: 1.5; padding: 2rem; max-width: 40rem; margin: 0 auto; }
              h1 { color: #e11d48; }
            </style>
          </head>
          <body>
            <h1>Document Not Found</h1>
            <p>The requested document could not be found. It may have been deleted or the link may be incorrect.</p>
            <p><a href="/">Return to Home</a></p>
          </body>
        </html>`,
        {
          status: 404,
          headers: { "Content-Type": "text/html" },
        },
      )
    }

    const errorResponse = handleApiError(error)
    return NextResponse.json(errorResponse, { status: errorResponse.statusCode })
  }
}
