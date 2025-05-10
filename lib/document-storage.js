/**
 * Document storage module for S3/R2 integration
 * Handles storing and retrieving documents without AWS SDK in Cloudflare Workers
 */
import { getCloudflareContext } from "@opennextjs/cloudflare"
import crypto from 'crypto'

// Removed AWS SDK imports to avoid file system access issues
// import { S3Client, PutObjectCommand, GetObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3"

/**
 * Generate a presigned S3/R2 URL without using AWS SDK 
 * This avoids all file system dependencies
 */
function generatePresignedUrl(options) {
  const {
    accessKey,
    secretKey,
    region,
    bucket,
    key,
    contentType,
    expires = 3600, // Default 1 hour
    host,
    method = 'PUT'
  } = options;

  // Current time
  const datetime = new Date();
  const dateStr = datetime.toISOString().replace(/[:-]|\.\d{3}/g, '').substring(0, 8);
  const amzDatetime = datetime.toISOString().replace(/[:-]|\.\d{3}/g, '');
  
  // Calculate expiration timestamp
  const expiresUTC = Math.floor(datetime.getTime() / 1000) + expires;
  
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

// Get environment context asynchronously 
export async function getEnv() {
  try {
    const context = await getCloudflareContext({ async: true });
    return context.env || {};
  } catch (err) {
    console.warn("Not running in Cloudflare Workers context, using process.env:", err.message);
    return process.env;
  }
}

/**
 * Store a document in S3/R2 storage
 * @param {string} documentId - Unique ID for the document
 * @param {string} content - Document content to store
 * @param {Object} options - Additional options
 * @returns {Promise<string>} - Public URL for accessing the document
 */
export async function storeDocument(documentId, content, options = {}) {
  const { contentType = "text/html", metadata = {}, format = "html" } = options
  
  // Format might already contain a file extension (like 'input.json')
  // We need to avoid creating double extensions like .input.json.json
  const fileName = format.includes('.') 
    ? `${documentId}${format.startsWith('.') ? format : '.'+format}` 
    : `${documentId}.${format}`;
  
  // Special handling for JSON files - they often cause issues
  const isJsonFile = format.includes('json') || contentType.includes('json');
  
  // Log storage attempt with clear details
  console.log(`\n----- STORING DOCUMENT -----`);
  console.log(`ID: ${documentId}`);
  console.log(`Filename: ${fileName}`);
  console.log(`Format: ${format}`);
  console.log(`Content Type: ${contentType}`);
  console.log(`Is JSON file: ${isJsonFile ? 'YES' : 'NO'}`);
  console.log(`Content Length: ${typeof content === 'string' ? content.length : 'non-string content'}`);
  console.log(`Metadata: ${JSON.stringify(metadata)}`);
  
  // Convert content to appropriate format based on type
  let formattedContent = content;
  
  if (isJsonFile && typeof content === 'string') {
    try {
      console.log(`\n⚠️ JSON FILE STORAGE - CONVERTING TO BLOB ⚠️`);
      // For JSON files, create a proper Blob with application/json mime type
      formattedContent = new Blob([content], { type: 'application/json' });
      console.log(`Converted JSON string to Blob (${content.length} bytes)`);
    } catch (jsonError) {
      console.error(`Error converting JSON to Blob: ${jsonError.message}`);
      // Continue with original content as fallback
      formattedContent = content;
    }
  }
  
  console.log(`---------------------------\n`);
  
  try {
    const env = await getEnv();
    const R2_BUCKET = env.DOCUMENTS_BUCKET;
    
    if (R2_BUCKET) {
      // Use R2 binding directly when deployed to Cloudflare Workers
      await R2_BUCKET.put(fileName, formattedContent, {
        httpMetadata: {
          contentType: isJsonFile ? "application/json" : contentType, // Force application/json for JSON files
          cacheControl: "public, max-age=31536000",
        },
        customMetadata: {
          ...metadata,
          createdAt: new Date().toISOString(),
        },
      })
      console.log(`📁 Storage successful using R2: ${fileName}`);
    } else {
      // Use fetch with presigned URL when AWS SDK not available
      if (!env.S3_ACCESS_KEY || !env.S3_SECRET_KEY || !env.S3_BUCKET_NAME) {
        throw new Error("Missing required S3 environment variables");
      }
      
      const region = env.S3_REGION || 'us-east-1';
      const bucketName = env.S3_BUCKET_NAME;
      const host = env.S3_ENDPOINT ? env.S3_ENDPOINT.replace(/^https?:\/\//, '') : `s3.${region}.amazonaws.com`;
      
      // Generate presigned URL
      const presignedUrl = generatePresignedUrl({
        accessKey: env.S3_ACCESS_KEY,
        secretKey: env.S3_SECRET_KEY,
        region,
        bucket: bucketName,
        key: `${bucketName}/${fileName}`,
        contentType,
        host,
        method: 'PUT'
      });
      
      // Upload using fetch
      const response = await fetch(presignedUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': isJsonFile ? 'application/json' : contentType,
          'Cache-Control': 'public, max-age=31536000'
        },
        body: formattedContent
      });
      
      if (!response.ok) {
        throw new Error(`Failed to upload document: ${response.status} ${response.statusText}`);
      }
      
      console.log(`📁 Storage successful using S3: ${fileName}`);
    }

    // Generate a URL for accessing the document
    return `/api/documents/${documentId}`
  } catch (error) {
    console.error("Error storing document:", error)
    throw new Error(`Failed to store document: ${error.message}`)
  }
}

