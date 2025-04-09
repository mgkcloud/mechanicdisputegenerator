/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
  constructor(message, statusCode = 500, details = null) {
    super(message)
    this.name = "ApiError"
    this.statusCode = statusCode
    this.details = details
  }
}

/**
 * Handle API errors consistently
 * @param {Error} error - Error to handle
 * @returns {Object} - Error response object
 */
export function handleApiError(error) {
  console.error("API Error:", error)

  if (error instanceof ApiError) {
    return {
      success: false,
      error: error.message,
      details: error.details,
      statusCode: error.statusCode,
    }
  }

  return {
    success: false,
    error: error.message || "An unexpected error occurred",
    statusCode: 500,
  }
}

/**
 * Validate required fields in a request
 * @param {Object} data - Data to validate
 * @param {Array} requiredFields - Array of required field names
 * @throws {ApiError} - If any required fields are missing
 */
export function validateRequiredFields(data, requiredFields) {
  const missingFields = requiredFields.filter((field) => !data[field])

  if (missingFields.length > 0) {
    throw new ApiError(`Missing required fields: ${missingFields.join(", ")}`, 400, { missingFields })
  }
}
