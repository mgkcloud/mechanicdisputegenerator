'use client'

import { useEffect } from 'react'

function GlobalErrorHandler() {
  useEffect(() => {
    const handleError = (message, source, lineno, colno, error) => {
      // Log the error to the console
      console.error('Global error caught:', {
        message,
        source,
        lineno,
        colno,
        error,
      })
      // Optionally, send the error to your logging service
      // logErrorToService(error, { message, source, lineno, colno });
      
      // Return true to prevent the browser's default error handling (e.g., console message)
      // Set to false if you want the default browser error message to appear as well
      // return true;
    }

    // Add the event listener
    window.addEventListener('error', handleError)

    // Remove the event listener on cleanup
    return () => {
      window.removeEventListener('error', handleError)
    }
  }, [])

  // This component doesn't render anything
  return null
}

export default GlobalErrorHandler 