/**
 * Upload file to R2 storage
 * @param {File} file - File to upload
 * @returns {Promise<Object>} - Uploaded file metadata
 */
export async function uploadFileToR2(file) {
  try {
    const formData = new FormData()
    formData.append("photo", file)

    // Generate a case ID if not already available
    const caseId = `case_${Math.random().toString(36).substring(2, 10)}`
    formData.append("case_id", caseId)

    const response = await fetch("/api/upload-photo", {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "Failed to upload file")
    }

    const data = await response.json()
    return {
      id: data.photoId,
      name: file.name,
      size: file.size,
      type: file.type,
      url: data.url,
      uploadDate: new Date().toISOString(),
    }
  } catch (error) {
    console.error("Error uploading file:", error)
    throw error
  }
}
