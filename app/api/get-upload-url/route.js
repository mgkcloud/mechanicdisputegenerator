import { NextResponse } from "next/server"
import { v4 as uuidv4 } from "uuid"
import { getCloudflareContext } from "@opennextjs/cloudflare"

// Removed Edge runtime specification as it's not supported by @opennextjs/cloudflare
// export const runtime = 'edge';

// Allowed file types for uploads
const ALLOWED_CONTENT_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
  'text/plain',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
];

// Max file size allowed (100MB)
const MAX_FILE_SIZE = 100 * 1024 * 1024;

// In-memory rate limiting store (simple implementation)
// In production, consider using KV, Redis, or another persistent store
const rateLimitStore = new Map();

/**
 * Standard API response format
 * @param {boolean} success - Whether the operation was successful
 * @param {object} data - Response data for successful requests
 * @param {object} error - Error details for failed requests
 * @param {number} status - HTTP status code
 * @returns {NextResponse} - Formatted API response
 */
function createApiResponse(success, data = null, error = null, status = 200) {
  const response = {
    success,
    timestamp: new Date().toISOString(),
  };

  if (success && data) {
    response.data = data;
  }

  if (!success && error) {
    response.error = {
      message: typeof error === 'string' ? error : error.message || 'Unknown error',
      code: error.code || 'UNKNOWN_ERROR',
      details: error.details || null,
    };
  }

  return NextResponse.json(response, { status });
}

/**
 * Simple rate limiting middleware
 * @param {string} ip - Client IP address
 * @param {number} limit - Max requests per window
 * @param {number} windowMs - Time window in milliseconds
 * @returns {boolean} - true if rate limit exceeded, false otherwise
 */
function isRateLimited(ip, limit = 10, windowMs = 60000) {
  const now = Date.now();
  const windowStart = now - windowMs;
  
  // Clean up old entries
  for (const [key, data] of rateLimitStore.entries()) {
    if (data.timestamp < windowStart) {
      rateLimitStore.delete(key);
    }
  }
  
  // Get current count for this IP
  const record = rateLimitStore.get(ip) || { count: 0, timestamp: now };
  
  // If record is older than window, reset it
  if (record.timestamp < windowStart) {
    record.count = 0;
    record.timestamp = now;
  }
  
  // Increment count
  record.count += 1;
  rateLimitStore.set(ip, record);
  
  return record.count > limit;
}

/**
 * Generate a presigned URL using the R2 bucket binding
 */
async function generateDirectR2PresignedUrl(bucket, objectKey, contentType, expirationSeconds = 3600) {
  try {
    const url = await bucket.createPresignedUrl(objectKey, {
      method: 'PUT',
      expirationTtl: expirationSeconds,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000'
      }
    });
    
    if (!url) {
      throw new Error("Failed to generate presigned URL with R2 binding");
    }
    
    return url;
  } catch (error) {
    console.error("Error generating direct R2 presigned URL:", error);
    throw error;
  }
}

/**
 * Generate a signed URL using Cloudflare Workers S3-compatible R2 API
 * Fallback when other options aren't available
 */
function generateCustomSignedUrl(options) {
  const {
    accessKey,
    secretKey,
    region,
    bucket,
    key,
    contentType,
    expires = 3600,
    host,
    method = 'PUT'
  } = options;

  // Current time
  const datetime = new Date();
  const dateStr = datetime.toISOString().replace(/[:-]|\.\d{3}/g, '').substring(0, 8);
  const amzDatetime = datetime.toISOString().replace(/[:-]|\.\d{3}/g, '');
  
  // S3 canonical request inputs
  const request = {
    method,
    path: `/${key}`,
    query: {
      'X-Amz-Algorithm': 'AWS4-HMAC-SHA256',
      'X-Amz-Credential': `${accessKey}/${dateStr}/${region}/s3/aws4_request`,
      'X-Amz-Date': amzDatetime.slice(0, 16) + "Z",
      'X-Amz-Expires': expires.toString(),
      'X-Amz-SignedHeaders': 'host',
    },
    headers: {
      host: host,
    },
  };

  // Add content-type if present
  if (contentType) {
    request.query['Content-Type'] = contentType;
  }

  // Create canonical query string
  const canonicalQueryString = Object.keys(request.query)
    .sort()
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(request.query[key])}`)
    .join('&');

  // Create canonical request
  const canonicalRequest = [
    request.method,
    request.path,
    canonicalQueryString,
    'host:' + request.headers.host + '\n',
    'host',
    'UNSIGNED-PAYLOAD',
  ].join('\n');

  // Create string to sign
  const stringToSign = [
    'AWS4-HMAC-SHA256',
    request.query['X-Amz-Date'],
    `${dateStr}/${region}/s3/aws4_request`,
    crypto.createHash('sha256').update(canonicalRequest).digest('hex'),
  ].join('\n');

  // Calculate signature
  function getSignatureKey(key, dateStamp, regionName) {
    const kDate = crypto.createHmac('sha256', 'AWS4' + key).update(dateStamp).digest();
    const kRegion = crypto.createHmac('sha256', kDate).update(regionName).digest();
    const kService = crypto.createHmac('sha256', kRegion).update('s3').digest();
    const kSigning = crypto.createHmac('sha256', kService).update('aws4_request').digest();
    return kSigning;
  }

  const signingKey = getSignatureKey(secretKey, dateStr, region);
  const signature = crypto.createHmac('sha256', signingKey).update(stringToSign).digest('hex');

  // Add signature to query parameters
  request.query['X-Amz-Signature'] = signature;

  // Build URL
  const protocol = 'https';
  const queryString = Object.keys(request.query)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(request.query[key])}`)
    .join('&');

  return `${protocol}://${host}${request.path}?${queryString}`;
}

