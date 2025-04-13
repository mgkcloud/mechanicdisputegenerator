/**
 * Analytics Configuration
 * 
 * This file contains configuration settings for the analytics tracking system.
 * Update these values based on your specific implementation requirements.
 */

export const ANALYTICS_CONFIG = {
  // Whether to enable analytics tracking (useful for development/testing)
  enabled: process.env.NODE_ENV === 'production',
  
  // Whether to log tracking events to console (useful for debugging)
  debug: process.env.NODE_ENV !== 'production',
  
  // Event naming conventions - standardizing event names
  events: {
    FUNNEL_START: 'funnel_start',
    FUNNEL_STEP_COMPLETE: 'funnel_step_complete',
    FUNNEL_STEP_EXIT: 'funnel_step_exit',
    FUNNEL_COMPLETE: 'funnel_complete',
    FILE_UPLOAD: 'file_upload',
    BEGIN_CHECKOUT: 'begin_checkout',
    PURCHASE: 'purchase',
    PAYMENT_ERROR: 'payment_error',
    DOCUMENT_GENERATION: 'document_generation',
    DOCUMENT_DOWNLOAD: 'document_download',
    CTA_CLICK: 'cta_click',
    FORM_ERROR: 'form_error',
    PAGE_VIEW: 'page_view',
    USER_DATA_COLLECTED: 'user_data_collected',
    ADVANCED_MATCHING: 'advanced_matching'
  },
  
  // Funnel configuration
  funnel: {
    name: 'dispute_claim',
    steps: [
      { number: 1, name: 'initiate_claim' },
      { number: 2, name: 'enter_details' },
      { number: 3, name: 'upload_evidence' },
      { number: 4, name: 'review' },
      { number: 5, name: 'payment' },
      { number: 6, name: 'download' }
    ]
  },
  
  // Product information
  product: {
    name: 'Mechanic Dispute Resolution Document',
    price: 49.95,
    currency: 'AUD'
  },
  
  // User property configurations
  userProperties: {
    allowedProps: [
      'user_id',
      'visit_count',
      'last_visit_date',
      'referring_source',
      'country',
      'device_type'
    ]
  },

  // Advanced Matching Configuration
  advancedMatching: {
    // Which form fields map to standard user identifiers
    fieldMapping: {
      // Meta Pixel parameter names as keys, form field names as values
      // See: https://developers.facebook.com/docs/meta-pixel/advanced/advanced-matching
      email: 'email', 
      phone: 'phone_number',
      first_name: 'first_name',
      last_name: 'last_name',
      city: 'city',
      state: 'state',
      country: 'country',
      zip: 'postal_code',
      external_id: 'customer_id',
      
      // Additional mapped fields for Google Ads Enhanced Conversions
      // See: https://developers.google.com/google-ads/api/docs/conversions/enhanced-conversions/web
      street: 'street_address',
      address: ['street_address', 'address_line2']
    },
    
    // Which steps collect user information useful for advanced matching
    collectionSteps: [1], // Step 1 (Enter Details) collects user information
    
    // Whether to hash data client-side before sending (some platforms require this)
    hashClientSide: true,
    
    // Fields that should always be hashed before sending anywhere
    sensitiveFields: ['email', 'phone', 'first_name', 'last_name', 'address', 'street']
  },
  
  // Zaraz specific configuration
  zaraz: {
    // Any Zaraz-specific configuration settings
    // This would include Zaraz-specific event mapping or configuration
    eventMapping: {
      // Map our standardized events to specific Zaraz event names if needed
    }
  }
}; 