/**
 * Document storage module for S3/R2 integration
 * Handles storing and retrieving documents
 */
import { S3Client, PutObjectCommand, GetObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3"

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
 * Store a document in S3/R2 storage
 * @param {string} documentId - Unique ID for the document
 * @param {string} content - Document content to store
 * @param {Object} options - Additional options
 * @returns {Promise<string>} - Public URL for accessing the document
 */
export async function storeDocument(documentId, content, options = {}) {
  const { contentType = "text/html", metadata = {}, format = "html" } = options

  const fileName = `${documentId}.${format}`

  try {
    if (isCloudflareWorkersWithR2) {
      // Use R2 binding directly when deployed to Cloudflare Workers
      await global.DOCUMENTS_BUCKET.put(fileName, content, {
        httpMetadata: {
          contentType,
          cacheControl: "public, max-age=31536000",
        },
        customMetadata: {
          ...metadata,
          createdAt: new Date().toISOString(),
        },
      })
    } else {
      // Use AWS SDK for S3 when not on Cloudflare Workers
      await s3Client.send(
        new PutObjectCommand({
          Bucket: bucketName,
          Key: fileName,
          Body: content,
          ContentType: contentType,
          CacheControl: "public, max-age=31536000",
          Metadata: {
            ...metadata,
            createdAt: new Date().toISOString(),
          },
        }),
      )
    }

    // Generate a URL for accessing the document
    // For Next.js, we'll use API routes to serve the content
    return `/api/documents/${documentId}`
  } catch (error) {
    console.error("Error storing document:", error)
    throw new Error(`Failed to store document: ${error.message}`)
  }
}

/**
 * Retrieve a document from S3/R2 storage
 * @param {string} fileName - File name to retrieve
 * @returns {Promise<Object|null>} - Document object or null if not found
 */
export async function getDocument(fileName) {
  try {
    if (isCloudflareWorkersWithR2) {
      // Use R2 binding directly when deployed to Cloudflare Workers
      const response = await global.DOCUMENTS_BUCKET.get(fileName)

      if (response === null) {
        return null // File not found
      }

      const content = await response.text()

      return {
        content,
        contentType: response.httpMetadata?.contentType || "text/plain",
        metadata: response.customMetadata || {},
      }
    } else {
      // Use AWS SDK for S3 when not on Cloudflare Workers
      const response = await s3Client.send(
        new GetObjectCommand({
          Bucket: bucketName,
          Key: fileName,
        }),
      )

      // Convert stream to text content
      const content = await streamToString(response.Body)

      return {
        content,
        contentType: response.ContentType || "text/plain",
        metadata: response.Metadata || {},
      }
    }
  } catch (error) {
    if (error.name === "NoSuchKey") {
      return null // File not found
    }
    console.error("Error retrieving document:", error)
    throw new Error(`Failed to retrieve document: ${error.message}`)
  }
}

/**
 * Get metadata about a document without retrieving content
 * @param {string} fileName - File name to check
 * @returns {Promise<Object|null>} - Metadata object or null if not found
 */
export async function getDocumentMetadata(fileName) {
  try {
    if (isCloudflareWorkersWithR2) {
      // Use R2 binding directly when deployed to Cloudflare Workers
      const response = await global.DOCUMENTS_BUCKET.head(fileName)

      if (response === null) {
        return null // File not found
      }

      return {
        contentType: response.httpMetadata?.contentType,
        metadata: response.customMetadata,
        lastModified: response.uploaded,
        contentLength: response.size,
      }
    } else {
      // Use AWS SDK for S3 when not on Cloudflare Workers
      const response = await s3Client.send(
        new HeadObjectCommand({
          Bucket: bucketName,
          Key: fileName,
        }),
      )

      return {
        contentType: response.ContentType,
        metadata: response.Metadata,
        lastModified: response.LastModified,
        contentLength: response.ContentLength,
      }
    }
  } catch (error) {
    if (error.name === "NotFound" || error.name === "NoSuchKey") {
      return null // File not found
    }
    console.error("Error retrieving document metadata:", error)
    throw new Error(`Failed to retrieve document metadata: ${error.message}`)
  }
}

/**
 * Helper function to convert streams to strings
 * @param {ReadableStream} stream - Stream to convert
 * @returns {Promise<string>} - String content
 */
async function streamToString(stream) {
  return new Promise((resolve, reject) => {
    const chunks = []
    stream.on("data", (chunk) => chunks.push(chunk))
    stream.on("error", reject)
    stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf-8")))
  })
}