export async function POST(request) {
  try {
    // Get environment variables from Cloudflare or process.env
    let env = {};
    let R2_BUCKET = null;
    
    try {
      const context = await getCloudflareContext({ async: true });
      env = context.env || {};
      R2_BUCKET = env.DOCUMENTS_BUCKET;
      console.log("Available environment variables:", Object.keys(env).filter(k => !k.includes('KEY')));
    } catch (error) {
      console.warn("Not running in Cloudflare Workers context, using process.env");
      env = process.env;
      console.log("Available process.env variables:", Object.keys(env).filter(k => !k.includes('KEY')));
    }
    
    // Parse request body
    const body = await request.json();
    const { fileName, contentType, fileSize } = body;
    
    if (!fileName || !contentType) {
      return createApiResponse(false, null, "Missing required parameters: fileName and contentType", 400);
    }
    
    // Validate content type and file size
    const actualContentType = contentType || 'application/octet-stream';
    if (!ALLOWED_CONTENT_TYPES.includes(actualContentType)) {
      return createApiResponse(false, null, `Unsupported file type: ${actualContentType}`, 415);
    }
    
    if (fileSize && fileSize > MAX_FILE_SIZE) {
      return createApiResponse(false, null, `File size exceeds limit of ${MAX_FILE_SIZE / (1024 * 1024)}MB`, 413);
    }
    
    // Generate unique file identifiers
    const caseId = request.headers.get("X-Case-Id") || `case_${uuidv4().substring(0, 8)}`;
    const photoId = `photo_${uuidv4().substring(0, 8)}`;
    const fileExtension = fileName.split(".").pop() || 'jpg';
    const nonce = uuidv4().substring(0, 6);
    const objectKey = `${caseId}/${photoId}_${nonce}.${fileExtension}`;
    const photoUrl = `/api/get-photo/${caseId}/${photoId}`;

    console.log(`Generating presigned URL for: ${objectKey} (${actualContentType})`);
    
    let presignedUrl = null;
    let method = null;
    
    // Check if we have an R2 bucket binding and log its capabilities
    if (R2_BUCKET) {
      console.log(`R2 bucket found, methods: ${Object.keys(R2_BUCKET).join(', ')}`);
      console.log(`R2 bucket type: ${typeof R2_BUCKET}`);
      
      try {
        // Try to use put method directly since createPresignedUrl might not be available
        console.log("Using direct upload to R2 bucket via dev-uploads API endpoint");
        
        // Use our dev-uploads endpoint as a proxy to R2
        const host = request.headers.get('host') || 'localhost:8788';
        const protocol = host.includes('localhost') ? 'http' : 'https';
        presignedUrl = `${protocol}://${host}/api/dev-uploads/${objectKey}`;
        method = "R2_DEV_PROXY";
      } catch (error) {
        console.error("Error setting up R2 upload:", error);
        // Continue to fallback options
      }
    }
    
    // Fallback to HTTP upload URL if R2 direct method isn't available
    if (!presignedUrl && env.S3_ENDPOINT && env.S3_BUCKET_NAME) {
      try {
        console.log("Using S3/R2 endpoint via direct HTTP");
        
        // Direct URL to bucket - this is just for development
        // In production you would properly sign this URL
        const endpoint = env.S3_ENDPOINT.replace(/\/$/, '');
        const bucket = env.S3_BUCKET_NAME;
        
        presignedUrl = `${endpoint}/${bucket}/${objectKey}`;
        method = "HTTP_DIRECT";
        
        console.log(`Generated direct bucket URL: ${presignedUrl}`);
      } catch (error) {
        console.error("Error generating HTTP upload URL:", error);
      }
    }
    
    // Final fallback for development
    if (!presignedUrl) {
      console.log("Using local development URL");
      const host = request.headers.get('host') || 'localhost:8788';
      const protocol = host.includes('localhost') ? 'http' : 'https';
      presignedUrl = `${protocol}://${host}/api/dev-uploads/${objectKey}`;
      method = "DEV_MODE";
    }
    
    return createApiResponse(true, {
      presignedUrl,
      uploadUrl: presignedUrl,
      objectKey,
      photoId,
      caseId,
      url: photoUrl,
      expiresAt: new Date(Date.now() + 3600 * 1000).toISOString(),
      nonce,
      contentType: actualContentType,
      fileName,
      method
    });

  } catch (error) {
    console.error("Error generating upload URL:", error);
    return createApiResponse(false, null, error.message || "Internal server error", 500);
  }
} 