import { NextResponse } from "next/server"
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"
import { v4 as uuidv4 } from "uuid"
import { handleApiError, ApiError } from "@/lib/error-utils"

// Check if we're running on Cloudflare Workers with R2 binding
// This will be the case in production when deployed to Cloudflare
const isCloudflareWorkersWithR2 = typeof global.DOCUMENTS_BUCKET !== "undefined"

// Initialize S3 client if not using R2 binding directly
// This is used when running on Node.js or other environments
const s3Client = !isCloudflareWorkersWithR2
  ? new S3Client({
      region: process.env.S3_REGION || "auto",
      endpoint: process.env.S3_ENDPOINT,
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY || "",
        secretAccessKey: process.env.S3_SECRET_KEY || "",
      },
    })
  : null

const bucketName = process.env.S3_BUCKET_NAME || "mechanic-dispute-documents"

/**
 * API route to handle photo uploads
 * @param {Request} request - The incoming request
 */
export async function POST(request) {
  try {
    // Parse form data
    const formData = await request.formData()
    const file = formData.get("photo")
    const caseId = formData.get("case_id") || `case_${uuidv4().substring(0, 8)}`

    if (!file) {
      throw new ApiError("No photo uploaded", 400)
    }

    // Validate file size (10MB limit)
    const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
    if (file.size > MAX_FILE_SIZE) {
      throw new ApiError("File size exceeds the 10MB limit", 400)
    }

    // Convert form data file to buffer
    const buffer = Buffer.from(await file.arrayBuffer())

    // Create a unique ID for the photo
    const photoId = `photo_${uuidv4().substring(0, 8)}`
    const fileName = `${caseId}/${photoId}.${file.name.split(".").pop()}`

    // Store photo in S3/R2
    if (isCloudflareWorkersWithR2) {
      // Use R2 binding directly when deployed to Cloudflare Workers
      await global.DOCUMENTS_BUCKET.put(fileName, buffer, {
        httpMetadata: {
          contentType: file.type,
        },
        customMetadata: {
          caseId,
          photoId,
          originalName: file.name,
          uploadDate: new Date().toISOString(),
        },
      })
    } else {
      // Use AWS SDK for S3 when not on Cloudflare Workers
      await s3Client.send(
        new PutObjectCommand({
          Bucket: bucketName,
          Key: fileName,
          Body: buffer,
          ContentType: file.type,
          Metadata: {
            caseId,
            photoId,
            originalName: file.name,
            uploadDate: new Date().toISOString(),
          },
        }),
      )
    }

    // Generate URL for accessing the photo
    const photoUrl = `/api/get-photo/${caseId}/${photoId}`

    return NextResponse.json({
      success: true,
      photoId,
      caseId,
      url: photoUrl,
    })
  } catch (error) {
    const errorResponse = handleApiError(error)
    return NextResponse.json(errorResponse, { status: errorResponse.statusCode })
  }
}
