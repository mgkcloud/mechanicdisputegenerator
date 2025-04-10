/**
 * Utility functions for handling file uploads 
 */

/**
 * Uploads a file using the two-step direct upload approach
 * 1. Get a pre-signed URL from our API
 * 2. Upload the file directly to R2 using that URL
 * 
 * @param {File} file - The file to upload
 * @param {string|null} caseId - Optional case ID to associate with the file
 * @returns {Promise<Object>} - The uploaded file metadata
 */
export async function uploadFile(file, caseId = null) {
  try {
    // Step 1: Get the upload URL
    const headers = {};
    if (caseId) {
      headers["X-Case-Id"] = caseId;
    }
    
    const response = await fetch('/api/get-upload-url', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      body: JSON.stringify({
        fileName: file.name,
        fileType: file.type
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Failed to get upload URL:', errorData);
      throw new Error(`Failed to get upload URL: ${errorData?.error?.message || errorData?.error || 'Unknown error'}`);
    }

    const responseData = await response.json();
    if (!responseData || !responseData.success || !responseData.data) {
      throw new Error("Invalid response format from get-upload-url API");
    }

    // Correctly destructure from the 'data' property
    const { uploadUrl, photoId, caseId: returnedCaseId, url } = responseData.data; 
    
    if (!uploadUrl) {
      throw new Error("uploadUrl not found in API response data");
    }
    
    console.log('Got upload URL:', { uploadUrl, photoId, caseId: returnedCaseId, url });

    // Step 2: Upload the file directly
    const uploadResponse = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': file.type,
      },
      body: file
    });

    if (!uploadResponse.ok) {
      const errorData = await uploadResponse.json();
      console.error('Direct upload failed:', errorData);
      throw new Error(`Direct upload failed: ${errorData.error || 'Unknown error'}`);
    }
    
    const uploadResult = await uploadResponse.json();
    console.log('Upload successful:', uploadResult);

    // Return file metadata
    return {
      id: photoId,
      name: file.name,
      size: file.size,
      type: file.type,
      url: url,
      caseId: returnedCaseId
    };
  } catch (error) {
    console.error('Upload failed:', error);
    throw error;
  }
}

/**
 * Upload multiple files in parallel
 * 
 * @param {File[]} files - Array of files to upload
 * @param {string|null} caseId - Optional case ID to associate with the files
 * @returns {Promise<Object[]>} - Array of uploaded file metadata
 */
export async function uploadMultipleFiles(files, caseId = null) {
  try {
    const uploadPromises = Array.from(files).map(file => uploadFile(file, caseId));
    return await Promise.all(uploadPromises);
  } catch (error) {
    console.error('Multiple file upload failed:', error);
    throw error;
  }
}

/**
 * Advanced upload utilities for direct R2 uploads with presigned URLs
 * Supports progress tracking, error handling, retries, and various file validations
 */

import { uploadFileToR2 } from './file-utils';

/**
 * Default file upload configuration
 */
export const DEFAULT_UPLOAD_CONFIG = {
  maxFileSize: 100 * 1024 * 1024, // 100MB
  allowedTypes: [
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
  ],
  maxRetries: 3,
  concurrentUploads: 3,
  showProgressBar: true
};

/**
 * Upload a single file to R2 with progress tracking and validation
 * 
 * @param {File} file - The file to upload
 * @param {Object} options - Upload options
 * @param {Function} options.onProgress - Progress callback (0-100)
 * @param {Function} options.onSuccess - Success callback
 * @param {Function} options.onError - Error callback
 * @param {number} options.maxFileSize - Maximum file size in bytes
 * @param {Array<string>} options.allowedTypes - Array of allowed MIME types
 * @param {number} options.maxRetries - Maximum retry attempts
 * @returns {Promise<Object>} Upload result
 */
