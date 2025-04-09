import { NextResponse } from "next/server"
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3"

// Check if we're running on Cloudflare Workers with R2 binding
const isCloudflareWorkersWithR2 = typeof global.DOCUMENTS_BUCKET !== "undefined"

// Initialize S3 client if not using R2 binding directly
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
 * API route to retrieve a photo
 * @param {Request} request - The incoming request
 * @param {Object} params - Route params including caseId and photoId
 */
export async function GET(request, { params }) {
  try {
    const { caseId, photoId } = params

    if (!caseId || !photoId) {
      return NextResponse.json(
        {
          error: "Missing case ID or photo ID",
        },
        { status: 400 },
      )
    }

    // Construct the file key pattern
    // We need to handle different file extensions
    let fileName
    let buffer
    let contentType

    if (isCloudflareWorkersWithR2) {
      // List objects with the prefix to find the file regardless of extension
      const prefix = `${caseId}/${photoId}`
      const objects = await global.DOCUMENTS_BUCKET.list({ prefix })

      if (!objects || !objects.objects || objects.objects.length === 0) {
        return NextResponse.json(
          {
            error: "Photo not found",
          },
          { status: 404 },
        )
      }

      // Get the first matching object
      fileName = objects.objects[0].key

      // Get the file
      const response = await global.DOCUMENTS_BUCKET.get(fileName)

      if (response === null) {
        return NextResponse.json(
          {
            error: "Photo not found",
          },
          { status: 404 },
        )
      }

      // Get the array buffer
      buffer = await response.arrayBuffer()
      contentType = response.httpMetadata?.contentType || "image/jpeg"
    } else {
      // For S3, we need to list objects to find the file with the right extension
      try {
        // For simplicity in this example, we'll try common extensions
        // In a production app, you'd use ListObjectsCommand to find the exact file
        const extensions = ["jpg", "jpeg", "png", "pdf", "doc", "docx"]
        let response = null

        for (const ext of extensions) {
          try {
            fileName = `${caseId}/${photoId}.${ext}`
            response = await s3Client.send(
              new GetObjectCommand({
                Bucket: bucketName,
                Key: fileName,
              }),
            )
            if (response) break
          } catch (err) {
            // Try next extension
            continue
          }
        }

        if (!response) {
          throw new Error("File not found with any common extension")
        }

        // Convert stream to buffer
        const chunks = []
        for await (const chunk of response.Body) {
          chunks.push(chunk)
        }
        buffer = Buffer.concat(chunks)
        contentType = response.ContentType || "image/jpeg"
      } catch (error) {
        return NextResponse.json(
          {
            error: "Photo not found",
          },
          { status: 404 },
        )
      }
    }

    // Return the photo with appropriate content type
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000",
      },
    })
  } catch (error) {
    console.error("Error retrieving photo:", error)
    return NextResponse.json(
      {
        error: "Error retrieving photo: " + error.message,
      },
      { status: 500 },
    )
  }
}
