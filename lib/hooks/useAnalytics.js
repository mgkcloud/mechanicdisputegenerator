import { useEffect, useCallback } from 'react';
import * as analytics from '../analytics';

// Helper to check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

/**
 * Custom hook for tracking analytics events throughout the application
 * Provides an easy way for components to access tracking functions
 * 
 * @returns {Object} Object containing all analytics tracking functions
 */
export default function useAnalytics() {
  // Track page view on initial mount
  useEffect(() => {
    // Only track page views in the browser
    if (isBrowser) {
      // Small delay to ensure page is fully loaded
      const timeoutId = setTimeout(() => {
        analytics.trackPageView();
      }, 100);
      
      return () => clearTimeout(timeoutId);
    }
  }, []);
  
  // Memoize tracking functions to prevent unnecessary re-renders
  const trackClaimStart = useCallback(analytics.trackClaimStart, []);
  
  const trackStepCompletion = useCallback(analytics.trackStepCompletion, []);
  
  const trackStepAbandonment = useCallback(analytics.trackStepAbandonment, []);
  
  const trackFormCompletion = useCallback(analytics.trackFormCompletion, []);
  
  const trackFileUpload = useCallback(analytics.trackFileUpload, []);
  
  const trackCheckoutStart = useCallback(analytics.trackCheckoutStart, []);
  
  const trackPaymentSuccess = useCallback(analytics.trackPaymentSuccess, []);
  
  const trackPaymentFailure = useCallback(analytics.trackPaymentFailure, []);
  
  const trackDocumentGeneration = useCallback(analytics.trackDocumentGeneration, []);
  
  const trackDocumentDownload = useCallback(analytics.trackDocumentDownload, []);
  
  const trackCTAClick = useCallback(analytics.trackCTAClick, []);
  
  const trackFormError = useCallback(analytics.trackFormError, []);
  
  const setUserProperties = useCallback(analytics.setUserProperties, []);

  // Advanced matching functions
  const trackUserIdentity = useCallback(analytics.trackUserIdentity, []);
  
  const formatAdvancedMatchingData = useCallback(analytics.formatAdvancedMatchingData, []);
  
  const getUserIdentityData = useCallback(analytics.getUserIdentityData, []);
  
  // Return all tracking functions as an object
  return {
    trackClaimStart,
    trackStepCompletion,
    trackStepAbandonment,
    trackFormCompletion,
    trackFileUpload,
    trackCheckoutStart,
    trackPaymentSuccess,
    trackPaymentFailure,
    trackDocumentGeneration,
    trackDocumentDownload,
    trackCTAClick,
    trackFormError,
    setUserProperties,
    // Advanced matching functions
    trackUserIdentity,
    formatAdvancedMatchingData,
    getUserIdentityData,
    // Include direct access to trackEvent for custom events
    trackEvent: analytics.trackEvent
  };
} 