/**
 * Retrieve a document from S3/R2 storage
 * @param {string} documentKey - Document key/ID to retrieve
 * @returns {Promise<string|null>} - Document content or null if not found
 */
export async function getDocument(documentKey) {
  try {
    // Determine the filename: Check for specific known extensions first
    let fileName = documentKey;
    if (!fileName.endsWith('.input.json') && !fileName.endsWith('.html') && !fileName.endsWith('.json')) {
      // If no known extension, assume HTML by default
      fileName = `${fileName}.html`; 
    }
    
    // Check if this is a JSON file for special handling
    const isJsonFile = fileName.endsWith('.json');
    
    // Log retrieval attempt
    console.log(`\n----- RETRIEVING DOCUMENT -----`);
    console.log(`Original Key: ${documentKey}`);
    console.log(`Resolved Filename: ${fileName}`);
    console.log(`Is JSON file: ${isJsonFile ? 'YES' : 'NO'}`);
    console.log(`--------------------------------\n`);
    
    const env = await getEnv();
    const R2_BUCKET = env.DOCUMENTS_BUCKET;

    if (R2_BUCKET) {
      // Use R2 binding directly when deployed to Cloudflare Workers
      console.log(`Using R2 storage: ${env.DOCUMENTS_BUCKET?.name || 'unnamed bucket'}`);
      
      // Special handling for listing objects (debug only for JSON issues)
      if (isJsonFile && !fileName.includes('input.json')) {
        console.log(`⚠️ Attempting to debug JSON file issue - checking if input JSON exists...`);
        try {
          // List objects to see if the input.json file exists
          // This is just for debugging the JSON file issue
          const list = await R2_BUCKET.list({ prefix: documentKey.replace('.json', '') });
          console.log(`Found ${list.objects?.length || 0} related files:`);
          list.objects?.forEach(obj => console.log(`- ${obj.key} (${obj.size} bytes)`));
        } catch (listError) {
          console.error(`Error listing objects: ${listError.message}`);
          // Continue with normal file retrieval
        }
      }
      
      const response = await R2_BUCKET.get(fileName);

      if (response === null) {
        console.log(`Document not found: ${fileName}`);
        return null; // File not found
      }

      // Handle JSON files with special care
      if (isJsonFile) {
        try {
          // For JSON files, get as text to ensure proper encoding
          const content = await response.text();
          console.log(`JSON document retrieved successfully: ${fileName} (${content.length} bytes)`);
          
          // Validate JSON is properly formatted
          try {
            JSON.parse(content); // Just validate, don't use the result
            console.log(`Retrieved JSON is valid.`);
          } catch (jsonError) {
            console.warn(`Retrieved JSON may be invalid: ${jsonError.message}`);
          }
          
          return content;
        } catch (textError) {
          console.error(`Failed to get JSON as text: ${textError.message}`);
          // Fall back to arrayBuffer method
          const buffer = await response.arrayBuffer();
          return new TextDecoder().decode(buffer);
        }
      } else {
        // For non-JSON files, continue with normal handling
        const content = await response.text();
        console.log(`Document retrieved successfully: ${fileName} (${content.length} bytes)`);
        return content;
      }
    } else {
      // Use fetch for S3 when not on Cloudflare Workers with R2
      if (!env.S3_ACCESS_KEY || !env.S3_SECRET_KEY || !env.S3_BUCKET_NAME) {
        throw new Error("Missing required S3 environment variables");
      }
      
      const region = env.S3_REGION || 'us-east-1';
      const bucketName = env.S3_BUCKET_NAME;
      const endpoint = env.S3_ENDPOINT || `https://s3.${region}.amazonaws.com`;
      
      // For public S3 buckets, we can directly access
      // For private buckets, we would need to generate a signed URL
      const objectUrl = `${endpoint}/${bucketName}/${fileName}`;
      
      const response = await fetch(objectUrl);
      
      if (!response.ok) {
        if (response.status === 404) {
          console.log(`Document not found: ${fileName}`);
          return null; // File not found
        }
        throw new Error(`Failed to get document: ${response.status} ${response.statusText}`);
      }
      
      const content = await response.text();
      console.log(`Document retrieved successfully: ${fileName} (${content.length} bytes)`);
      return content;
    }
  } catch (error) {
    if (error.name === "NoSuchKey" || error.name === "NotFound" || error.message.includes("404")) {
      return null; // File not found
    }
    console.error("Error retrieving document:", error);
    throw new Error(`Failed to retrieve document: ${error.message}`);
  }
}

