/**
 * Australian document generator module for Next.js
 * Generates legal documents for Australian mechanic disputes
 */
import { v4 as uuidv4 } from "uuid"

// Document types and their descriptions
export const AU_DOCUMENT_TYPES = {
  letter_of_demand: "Letter of Demand to Mechanic",
  consumer_complaint: "Consumer Affairs Victoria Complaint",
  vcat_application: "VCAT Application Form",
  insurance_claim: "Insurance Claim Support Letter",
}

// Australian legal context for document generation
const LEGAL_CONTEXT_AUSTRALIA = `
**Key Legal Principles for Australian Mechanic Disputes (Victoria Focus):**

1.  **Australian Consumer Law (ACL) - Guarantee of Due Care and Skill:**
    *   Services must be provided with due care and skill (Consumer Guarantee).
    *   Mechanics must take all reasonable care to avoid loss or damage to the vehicle.
    *   Failure to do so (e.g., causing damage) is a breach of this guarantee.
    *   Businesses cannot contract out of this guarantee; liability waivers are generally void.
    *   Remedies for breach include repair, replacement, or compensation for loss.

2.  **Bailment Law:**
    *   Leaving a car with a mechanic creates a bailment for reward.
    *   The mechanic (bailee) owes a duty of care to safeguard the property.
    *   If damage occurs in their custody, the onus is on the mechanic to prove they took reasonable care or that lack of care didn't cause the damage. Presumption is against them.

3.  **Negligence:**
    *   Mechanics owe a general duty of care under negligence law.
    *   Failure to exercise reasonable care resulting in foreseeable damage makes them liable.

4.  **Payment Under Protest:**
    *   Paying a disputed invoice "under protest" (clearly documented) reserves the right to contest the charge or seek compensation later.
    *   It prevents the argument that payment signified acceptance or waiver of rights.
    *   Useful when payment is required to retrieve the vehicle (due to mechanic's lien).

5.  **Consequential Loss:**
    *   Consumers can claim reasonably foreseeable losses resulting from the breach.
    *   Examples: Insurance excess, increased future premiums, hire car costs, time off work.

6.  **Dispute Resolution Steps (Victoria):**
    *   **Direct Communication:** Attempt to resolve directly with the mechanic/manager.
    *   **Formal Demand Letter:** Put the complaint and demand in writing, setting a deadline.
    *   **Consumer Affairs Victoria (CAV):** Lodge a complaint for free conciliation/mediation (voluntary process).
    *   **Victorian Civil and Administrative Tribunal (VCAT):** File a claim for a legally binding decision (Civil Claims List). VCAT is less formal than court.

7.  **Evidence:**
    *   Crucial: Photos (before/after), invoices, written communications, independent mechanic reports/quotes, witness statements.

8.  **Important Notes:**
    *   Do NOT sign broad waivers of future claims or non-disparagement ('gag') clauses unless fully compensated and satisfied.
    *   Credit card chargebacks can be attempted for services not rendered correctly (including damage caused).
`

/**
 * Generate a document for Australian mechanic disputes
 * @param {Object} formData - Form data from the request
 * @returns {Promise<Object>} - Generated document content
 */
