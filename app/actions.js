"use server"

import { cookies } from "next/headers"

/**
 * Sets a cookie to trigger localStorage clearing via client-side JS
 */
export async function setClearStorageCookie() {
  cookies().set("clear_form_storage", "true", { 
    maxAge: 60, // Short expiry (seconds)
    path: "/"
  })
  return true
}

/**
 * Clears form storage by setting a cookie
 */
export async function clearFormStorage() {
  // Call the server action to set the cookie
  await setClearStorageCookie()
} 