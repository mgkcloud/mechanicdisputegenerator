import { NextResponse } from "next/server"
import { v4 as uuidv4 } from "uuid"
import { handleApiError, ApiError } from "@/lib/error-utils"

// DEPRECATED: This endpoint uses Node.js file system operations that are not supported in Cloudflare Workers.
// Please use the new R2 presigned URL approach with /api/get-upload-url instead.
// This endpoint is kept for backward compatibility but will be removed in a future release.

/**
 * API route to handle photo uploads
 * @param {Request} request - The incoming request
 * @deprecated Use the new R2 presigned URL approach with /api/get-upload-url instead
 */
export async function POST(request) {
  try {
    // This endpoint is deprecated
    throw new ApiError("This endpoint is deprecated. Please use the new R2 presigned URL approach with /api/get-upload-url instead.", 400)
  } catch (error) {
    console.error("Request processing error:", error)
    const errorResponse = handleApiError(error)
    return NextResponse.json(errorResponse, { status: errorResponse.statusCode })
  }
}
