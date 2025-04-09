"use client"

import { useEffect } from "react"

// Helper function to get cookie value by name
function getCookie(name) {
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) {
    const cookieValue = parts.pop().split(';').shift()
    return cookieValue
  }
  return null
}

// Helper function to delete a cookie
function deleteCookie(name) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
}

// Local storage keys (must match those in page.jsx)
const STORAGE_KEYS = {
  FORM_DATA: "mechanic_dispute_form_data",
  UPLOADED_FILES: "mechanic_dispute_uploaded_files",
  CURRENT_STEP: "mechanic_dispute_current_step",
  CLAIM_STARTED: "mechanic_dispute_claim_started"
}

// Component to check for and process the clear_form_storage cookie
export default function ClearStorageListener() {
  useEffect(() => {
    // Check if the clear_form_storage cookie exists
    const shouldClearStorage = getCookie("clear_form_storage")
    
    if (shouldClearStorage === "true") {
      // Clear localStorage items related to the form
      localStorage.removeItem(STORAGE_KEYS.FORM_DATA)
      localStorage.removeItem(STORAGE_KEYS.UPLOADED_FILES)
      localStorage.removeItem(STORAGE_KEYS.CURRENT_STEP)
      localStorage.removeItem(STORAGE_KEYS.CLAIM_STARTED)
      
      // Delete the cookie after processing
      deleteCookie("clear_form_storage")
      
      console.log("Form data cleared from localStorage")
    }
  }, [])

  // This component doesn't render anything
  return null
} 