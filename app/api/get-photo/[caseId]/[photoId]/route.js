import { NextResponse } from "next/server"
import { getCloudflareContext } from "@opennextjs/cloudflare"

// Removed AWS SDK imports
// import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3"

// Removed Edge runtime specification as it's not supported by @opennextjs/cloudflare
// export const runtime = 'edge';

// Removed top-level S3 client initialization
// const s3Client = new S3Client({...})
// const bucketName = process.env.S3_BUCKET_NAME || "mechanic-dispute-documents"

/**
 * Helper function to retrieve file from R2 using bucket binding
 */
async function getFileFromR2(caseId, photoId, R2_BUCKET) {
  console.log(`Using R2 binding to get file with prefix ${caseId}/${photoId}`);
  
  // List objects with the prefix to find the file regardless of extension
  const prefix = `${caseId}/${photoId}`;
  const objects = await R2_BUCKET.list({ prefix });

  if (!objects || !objects.objects || objects.objects.length === 0) {
    return null;
  }

  // Get the first matching object
  const fileName = objects.objects[0].key;
  console.log(`Found file: ${fileName}`);

  // Get the file
  const response = await R2_BUCKET.get(fileName);

  if (response === null) {
    return null;
  }

  // Get the array buffer - this works in Cloudflare Workers
  const fileData = await response.arrayBuffer();
  const contentType = response.httpMetadata?.contentType || "image/jpeg";
  
  return { fileData, contentType, fileName };
}

/**
 * Helper function to retrieve file via HTTP without AWS SDK
 */
async function getFileFromHTTP(caseId, photoId, env) {
  console.log("Using HTTP to get file from S3/R2");
  
  if (!env.S3_ENDPOINT || !env.S3_BUCKET_NAME) {
    throw new Error("Missing required S3 environment variables");
  }
  
  const endpoint = env.S3_ENDPOINT.replace(/\/$/, '');
  const bucket = env.S3_BUCKET_NAME;
  
  // For S3, we need to try common extensions
  const extensions = ["jpg", "jpeg", "png", "pdf", "doc", "docx"];
  
  for (const ext of extensions) {
    try {
      const fileName = `${caseId}/${photoId}.${ext}`;
      console.log(`Trying to get file: ${fileName}`);
      
      // Direct HTTP request to the object
      const objectUrl = `${endpoint}/${bucket}/${fileName}`;
      console.log(`Trying URL: ${objectUrl}`);
      
      const response = await fetch(objectUrl);
      
      if (response.ok) {
        const fileData = await response.arrayBuffer();
        const contentType = response.headers.get("Content-Type") || "image/jpeg";
        return { fileData, contentType, fileName };
      }
    } catch (err) {
      console.error(`Error trying extension ${ext}:`, err);
      // Try next extension
      continue;
    }
  }
  
  // Also try the full photoId which might include a nonce
  try {
    const prefix = `${caseId}/${photoId}`;
    console.log(`Trying prefix match: ${prefix}`);
    
    // In a real implementation, you might want to use a list operation
    // but for simplicity, we'll check a few common patterns
    const patterns = [
      `${prefix}.jpg`,
      `${prefix}.jpeg`,
      `${prefix}.png`,
      `${prefix}_*.jpg`,
      `${prefix}_*.jpeg`,
      `${prefix}_*.png`
    ];
    
    for (const pattern of patterns) {
      try {
        const objectUrl = `${endpoint}/${bucket}/${pattern}`;
        console.log(`Trying pattern URL: ${objectUrl}`);
        
        const response = await fetch(objectUrl);
        
        if (response.ok) {
          const fileData = await response.arrayBuffer();
          const contentType = response.headers.get("Content-Type") || "image/jpeg";
          return { fileData, contentType, pattern };
        }
      } catch (err) {
        // Try next pattern
        continue;
      }
    }
  } catch (err) {
    console.error("Error trying prefix patterns:", err);
  }
  
  return null;
}

/**
 * API route to retrieve a photo
 */
export async function GET(request, context) {
  try {
    // Await params before accessing its properties (Next.js 15 requirement)
    const params = await context.params;
    const { caseId, photoId } = params;
    
    if (!caseId || !photoId) {
      return NextResponse.json(
        {
          error: "Missing case ID or photo ID",
        },
        { status: 400 },
      )
    }
    
    // Get environment context
    let env = {};
    let R2_BUCKET = null;
    
    try {
      const context = await getCloudflareContext({ async: true });
      env = context.env || {};
      R2_BUCKET = env.DOCUMENTS_BUCKET;
      
      console.log("Available environment variables:", Object.keys(env).filter(k => !k.includes('KEY')));
    } catch (err) {
      console.log("Not running in Cloudflare Workers context, using process.env:", err.message);
      env = process.env;
    }

    let result = null;
    
    // Try R2 bucket binding first if available
    if (R2_BUCKET) {
      console.log("R2 bucket binding found, trying that first");
      result = await getFileFromR2(caseId, photoId, R2_BUCKET);
    }
    
    // Fall back to HTTP if R2 didn't work or isn't available
    if (!result && env.S3_ENDPOINT) {
      console.log("Falling back to HTTP retrieval");
      result = await getFileFromHTTP(caseId, photoId, env);
    }
    
    if (!result) {
      console.log("Photo not found with any method");
      return NextResponse.json(
        {
          error: "Photo not found",
        },
        { status: 404 },
      );
    }
    
    // Return the photo with appropriate content type
    return new NextResponse(result.fileData, {
      headers: {
        "Content-Type": result.contentType,
        "Cache-Control": "public, max-age=31536000",
      },
    });
  } catch (error) {
    console.error("Error retrieving photo:", error);
    return NextResponse.json(
      {
        error: "Error retrieving photo: " + error.message,
      },
      { status: 500 },
    );
  }
}

/**
 * Edge runtime handler - this is the function that gets executed in the Edge Runtime
 * Following OpenNext's recommendation for edge runtime functions
 */
// Removed the getPhoto function as its logic is now in GET
// async function getPhoto(request, { caseId, photoId }) { ... }
