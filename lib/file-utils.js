/**
 * Upload file directly to R2 storage with progress tracking and retry
 * @param {File} file - File to upload
 * @param {Object} options - Upload options
 * @param {Function} options.onProgress - Progress callback (receives percentage)
 * @param {number} options.maxRetries - Maximum number of retry attempts (default: 3)
 * @param {number} options.maxFileSize - Maximum file size in bytes (default: 100MB)
 * @param {Array<string>} options.allowedTypes - Array of allowed MIME types (default: null, all types)
 * @returns {Promise<Object>} - Uploaded file metadata
 */
export async function uploadFileToR2(file, options = {}) {
  const {
    onProgress = () => {},
    maxRetries = 3,
    maxFileSize = 100 * 1024 * 1024, // 100MB default
    allowedTypes = null // null means allow all types
  } = options;
  
  let retries = 0;
  let lastError = null;
  
  try {
    // Validate file
    if (!(file instanceof File) && !(file instanceof Blob)) {
      throw new Error("Invalid file object");
    }

    // Validate file size
    if (file.size > maxFileSize) {
      throw new Error(`File size exceeds maximum allowed size of ${maxFileSize / (1024 * 1024)}MB`);
    }
    
    // Validate file type if restrictions are provided
    if (allowedTypes && !allowedTypes.includes(file.type)) {
      throw new Error(`File type ${file.type} not allowed. Allowed types: ${allowedTypes.join(', ')}`);
    }

    console.log(`Starting upload for file: ${file.name}, size: ${file.size}, type: ${file.type}`);
    
    // Initial progress update
    onProgress(0);

    // Retry loop
    while (retries <= maxRetries) {
      try {
        // Step 1: Get a presigned URL from our API
        const response = await fetch("/api/get-upload-url", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fileType: file.type || 'application/octet-stream',
            fileName: file.name || 'unknown.jpg',
            contentType: file.type || 'application/octet-stream',
            fileSize: file.size,
          }),
        });

        if (!response.ok) {
          // Parse error response
          let errorData;
          try {
            errorData = await response.json();
          } catch (e) {
            errorData = { error: `HTTP error ${response.status}` };
          }
          
          // Handle specific error codes
          if (response.status === 429) {
            throw new Error("Rate limit exceeded. Please try again later.");
          } else if (response.status === 415) {
            throw new Error("Unsupported file type. Please upload a supported file type.");
          } else if (response.status === 413) {
            throw new Error("File size too large. Please upload a smaller file.");
          }
          
          throw new Error(errorData.error || `Failed to get upload URL (${response.status})`);
        }

        // Parse the presigned URL and metadata
        const responseData = await response.json(); // Get the full response first
        if (!responseData || !responseData.success || !responseData.data) {
          throw new Error("Invalid response format from get-upload-url API");
        }
        
        // Correctly destructure from the 'data' property
        const { presignedUrl, objectKey, photoId, caseId, url, expiresAt, nonce } = responseData.data; 
        
        if (!presignedUrl) {
          throw new Error("Presigned URL not found in API response data");
        }
        
        console.log(`Got presigned URL for file: ${file.name}, objectKey: ${objectKey}, expires: ${expiresAt}`);

        // Step 2: Upload to the presigned URL with progress tracking
        const uploadResult = await uploadWithProgress(presignedUrl, file, onProgress);
        console.log("Upload successful to R2 using presigned URL");

        // Return upload metadata
        return {
          id: photoId,
          name: file.name || 'unknown.jpg',
          size: file.size,
          type: file.type || 'application/octet-stream',
          url: url, // Use the correct 'url' for viewing the file
          objectKey: objectKey,
          nonce,
          uploadDate: new Date().toISOString(),
        };
        
      } catch (error) {
        lastError = error;
        
        // Log retry attempt
        console.error(`Upload attempt ${retries + 1} failed:`, error.message);
        
        // If we've reached max retries, throw the error
        if (retries >= maxRetries) {
          break;
        }
        
        // Calculate backoff delay with jitter
        const delay = Math.min(
          1000 * Math.pow(2, retries) + Math.random() * 1000, 
          10000
        );
        
        console.log(`Retrying in ${Math.round(delay / 1000)} seconds...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        
        // Increment retry counter
        retries++;
        
        // Reset progress for retry
        onProgress(0);
      }
    }
    
    // If we get here, we failed after all retries
    throw new Error(`Upload failed after ${maxRetries} attempts: ${lastError?.message || 'Unknown error'}`);
    
  } catch (error) {
    console.error("Error uploading file:", error);
    // Ensure progress is reset on terminal error
    onProgress(0);
    throw error;
  }
}

/**
 * Helper function to upload a file with progress tracking
 * @param {string} url - Presigned URL to upload to
 * @param {File|Blob} file - File to upload
 * @param {Function} onProgress - Progress callback
 * @returns {Promise<Object>} - Upload response
 */
async function uploadWithProgress(url, file, onProgress) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    
    // Set up progress tracking
    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable) {
        const percentComplete = Math.round((event.loaded / event.total) * 100);
        onProgress(percentComplete);
      }
    });
    
    // Set up completion handler
    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        // Parse response if possible
        let responseData = {};
        try {
          if (xhr.responseText) {
            responseData = JSON.parse(xhr.responseText);
          }
        } catch (e) {
          // Ignore parsing errors, R2 presigned URLs may not return JSON
        }
        
        // Ensure 100% progress on completion
        onProgress(100);
        resolve(responseData);
      } else {
        let errorMessage = `Upload failed with status: ${xhr.status}`;
        if (xhr.responseText) {
          errorMessage += ` - ${xhr.responseText.substring(0, 100)}`;
        }
        reject(new Error(errorMessage));
      }
    });
    
    // Set up error handlers
    xhr.addEventListener('error', () => {
      reject(new Error('Network error during upload'));
    });
    
    xhr.addEventListener('abort', () => {
      reject(new Error('Upload was aborted'));
    });
    
    // Open connection and send the file
    xhr.open('PUT', url, true);
    xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream');
    xhr.send(file);
  });
}

/**
 * Helper function to safely get ArrayBuffer from a File or Blob
 * @param {File|Blob} file - File or Blob to convert
 * @returns {Promise<ArrayBuffer>} - File content as ArrayBuffer
 */
export async function getFileArrayBuffer(file) {
  try {
    if (!(file instanceof File) && !(file instanceof Blob)) {
      throw new Error("Invalid file object");
    }

    // Modern browsers support arrayBuffer() method
    if (typeof file.arrayBuffer === 'function') {
      return await file.arrayBuffer();
    }
    
    // Fallback for older browsers using FileReader
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error('FileReader error'));
      reader.readAsArrayBuffer(file);
    });
  } catch (error) {
    console.error("Error converting file to ArrayBuffer:", error);
    throw error;
  }
}
