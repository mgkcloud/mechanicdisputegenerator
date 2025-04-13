/**
 * Centralized analytics tracking utility for mechanic dispute resolution application
 * This file manages all tracking via Zaraz's native methods
 */

import { ANALYTICS_CONFIG } from './analytics-config';

// Helper to check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

/**
 * Track an event using Zaraz's native tracking method
 * @param {string} eventName - The name of the event to track
 * @param {Object} eventProperties - The properties to send with the event
 */
export function trackEvent(eventName, eventProperties = {}) {
  // Skip if not in browser or analytics is disabled
  if (!isBrowser || !ANALYTICS_CONFIG.enabled) return;
  
  if (window.zaraz) {
    // Use Zaraz's native track method
    window.zaraz.track(eventName, eventProperties);
    
    // Log to console in debug mode
    if (ANALYTICS_CONFIG.debug) {
      console.log('[Analytics]', { event: eventName, ...eventProperties });
    }
  } else if (ANALYTICS_CONFIG.debug) {
    console.warn('[Analytics] Zaraz not found, event not tracked:', { event: eventName, ...eventProperties });
  }
}

/**
 * SHA-256 hash function for secure data handling
 * @param {string} str - The string to hash 
 * @returns {Promise<string>} - The hashed string
 */
async function sha256(str) {
  // Skip if not in browser
  if (!isBrowser) return '';
  
  // Only hash if we have a value
  if (!str) return '';
  
  // Convert string to lowercase for consistent hashing
  const normalizedStr = String(str).toLowerCase().trim();
  
  // Create a hash of the string using the Web Crypto API
  const encoder = new TextEncoder();
  const data = encoder.encode(normalizedStr);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  
  // Convert the hash to a hex string
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Normalize user data according to platform requirements
 * @param {Object} userData - The user data to normalize
 * @returns {Object} - The normalized user data
 */
function normalizeUserData(userData) {
  // Skip if not in browser or no userData
  if (!isBrowser || !userData) return {};
  
  const normalized = {};
  
  // Process each field according to standard requirements
  Object.entries(userData).forEach(([key, value]) => {
    if (!value) return; // Skip empty values
    
    switch(key) {
      case 'email':
        normalized[key] = String(value).toLowerCase().trim();
        break;
      case 'phone':
      case 'phone_number':
        // Remove all non-digit characters from phone numbers
        normalized['phone'] = String(value).replace(/\D/g, '');
        break;
      case 'first_name':
      case 'last_name':
        normalized[key] = String(value).toLowerCase().trim();
        break;
      case 'city':
        normalized[key] = String(value).toLowerCase().replace(/\s+/g, '');
        break;
      case 'state':
        normalized[key] = String(value).toLowerCase().trim();
        break;
      case 'postal_code':
      case 'zip':
        normalized['zip'] = String(value).trim();
        break;
      case 'country':
        normalized[key] = String(value).toLowerCase().trim();
        break;
      default:
        normalized[key] = value;
    }
  });
  
  return normalized;
}

/**
 * Format user data for advanced matching in ad platforms
 * @param {Object} userData - User data from the form 
 * @param {boolean} hashData - Whether to hash sensitive data
 * @returns {Promise<Object>} - Formatted user data ready for advanced matching
 */
export async function formatAdvancedMatchingData(userData, hashData = ANALYTICS_CONFIG.advancedMatching.hashClientSide) {
  // Skip if not in browser or no userData
  if (!isBrowser || !userData) return {};
  
  const { fieldMapping, sensitiveFields } = ANALYTICS_CONFIG.advancedMatching;
  const formattedData = {};
  
  // Normalize the data first
  const normalizedData = normalizeUserData(userData);
  
  // Map form fields to standard identifiers
  for (const [matchKey, formField] of Object.entries(fieldMapping)) {
    // Skip if the form field doesn't exist in the user data
    if (Array.isArray(formField)) {
      // Some fields might be composed of multiple form fields (e.g. full address)
      const values = formField
        .map(field => normalizedData[field])
        .filter(Boolean); // Remove empty values
        
      if (values.length > 0) {
        formattedData[matchKey] = values.join(' ');
      }
    } else if (normalizedData[formField]) {
      formattedData[matchKey] = normalizedData[formField];
    }
  }
  
  // Optionally hash sensitive fields
  if (hashData) {
    const dataToHash = { ...formattedData };
    
    // Process each sensitive field that needs hashing
    for (const field of sensitiveFields) {
      if (dataToHash[field]) {
        // Replace the value with its hash
        formattedData[field] = await sha256(dataToHash[field]);
      }
    }
  }
  
  return formattedData;
}

/**
 * Track user identity data for advanced matching
 * @param {Object} formData - The form data containing user information
 * @param {number} stepNumber - The current step number
 */
export async function trackUserIdentity(formData, stepNumber) {
  // Skip if not in browser or no formData
  if (!isBrowser || !formData) return;
  
  const { collectionSteps } = ANALYTICS_CONFIG.advancedMatching;
  
  // Only track on steps that collect relevant user information
  if (!collectionSteps.includes(stepNumber)) return;
  
  try {
    // Format the user data for advanced matching
    const advancedMatchingData = await formatAdvancedMatchingData(formData);
    
    // Store the data with Zaraz for use in future events
    if (window.zaraz) {
      // Use Zaraz's set method to store user properties
      // This makes them available for all future events
      Object.entries(advancedMatchingData).forEach(([key, value]) => {
        window.zaraz.set(key, value);
      });
      
      // Also track a specific event with this data
      trackEvent(ANALYTICS_CONFIG.events.USER_DATA_COLLECTED, {
        step_number: stepNumber,
        has_email: !!advancedMatchingData.email,
        has_phone: !!advancedMatchingData.phone,
        identity_complete: !!(advancedMatchingData.email || advancedMatchingData.phone)
      });
      
      if (ANALYTICS_CONFIG.debug) {
        console.log('[Analytics] Collected user identity data', {
          // Don't log the actual values in debug mode, just the fields collected
          fields: Object.keys(advancedMatchingData)
        });
      }
    }
  } catch (error) {
    if (ANALYTICS_CONFIG.debug) {
      console.error('[Analytics] Error tracking user identity:', error);
    }
  }
}

/**
 * Get stored user identity data for conversion tracking
 * This enables enhanced conversions across ad platforms
 * @returns {Object} - The stored user identity data
 */
export function getUserIdentityData() {
  // Skip if not in browser
  if (!isBrowser) return {};
  
  const identityData = {};
  
  // Assemble identity data from what's been stored in Zaraz
  if (window.zaraz && window.zaraz.get) {
    // Try to get each key from the standard mapping
    const { fieldMapping } = ANALYTICS_CONFIG.advancedMatching;
    
    Object.keys(fieldMapping).forEach(key => {
      const value = window.zaraz.get(key);
      if (value) {
        identityData[key] = value;
      }
    });
  }
  
  return identityData;
}

/**
 * Track a page view
 * @param {string} pageTitle - The title of the page
 * @param {string} pagePath - The path of the page
 */
export function trackPageView(pageTitle, pagePath) {
  // Skip if not in browser
  if (!isBrowser) return;
  
  const pageProperties = {
    page_title: pageTitle || document.title || '',
    page_path: pagePath || window.location.pathname || '',
    page_location: window.location.href || '',
  };
  
  trackEvent(ANALYTICS_CONFIG.events.PAGE_VIEW, pageProperties);
}

/**
 * FUNNEL TRACKING
 * 
 * The following functions track user progress through the dispute claim form funnel
 */

/**
 * Track when a user initiates the claim process
 */
export function trackClaimStart() {
  // Skip if not in browser
  if (!isBrowser) return;
  
  const { funnel } = ANALYTICS_CONFIG;
  trackEvent(ANALYTICS_CONFIG.events.FUNNEL_START, {
    funnel_name: funnel.name,
    funnel_step: funnel.steps[0].number,
    funnel_step_name: funnel.steps[0].name
  });
}

/**
 * Track when a user completes a form step
 * @param {number} stepNumber - The number of the completed step (1-5)
 * @param {string} stepName - The name of the completed step
 * @param {Object} additionalData - Any additional data to include with the event
 */
export function trackStepCompletion(stepNumber, stepName, additionalData = {}) {
  // Skip if not in browser
  if (!isBrowser) return;
  
  trackEvent(ANALYTICS_CONFIG.events.FUNNEL_STEP_COMPLETE, {
    funnel_name: ANALYTICS_CONFIG.funnel.name,
    funnel_step: stepNumber,
    funnel_step_name: stepName,
    ...additionalData
  });
}

/**
 * Track when a user abandons a form step
 * @param {number} stepNumber - The number of the abandoned step (1-5)
 * @param {string} stepName - The name of the abandoned step
 * @param {string} reason - The reason for abandonment (if known)
 */
export function trackStepAbandonment(stepNumber, stepName, reason = 'unknown') {
  // Skip if not in browser
  if (!isBrowser) return;
  
  trackEvent(ANALYTICS_CONFIG.events.FUNNEL_STEP_EXIT, {
    funnel_name: ANALYTICS_CONFIG.funnel.name,
    funnel_step: stepNumber,
    funnel_step_name: stepName,
    exit_reason: reason
  });
}

/**
 * Track when the entire form process is completed (payment successful)
 * @param {string} transactionId - The ID of the successful transaction
 * @param {number} value - The value of the transaction
 */
export function trackFormCompletion(transactionId, value) {
  // Skip if not in browser
  if (!isBrowser) return;
  
  const { product } = ANALYTICS_CONFIG;
  
  // Include user identity data for conversion tracking
  const identityData = getUserIdentityData();
  
  trackEvent(ANALYTICS_CONFIG.events.FUNNEL_COMPLETE, {
    funnel_name: ANALYTICS_CONFIG.funnel.name,
    transaction_id: transactionId,
    value: value || product.price,
    currency: product.currency,
    // Add identity data for enhanced conversion tracking
    ...identityData
  });
}

/**
 * FILE UPLOADS & INTERACTIONS
 */

/**
 * Track when a user uploads a file
 * @param {string} fileType - The type of file uploaded
 * @param {number} fileSize - The size of the file in bytes
 * @param {number} fileCount - The total number of files uploaded so far
 */
export function trackFileUpload(fileType, fileSize, fileCount) {
  // Skip if not in browser
  if (!isBrowser) return;
  
  trackEvent(ANALYTICS_CONFIG.events.FILE_UPLOAD, {
    file_type: fileType,
    file_size: fileSize,
    file_count: fileCount
  });
}

/**
 * PAYMENT TRACKING
 */

/**
 * Track when a user initiates the checkout process
 * @param {number} value - The value of the transaction
 */
export function trackCheckoutStart(value) {
  // Skip if not in browser
  if (!isBrowser) return;
  
  const { product } = ANALYTICS_CONFIG;
  
  // Include user identity data for conversion tracking
  const identityData = getUserIdentityData();
  
  trackEvent(ANALYTICS_CONFIG.events.BEGIN_CHECKOUT, {
    value: value || product.price,
    currency: product.currency,
    items: [
      {
        item_name: product.name,
        price: value || product.price
      }
    ],
    // Add identity data for enhanced conversion tracking
    ...identityData
  });
}

/**
 * Track when a payment is successful
 * @param {string} transactionId - The ID of the successful transaction
 * @param {number} value - The value of the transaction
 */
export function trackPaymentSuccess(transactionId, value) {
  // Skip if not in browser
  if (!isBrowser) return;
  
  const { product } = ANALYTICS_CONFIG;
  const transactionValue = value || product.price;
  
  // Include user identity data for conversion tracking
  const identityData = getUserIdentityData();
  
  // Track purchase event
  trackEvent(ANALYTICS_CONFIG.events.PURCHASE, {
    transaction_id: transactionId,
    value: transactionValue,
    currency: product.currency,
    items: [
      {
        item_name: product.name,
        price: transactionValue
      }
    ],
    // Add identity data for enhanced conversion tracking
    ...identityData
  });
  
  // Also track as funnel completion
  trackFormCompletion(transactionId, transactionValue);
}

/**
 * Track when a payment fails
 * @param {string} errorCode - The error code from the payment provider
 * @param {string} errorMessage - The error message
 */
export function trackPaymentFailure(errorCode, errorMessage) {
  // Skip if not in browser
  if (!isBrowser) return;
  
  trackEvent(ANALYTICS_CONFIG.events.PAYMENT_ERROR, {
    error_code: errorCode,
    error_message: errorMessage
  });
}

/**
 * DOCUMENT INTERACTION TRACKING
 */

/**
 * Track when a document is generated
 * @param {string} documentType - The type of document generated
 */
export function trackDocumentGeneration(documentType) {
  // Skip if not in browser
  if (!isBrowser) return;
  
  // Ensure we have a valid string for documentType
  const safeDocumentType = documentType && typeof documentType === 'string' 
    ? documentType 
    : 'mechanic_dispute';
  
  trackEvent(ANALYTICS_CONFIG.events.DOCUMENT_GENERATION, {
    document_type: safeDocumentType
  });
}

/**
 * Track when a document is downloaded
 * @param {string} documentType - The type of document downloaded
 * @param {string} documentFormat - The format of the document (PDF, DOCX)
 */
export function trackDocumentDownload(documentType, documentFormat) {
  // Skip if not in browser
  if (!isBrowser) return;
  
  // Ensure we have valid strings
  const safeDocumentType = documentType && typeof documentType === 'string' 
    ? documentType 
    : 'mechanic_dispute';
    
  const safeFormat = documentFormat && typeof documentFormat === 'string' 
    ? documentFormat 
    : 'pdf';
  
  trackEvent(ANALYTICS_CONFIG.events.DOCUMENT_DOWNLOAD, {
    document_type: safeDocumentType,
    document_format: safeFormat
  });
}

/**
 * USER ENGAGEMENT TRACKING
 */

/**
 * Track when a user clicks a CTA button
 * @param {string} ctaText - The text of the CTA button
 * @param {string} ctaLocation - The location of the CTA on the site
 */
export function trackCTAClick(ctaText, ctaLocation) {
  // Skip if not in browser
  if (!isBrowser) return;
  
  trackEvent(ANALYTICS_CONFIG.events.CTA_CLICK, {
    cta_text: ctaText,
    cta_location: ctaLocation
  });
}

/**
 * Track when a user shares a page or content
 * @param {string} method - The sharing method used
 * @param {string} contentType - The type of content shared
 */
export function trackShare(method, contentType) {
  // Skip if not in browser
  if (!isBrowser) return;
  
  trackEvent('share', {
    method: method,
    content_type: contentType
  });
}

/**
 * Track form field errors
 * @param {string} fieldName - The name of the field with the error
 * @param {string} errorMessage - The error message
 * @param {number} stepNumber - The step where the error occurred
 */
export function trackFormError(fieldName, errorMessage, stepNumber) {
  // Skip if not in browser
  if (!isBrowser) return;
  
  trackEvent(ANALYTICS_CONFIG.events.FORM_ERROR, {
    field_name: fieldName,
    error_message: errorMessage,
    step_number: stepNumber
  });
}

/**
 * Initialize user properties for more detailed analysis
 * @param {Object} properties - The user properties to set
 */
export function setUserProperties(properties) {
  // Skip if not in browser or no properties
  if (!isBrowser || !properties) return;
  
  // Filter to only include allowed properties
  const allowedProps = ANALYTICS_CONFIG.userProperties.allowedProps;
  const filteredProps = Object.keys(properties)
    .filter(key => allowedProps.includes(key))
    .reduce((obj, key) => {
      obj[key] = properties[key];
      return obj;
    }, {});
  
  // Use Zaraz's set method directly to set user properties
  if (window.zaraz) {
    Object.entries(filteredProps).forEach(([key, value]) => {
      window.zaraz.set(key, value);
    });
    
    if (ANALYTICS_CONFIG.debug) {
      console.log('[Analytics] Set user properties:', filteredProps);
    }
  }
} 