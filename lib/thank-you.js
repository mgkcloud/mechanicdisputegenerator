/**
 * Thank you page generator module
 */

/**
 * Get a user-friendly name for the document type
 * @param {string} documentType - Internal document type code
 * @returns {string} - User-friendly document type name
 */
export function getDocumentTypeName(documentType) {
  const documentTypes = {
    letter_of_demand: "Letter of Demand to Mechanic",
    consumer_complaint: "Consumer Affairs Victoria Complaint",
    vcat_application: "VCAT Application Form",
    insurance_claim: "Insurance Claim Support Letter",
  }

  return documentTypes[documentType] || "Legal Document"
}