export async function generateAustralianDocument(formData) {
  try {
    // Extract form data
    const documentType = formData.document_type
    const customerName = formData.customer_name
    const mechanicName = formData.mechanic_name
    const mechanicABN = formData.mechanic_abn || "Not provided"
    const state = formData.state || "Victoria"
    const vehicleDetails = formData.vehicle_details || ""
    const serviceDate = formData.service_date || ""
    const damageDescription = formData.damage_description || ""
    const repairCost = formData.repair_cost || ""
    const photoEvidence =
      formData.photo_evidence === "yes" ? "Photo evidence is available and attached." : "No photo evidence attached."

    // Special clauses for mechanic disputes
    const clauses = []
    if (formData.clause_consumer_law) {
      clauses.push("Australian Consumer Law References")
    }
    if (formData.clause_no_waiver) {
      clauses.push("No Waiver/Non-Disparagement Clause")
    }
    if (formData.clause_insurance) {
      clauses.push("Insurance Claim Details")
    }
    if (formData.clause_timeline) {
      clauses.push("Detailed Timeline of Events")
    }

    const additionalInstructions = formData.additional_instructions || ""

    // Create prompt for the OpenAI API
    const prompt = `Generate a professional and legally-informed **${AU_DOCUMENT_TYPES[documentType] || "legal document"}** for ${customerName} regarding a dispute with mechanic ${mechanicName} (ABN: ${mechanicABN}) in ${state}, Australia. Integrate the user's details smoothly into the appropriate template structure for this document type. Adapt the language and tone based on the specific document required (e.g., formal demand, complaint submission).

**User Provided Details:**
- Document Type Requested: ${AU_DOCUMENT_TYPES[documentType]}
- Customer Name: ${customerName}
- Mechanic Name: ${mechanicName}
- Mechanic ABN: ${mechanicABN}
- State/Territory: ${state}
- Vehicle Details: ${vehicleDetails}
- Service Date: ${serviceDate}
- Damage Description: ${damageDescription}
- Repair Cost Estimate: ${repairCost || "Not specified"}
- Photo Evidence Available: ${photoEvidence}
- Special Clauses Mentioned: ${clauses.length ? clauses.join(", ") : "None specified"}
- Additional Instructions from User: ${additionalInstructions || "None"}

**Australian Legal Context to Incorporate:**
${LEGAL_CONTEXT_AUSTRALIA}

**Task:**
1.  Select the appropriate base template structure for a **${AU_DOCUMENT_TYPES[documentType]}**.
2.  Carefully integrate the user's details provided above into the template.
3.  Weave in relevant points from the **Australian Legal Context** section to strengthen the document (e.g., citing ACL guarantees in a demand letter, explaining bailment principles, referencing CAV/VCAT escalation paths).
4.  Address any 'Special Clauses' or 'Additional Instructions' requested by the user.
5.  Ensure the final document is professional, legally sound for Australia (${state}), clear, and avoids jargon where possible.
6.  If generating a letter/complaint, maintain a firm but reasonable tone focused on facts and legal rights.
7.  **Crucially:** Do NOT include any clauses that waive consumer rights, require non-disparagement, or agree to release future claims unless the user explicitly instructed this (which is highly unlikely for initial demands/complaints).
8.  Format according to professional legal document standards.
`

    // Call OpenAI API
    let documentText
    try {
      // Call to OpenAI API
      const openaiApiKey = process.env.OPENAI_API_KEY
      if (!openaiApiKey) {
        throw new Error("OpenAI API key not configured")
      }

      console.log("Calling OpenAI API for document generation...")

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openaiApiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4-turbo",
          messages: [
            {
              role: "system",
              content:
                "You are an expert Australian legal assistant specializing in consumer law and mechanic disputes. Your role is to generate precise, legally sound, and effective documents (like Letters of Demand, CAV complaints, VCAT guidance) based on user input and provided Australian legal context. You must strictly adhere to the legal principles provided, integrate user details accurately, and ensure the final document protects the consumer's rights under Australian law, particularly the ACL and bailment principles. Avoid hallucinations and stick closely to the provided context and user details.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          max_tokens: 4000,
          temperature: 0.5,
        }),
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: { message: "Unknown API error" } }))
        throw new Error(`OpenAI API error: ${error.error?.message || "Unknown error"}`)
      }

      const data = await response.json().catch(() => {
        throw new Error("Failed to parse OpenAI API response")
      })

      if (!data.choices || !data.choices[0] || !data.choices[0].message || !data.choices[0].message.content) {
        throw new Error("Invalid or empty response from OpenAI API")
      }

      documentText = data.choices[0].message.content

      // Validate and clean the response text
      if (typeof documentText !== "string" || documentText.trim().length === 0) {
        throw new Error("Empty or invalid document text received from OpenAI")
      }

      // Sanitize the text
      documentText = documentText.replace(/[\x00-\x09\x0B\x0C\x0E-\x1F\x7F]/g, "")
    } catch (apiError) {
      console.error("OpenAI API Error:", apiError)

      // Fallback to template if API fails
      console.log("Falling back to template due to API error")

      // Import templates
      const { getAustralianTemplate } = await import("./australian-templates")

      // Get template
      const templateKey = AU_DOCUMENT_TYPES[documentType]
        ? documentType.toLowerCase().replace(/ /g, "_")
        : "default_template"
      const templateText = getAustralianTemplate(templateKey)

      // Basic placeholder replacement fallback
      documentText = templateText
        .replace(/\[Your Name\]/g, customerName || "[Your Name]")
        .replace(/\[Mechanic Business Name\]/g, mechanicName || "[Mechanic Business Name]")
        .replace(/\[Vehicle Make\]/g, vehicleDetails.split(" ")[1] || "[Vehicle Make]")
        .replace(/\[Vehicle Model\]/g, vehicleDetails.split(" ")[2] || "[Vehicle Model]")
        .replace(/\[Vehicle Year\]/g, vehicleDetails.split(" ")[0] || "[Vehicle Year]")
        .replace(/\[Vehicle Registration\]/g, vehicleDetails.split("Rego: ")[1] || "[Vehicle Registration]")
        .replace(/\[Service Date\]/g, serviceDate || "[Service Date]")
        .replace(/\[Damage Description\]/g, damageDescription || "[Damage Description]")
        .replace(/\[Repair Cost\]/g, repairCost || "[Repair Cost]")
        .replace(/\[State, e.g., Victoria\]/g, state || "[State]")
        .replace(/\[Date\]/g, new Date().toLocaleDateString("en-AU"))
    }

    // Generate a unique ID for the document
    const uniqueId = uuidv4().substring(0, 8)
    const filename = `au_${documentType}_${uniqueId}`

    // Return the generated document
    return {
      success: true,
      documentText,
      filename,
      documentType: AU_DOCUMENT_TYPES[documentType] || "Australian Legal Document",
      customerName,
      mechanicName,
    }
  } catch (error) {
    console.error("Australian document generation error:", error)
    throw new Error(`Failed to generate Australian document: ${error.message}`)
  }
}
