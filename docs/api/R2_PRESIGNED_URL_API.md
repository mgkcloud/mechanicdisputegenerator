# R2 Presigned URL API Documentation

## Overview

The R2 Presigned URL API allows clients to upload files directly to Cloudflare R2 storage without proxying through the server. This approach offers several advantages:

- **Improved performance**: Files go directly from the browser to R2 storage
- **Reduced server load**: The server only generates URLs, not handling file data
- **Better scalability**: Direct uploads scale better with concurrent users
- **Reduced bandwidth costs**: No redundant data transfer through the server

## API Endpoint

```
POST /api/get-upload-url
```

This endpoint generates a secure, time-limited URL for direct file uploads to R2 storage.

## Request Format

### Headers

| Header          | Description                                           | Required |
|-----------------|-------------------------------------------------------|----------|
| `Content-Type`  | Must be `application/json`                            | Yes      |
| `X-Case-Id`     | Optional case identifier for organizing files         | No       |

### Body Parameters

| Parameter     | Type     | Description                               | Required |
|---------------|----------|-------------------------------------------|----------|
| `fileName`    | String   | The original name of the file to upload   | Yes      |
| `contentType` | String   | The MIME type of the file                 | Yes      |
| `fileSize`    | Number   | The size of the file in bytes             | No       |
| `fileType`    | String   | Legacy parameter, use contentType instead | No       |

### Example Request

```json
{
  "fileName": "document.pdf",
  "contentType": "application/pdf",
  "fileSize": 1048576
}
```

## Response Format

### Success Response (200 OK)

```json
{
  "success": true,
  "timestamp": "2023-06-15T23:10:45Z",
  "data": {
    "presignedUrl": "https://mechanic-dispute-documents.r2.dev/case_12345/photo_abcdef_123456.pdf?token=...",
    "objectKey": "case_12345/photo_abcdef_123456.pdf",
    "photoId": "photo_abcdef",
    "caseId": "case_12345",
    "url": "/api/get-photo/case_12345/photo_abcdef",
    "expiresAt": "2023-06-16T00:10:45Z",
    "nonce": "123456",
    "contentType": "application/pdf",
    "fileName": "document.pdf"
  }
}
```

### Error Response

```json
{
  "success": false,
  "timestamp": "2023-06-15T23:10:45Z",
  "error": {
    "message": "Error message describing what went wrong",
    "code": "ERROR_CODE",
    "details": {
      // Additional error details (optional)
    }
  }
}
```

### Status Codes

| Status Code | Description                                            |
|-------------|--------------------------------------------------------|
| 200         | Success - URL generated successfully                   |
| 400         | Bad Request - Invalid or missing parameters            |
| 413         | Payload Too Large - File size exceeds maximum allowed  |
| 415         | Unsupported Media Type - File type not allowed         |
| 429         | Too Many Requests - Rate limit exceeded                |
| 500         | Internal Server Error - Server-side error              |

### Error Codes

| Error Code               | Description                                       |
|--------------------------|---------------------------------------------------|
| `MISSING_PARAMETERS`     | Required parameters are missing from the request  |
| `UNSUPPORTED_MEDIA_TYPE` | The specified content type is not supported       |
| `PAYLOAD_TOO_LARGE`      | The specified file size exceeds the allowed limit |
| `RATE_LIMIT_EXCEEDED`    | Too many requests in a short period               |
| `R2_BINDING_MISSING`     | R2 storage is not properly configured             |
| `R2_ERROR`               | Error occurred when interacting with R2 storage   |
| `INTERNAL_ERROR`         | Unexpected server error                           |

## Using the Presigned URL

1. Make a POST request to `/api/get-upload-url` with file information
2. Receive the presigned URL from the response
3. Use the presigned URL to upload the file directly to R2 storage:

```javascript
// Example upload using the presigned URL
const uploadResponse = await fetch(presignedUrl, {
  method: "PUT",
  headers: {
    "Content-Type": file.type
  },
  body: file
});
```

## Limitations and Security

- **URL Expiration**: Presigned URLs expire after 1 hour
- **Content Type**: Must match the one specified in the original request
- **Allowed Types**: Only certain file types are permitted (see below)
- **Size Limit**: Maximum file size is 100MB

### Allowed File Types

- Images: `image/jpeg`, `image/png`, `image/gif`, `image/webp`
- Documents: `application/pdf`, `text/plain`
- Office files: `application/msword`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`, `application/vnd.ms-excel`, `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`

## Client Implementation Example

```javascript
async function uploadFile(file) {
  try {
    // Step 1: Get a presigned URL
    const urlResponse = await fetch("/api/get-upload-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fileName: file.name,
        contentType: file.type,
        fileSize: file.size
      })
    });
    
    if (!urlResponse.ok) {
      throw new Error(`Failed to get presigned URL: ${urlResponse.status}`);
    }
    
    const urlData = await urlResponse.json();
    if (!urlData.success) {
      throw new Error(urlData.error.message);
    }
    
    // Step 2: Upload directly to R2 using presigned URL
    const uploadResponse = await fetch(urlData.data.presignedUrl, {
      method: "PUT",
      headers: { "Content-Type": file.type },
      body: file
    });
    
    if (!uploadResponse.ok) {
      throw new Error(`Upload failed: ${uploadResponse.status}`);
    }
    
    return {
      success: true,
      fileId: urlData.data.photoId,
      fileUrl: urlData.data.url
    };
  } catch (error) {
    console.error("Upload failed:", error);
    return { success: false, error: error.message };
  }
}
```

## Testing

You can test the API using the following curl command:

```bash
curl -X POST https://your-domain.com/api/get-upload-url \
  -H "Content-Type: application/json" \
  -d '{"fileName":"test.jpg","contentType":"image/jpeg","fileSize":12345}'
``` 