/**
 * Get metadata about a document without retrieving content
 * @param {string} fileName - File name to check
 * @returns {Promise<Object|null>} - Metadata object or null if not found
 */
export async function getDocumentMetadata(fileName) {
  try {
    const env = await getEnv();
    const R2_BUCKET = env.DOCUMENTS_BUCKET;
    
    if (R2_BUCKET) {
      // Use R2 binding directly when deployed to Cloudflare Workers
      const response = await R2_BUCKET.head(fileName)

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
      // Use fetch for S3 when not on Cloudflare Workers with R2
      if (!env.S3_ACCESS_KEY || !env.S3_SECRET_KEY || !env.S3_BUCKET_NAME) {
        throw new Error("Missing required S3 environment variables");
      }
      
      const region = env.S3_REGION || 'us-east-1';
      const bucketName = env.S3_BUCKET_NAME;
      const endpoint = env.S3_ENDPOINT || `https://s3.${region}.amazonaws.com`;
      
      // HEAD request to check object metadata
      const objectUrl = `${endpoint}/${bucketName}/${fileName}`;
      
      const response = await fetch(objectUrl, { method: 'HEAD' });
      
      if (!response.ok) {
        if (response.status === 404) {
          return null; // File not found
        }
        throw new Error(`Failed to get document metadata: ${response.status} ${response.statusText}`);
      }
      
      return {
        contentType: response.headers.get('Content-Type'),
        contentLength: parseInt(response.headers.get('Content-Length') || '0'),
        lastModified: new Date(response.headers.get('Last-Modified')),
        metadata: {}, // Note: Cannot get custom metadata from a simple HEAD request without AWS SDK
      };
    }
  } catch (error) {
    if (error.name === "NotFound" || error.name === "NoSuchKey" || error.message.includes("404")) {
      return null // File not found
    }
    console.error("Error retrieving document metadata:", error)
    throw new Error(`Failed to retrieve document metadata: ${error.message}`)
  }
}
