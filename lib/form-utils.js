/**
 * Validates form fields
 * @param {Object} formData - Form data to validate
 * @param {Object} formTouched - Tracks which fields have been touched
 * @returns {Object} - Object with errors and isValid flag
 */
export function validateForm(formData, formTouched) {
  const newErrors = {}
  let isValid = true

  // Document Type validation
  const documentType = formData.document_type || ""
  if (!documentType) {
    newErrors.document_type = "Please select a document type"
    isValid = false
  }

  // Customer Name validation
  const customerName = formData.customer_name || ""
  if (!customerName) {
    newErrors.customer_name = "Please enter your full name"
    isValid = false
  } else if (customerName.length < 3) {
    newErrors.customer_name = "Name must be at least 3 characters"
    isValid = false
  }

  // Email validation
  const customerEmail = formData.customer_email || ""
  if (!customerEmail) {
    newErrors.customer_email = "Please enter your email address"
    isValid = false
  } else if (!/^\S+@\S+\.\S+$/.test(customerEmail)) {
    newErrors.customer_email = "Please enter a valid email address"
    isValid = false
  }

  // Phone validation (optional but validate format if provided)
  const customerPhone = formData.customer_phone || ""
  if (customerPhone && !/^[0-9\s+()-]{8,15}$/.test(customerPhone)) {
    newErrors.customer_phone = "Please enter a valid phone number"
    isValid = false
  }

  // Mechanic details validation
  const mechanicName = formData.mechanic_name || ""
  if (!mechanicName) {
    newErrors.mechanic_name = "Please enter the mechanic's business name"
    isValid = false
  }

  // Damage description validation
  const damageDescription = formData.damage_description || ""
  if (!damageDescription) {
    newErrors.damage_description = "Please describe the damage to your vehicle"
    isValid = false
  } else if (damageDescription.length < 10) {
    newErrors.damage_description = "Please provide more details about the damage"
    isValid = false
  }

  return { errors: newErrors, isValid }
}

/**
 * Validates file uploads
 * @param {Array} uploadedFiles - Array of uploaded files
 * @param {Object} errors - Current errors object
 * @returns {Object} - Object with errors and isValid flag
 */
export function validateUploads(uploadedFiles, errors) {
  const newErrors = { ...errors }
  let isValid = true

  // Check if at least one file is uploaded
  if (uploadedFiles.length === 0) {
    newErrors.uploads = "Please upload at least one photo or document as evidence"
    isValid = false
  } else {
    delete newErrors.uploads
  }

  return { errors: newErrors, isValid }
}

/**
 * Format file size for display
 * @param {number} bytes - File size in bytes
 * @returns {string} - Formatted file size
 */
export function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + " bytes"
  else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB"
  else return (bytes / 1048576).toFixed(1) + " MB"
}

/**
 * Format currency for display
 * @param {number} amount - Amount to format
 * @returns {string} - Formatted currency
 */
export function formatCurrency(amount) {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
  }).format(amount)
}
