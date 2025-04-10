# Direct Upload to R2 Implementation

## Overview

This document outlines the implementation of direct file uploads to Cloudflare R2 from the client browser, which resolves the Cloudflare Workers limitation error: `Upload failed: [unenv] fs.readFile is not implemented yet!`.

## Problem

The original implementation attempted to use Node.js file system operations (`fs.readFile`) within Cloudflare Workers, which is not supported as Workers run in a V8 isolate environment without access to Node.js-specific APIs like the file system module.

## Solution Architecture

Our solution follows a direct streaming upload pattern:

1. **Client-Side**: The browser requests an upload URL from the server
2. **Server-Side**: Server generates the upload URL with object metadata
3. **Client-Side**: Browser uploads the file directly to R2 storage using streaming
4. **Server-Side**: File is stored in R2 and a URL is returned for accessing it

### Components

1. **API Endpoints**:
   - `/api/get-upload-url`: Generates upload endpoints for R2
   - `/api/direct-upload/[...key]`: Streams uploads directly to R2 without loading entire files into memory

2. **Client Utility**:
   - `uploadFileToR2()`: Updated to use streaming upload

3. **Legacy Support**:
   - The original `/api/upload-photo` endpoint is maintained with deprecation notices

## Implementation Details

### 1. Upload URL Generation

The `/api/get-upload-url` endpoint:
- Generates a unique case and photo ID
- Creates an object key for R2 storage
- Returns a direct upload endpoint URL

### 2. Streaming Upload to R2

The `/api/direct-upload/[...key]` endpoint:
- Uses native R2 streaming support with `request.body`
- Avoids loading the entire file into memory
- Directly streams from request to R2 using `await bucket.put(key, request.body, options)`
- Returns a URL for accessing the uploaded file

### 3. Client-Side Implementation

The client utility function now:
1. Requests an upload URL from `/api/get-upload-url`
2. Uploads the file directly to the provided URL using streaming
3. Returns metadata about the uploaded file

## Benefits

1. **Compatibility**: Works in Cloudflare Workers environment without relying on Node.js-specific APIs
2. **Performance**: More efficient by streaming data directly without loading entire files into memory
3. **Scalability**: Can handle larger files thanks to streaming approach
4. **Resource Efficiency**: Minimizes memory usage by avoiding unnecessary buffering

## Usage

```javascript
import { uploadFileToR2 } from "@/lib/file-utils";

// Example usage in a React component
const handleFileSelect = async (e) => {
  const files = Array.from(e.target.files);
  
  try {
    const uploadPromises = files.map((file) => uploadFileToR2(file));
    const uploadedFiles = await Promise.all(uploadPromises);
    // Process uploaded files...
  } catch (error) {
    console.error("Error uploading files:", error);
  }
};
```

## Implementation Notes

1. **R2 Bucket Binding**: The R2 bucket must be properly bound in the wrangler.toml configuration
2. **Streaming Support**: Takes advantage of Cloudflare's native streaming support for efficient uploads
3. **Error Handling**: All endpoints include proper error handling and meaningful error messages

## Migration

The legacy `/api/upload-photo` endpoint is maintained for backward compatibility but will return an error when used in Cloudflare Workers. All new code should use the direct streaming upload approach. 