/**
 * Shared constants for the application
 */

// Document types and their descriptions
export const AU_DOCUMENT_TYPES = {
  letter_of_demand: "Letter of Demand to Mechanic",
  consumer_complaint: "Consumer Affairs Complaint",
  vcat_application: "VCAT Application Form", // Example, adjust actual types as needed
  insurance_claim: "Insurance Claim Support Letter", // Example
};

// Add other shared constants here if needed 

// Define escalation bodies for dropdown/select (Keep for reference if needed)
export const ESCALATION_BODIES = [
    { value: "ACAT", label: "ACAT (ACT Civil and Administrative Tribunal)" },
    { value: "NCAT", label: "NCAT (NSW Civil and Administrative Tribunal)" },
    { value: "NTCAT", label: "NTCAT (NT Civil and Administrative Tribunal)" },
    { value: "QCAT", label: "QCAT (Queensland Civil and Administrative Tribunal)" },
    { value: "SACAT", label: "SACAT (South Australian Civil and Administrative Tribunal)" },
    { value: "TASCAT", label: "TASCAT (Tasmanian Civil and Administrative Tribunal)" },
    { value: "VCAT", label: "VCAT (Victorian Civil and Administrative Tribunal)" },
    { value: "SAT", label: "SAT (WA State Administrative Tribunal)" },
    { value: "Federal Court", label: "Federal Court / Small Claims" },
    { value: "Other", label: "Other / Not Sure" },
]

// Mapping from State code to default Escalation Body code
export const STATE_TO_ESCALATION_BODY = {
  ACT: "ACAT",
  NSW: "NCAT",
  NT: "NTCAT",
  QLD: "QCAT",
  SA: "SACAT",
  TAS: "TASCAT",
  VIC: "VCAT",
  WA: "SAT",
  // Federal Court or Other could be defaults or handled differently
}

// Form Storage Keys
// ... existing code ... 