export async function uploadFile(file, options = {}) {
  const {
    onProgress = () => {},
    onSuccess = () => {},
    onError = () => {},
    maxFileSize = DEFAULT_UPLOAD_CONFIG.maxFileSize,
    allowedTypes = DEFAULT_UPLOAD_CONFIG.allowedTypes,
    maxRetries = DEFAULT_UPLOAD_CONFIG.maxRetries
  } = options;
  
  try {
    // Validate file size
    if (file.size > maxFileSize) {
      const error = new Error(`File size exceeds maximum allowed size of ${maxFileSize / (1024 * 1024)}MB`);
      error.code = 'FILE_TOO_LARGE';
      onError(error);
      return {
        success: false,
        error: error.message,
        code: error.code
      };
    }
    
    // Validate file type
    if (allowedTypes && !allowedTypes.includes(file.type)) {
      const error = new Error(`File type ${file.type} not allowed. Allowed types: ${allowedTypes.join(', ')}`);
      error.code = 'INVALID_FILE_TYPE';
      onError(error);
      return {
        success: false,
        error: error.message,
        code: error.code
      };
    }
    
    // Upload file using the enhanced uploadFileToR2 function
    const result = await uploadFileToR2(file, {
      onProgress,
      maxRetries,
      maxFileSize,
      allowedTypes
    });
    
    if (result && result.id) {
      onSuccess(result);
      return {
        success: true,
        fileId: result.id,
        url: result.url,
        objectKey: result.objectKey,
        fileName: result.name,
        fileType: result.type,
        fileSize: result.size
      };
    } else {
      throw new Error('Upload failed with unknown error');
    }
  } catch (error) {
    console.error('Upload error:', error);
    onError(error);
    return {
      success: false,
      error: error.message,
      code: error.code || 'UPLOAD_FAILED'
    };
  }
}

/**
 * Upload multiple files with concurrency control
 * 
 * @param {Array<File>} files - Array of files to upload
 * @param {Object} options - Upload options
 * @param {Function} options.onProgress - Overall progress callback (0-100)
 * @param {Function} options.onFileProgress - Per-file progress callback (file, progress)
 * @param {Function} options.onFileComplete - Per-file completion callback (file, result)
 * @param {Function} options.onComplete - All files completion callback (results)
 * @param {Function} options.onError - Error callback (error, file)
 * @param {number} options.concurrentUploads - Max concurrent uploads
 * @returns {Promise<Array<Object>>} Array of upload results
 */
export async function uploadFiles(files, options = {}) {
  const {
    onProgress = () => {},
    onFileProgress = () => {},
    onFileComplete = () => {},
    onComplete = () => {},
    onError = () => {},
    concurrentUploads = DEFAULT_UPLOAD_CONFIG.concurrentUploads,
    ...fileOptions
  } = options;
  
  const fileArray = Array.from(files);
  const total = fileArray.length;
  
  if (total === 0) {
    return [];
  }
  
  // Track progress for all files
  const progressMap = new Map(fileArray.map(file => [file, 0]));
  
  // Function to calculate overall progress
  const updateOverallProgress = () => {
    const progressValues = Array.from(progressMap.values());
    const overallProgress = progressValues.reduce((sum, value) => sum + value, 0) / total;
    onProgress(Math.round(overallProgress));
  };
  
  // Process files with concurrency control
  const results = [];
  const queue = [...fileArray];
  const activeUploads = new Set();
  
  // Process the next file from the queue
  const processNext = async () => {
    if (queue.length === 0) return;
    
    const file = queue.shift();
    activeUploads.add(file);
    
    try {
      const result = await uploadFile(file, {
        ...fileOptions,
        onProgress: (progress) => {
          progressMap.set(file, progress);
          onFileProgress(file, progress);
          updateOverallProgress();
        },
        onSuccess: (data) => {
          onFileComplete(file, { success: true, ...data });
        },
        onError: (error) => {
          onError(error, file);
        }
      });
      
      results.push({ file, ...result });
    } catch (error) {
      results.push({ file, success: false, error: error.message });
    }
    
    activeUploads.delete(file);
    
    // If queue not empty, process next
    if (queue.length > 0) {
      await processNext();
    } else if (activeUploads.size === 0) {
      // If queue empty and no active uploads, we're done
      onComplete(results);
    }
  };
  
  // Start initial batch of uploads
  const initialBatch = Math.min(concurrentUploads, total);
  const promises = [];
  
  for (let i = 0; i < initialBatch; i++) {
    promises.push(processNext());
  }
  
  await Promise.all(promises);
  return results;
}

/**
 * Generate a human-readable file size string
 * @param {number} bytes File size in bytes
 * @returns {string} Human-readable file size
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Validate if a file matches size and type constraints
 * @param {File} file The file to validate
 * @param {Object} options Validation options
 * @returns {Object} Validation result {valid, error}
 */
export function validateFile(file, options = {}) {
  const {
    maxFileSize = DEFAULT_UPLOAD_CONFIG.maxFileSize,
    allowedTypes = DEFAULT_UPLOAD_CONFIG.allowedTypes
  } = options;
  
  // Validate file size
  if (file.size > maxFileSize) {
    return {
      valid: false,
      error: `File size exceeds maximum allowed size of ${formatFileSize(maxFileSize)}`,
      code: 'FILE_TOO_LARGE'
    };
  }
  
  // Validate file type if specified
  if (allowedTypes && allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type ${file.type} not allowed`,
      code: 'INVALID_FILE_TYPE'
    };
  }
  
  return { valid: true };
} 