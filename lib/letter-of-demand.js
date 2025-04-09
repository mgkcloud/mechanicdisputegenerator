/**
 * Letter of demand generator for mechanic disputes
 */
import { v4 as uuidv4 } from "uuid"
import { getAustralianTemplate } from "./australian-templates"

/**
 * Generate a letter of demand for mechanic disputes
 * @param {Object} formData - Form data from the request
 * @returns {Promise<Object>} - Generated letter of demand
 */
export async function generateLetterOfDemand(formData) {
  try {
    // Extract form data specific to mechanic disputes
    const customerName = formData.customer_name
    const customerAddress = formData.customer_address
    const customerPhone = formData.customer_phone
    const customerEmail = formData.customer_email

    const mechanicName = formData.mechanic_name
    const mechanicAddress = formData.mechanic_address
    const mechanicABN = formData.mechanic_abn || "Not provided"

    const vehicleMake = formData.vehicle_make
    const vehicleModel = formData.vehicle_model
    const vehicleYear = formData.vehicle_year
    const vehicleRego = formData.vehicle_rego

    const serviceDate = formData.service_date
    const damageDescription = formData.damage_description
    const repairCost = formData.repair_cost
    const paymentMethod = formData.payment_method
    const serviceInvoiceNumber = formData.invoice_number

    const photoEvidence = formData.photo_evidence === "yes"
    const independentQuote = formData.independent_quote === "yes"
    const insuranceClaim = formData.insurance_claim === "yes"
    const insuranceExcess = formData.insurance_excess || ""
    const insuranceClaimNumber = formData.insurance_claim_number || ""

    const responseDeadline = formData.response_deadline || "7 days"

    // Create a specialized prompt for the letter of demand
    const prompt = `Generate a formal Letter of Demand to a mechanic in Australia regarding vehicle damage that occurred during servicing.

**Customer Information:**
Name: ${customerName}
Address: ${customerAddress}
Phone: ${customerPhone}
Email: ${customerEmail}

**Mechanic Information:**
Business Name: ${mechanicName}
Address: ${mechanicAddress}
ABN: ${mechanicABN}

**Vehicle Details:**
Make: ${vehicleMake}
Model: ${vehicleModel}
Year: ${vehicleYear}
Registration: ${vehicleRego}

**Incident Details:**
Service Date: ${serviceDate}
Service Invoice Number: ${serviceInvoiceNumber}
Damage Description: ${damageDescription}
Repair Cost Estimate: ${repairCost}
Payment Method Used: ${paymentMethod}
Photo Evidence Available: ${photoEvidence ? "Yes" : "No"}
Independent Quote Obtained: ${independentQuote ? "Yes" : "No"}
Insurance Claim Filed: ${insuranceClaim ? "Yes" : "No"}
${insuranceClaim ? `Insurance Excess Amount: ${insuranceExcess}` : ""}
${insuranceClaim ? `Insurance Claim Number: ${insuranceClaimNumber}` : ""}

**Letter Requirements:**
1. Format as a formal legal letter with proper letterhead, date, and reference line
2. Begin with a clear statement that this is a Letter of Demand
3. Include a factual timeline of events (vehicle drop-off, damage discovery)
4. Reference the Australian Consumer Law (ACL) which requires services to be provided with due care and skill
5. Emphasize that under the ACL, a service provider must take all necessary care to avoid loss or damage to the consumer's property
6. State that by damaging the vehicle, the mechanic failed to meet this guarantee
7. Clearly state that the customer is NOT willing to sign any release of future claims or non-disparagement agreement
8. Demand a specific remedy: full compensation for the damage (either the repair cost or insurance excess)
9. Set a deadline of ${responseDeadline} for response
10. State that if no satisfactory response is received by the deadline, the matter will be escalated to Consumer Affairs Victoria and potentially to VCAT
11. Maintain a firm but professional tone throughout
12. Include a signature block at the end

Format the letter professionally with appropriate sections and legal language. Make it clear, concise, and legally sound under Australian consumer protection laws.`

    // Call OpenAI API
    let letterText
    try {
      // Call to OpenAI API
      const openaiApiKey = process.env.OPENAI_API_KEY
      if (!openaiApiKey) {
        throw new Error("OpenAI API key not configured")
      }

      console.log("Calling OpenAI API for letter of demand generation...")

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openaiApiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content:
                "You are an Australian legal document generator specializing in consumer disputes with mechanics. You create professional, legally-sound letters of demand that reference Australian Consumer Law and protect consumer rights in Victoria.",
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

      letterText = data.choices[0].message.content

      // Validate and clean the response text
      if (typeof letterText !== "string" || letterText.trim().length === 0) {
        throw new Error("Empty or invalid letter text received from OpenAI")
      }

      // Sanitize the generated text
      letterText = letterText.replace(/[\x00-\x09\x0B\x0C\x0E-\x1F\x7F]/g, "")
    } catch (apiError) {
      console.error("OpenAI API Error:", apiError)

      // Fallback to template if API fails
      console.log("Falling back to template due to API error")

      // Get letter of demand template
      const templateText = getAustralianTemplate("letter_of_demand")

      // Basic replacement using string replacement
      letterText = templateText
        .replace(/\[Your Name\]/g, customerName)
        .replace(/\[Your Address\]/g, customerAddress || "[Your Address]")
        .replace(/\[Your Phone\]/g, customerPhone || "[Your Phone]")
        .replace(/\[Your Email\]/g, customerEmail || "[Your Email]")
        .replace(/\[Date\]/g, new Date().toLocaleDateString("en-AU"))
        .replace(/\[Mechanic Business Name\]/g, mechanicName)
        .replace(/\[Mechanic Address\]/g, mechanicAddress || "[Mechanic Address]")
        .replace(/\[Mechanic ABN\]/g, mechanicABN || "[Mechanic ABN]")
        .replace(/\[Vehicle Make\]/g, vehicleMake)
        .replace(/\[Vehicle Model\]/g, vehicleModel)
        .replace(/\[Vehicle Year\]/g, vehicleYear)
        .replace(/\[Vehicle Registration\]/g, vehicleRego || "[Vehicle Registration]")
        .replace(/\[Service Date\]/g, serviceDate || "[Service Date]")
        .replace(/\[Damage Description\]/g, damageDescription || "[Damage Description]")
        .replace(/\[Repair Cost\]/g, repairCost || "[Repair Cost]")
        .replace(/\[Response Deadline\]/g, responseDeadline)
        .replace(
          /\[Response Deadline Date\]/g,
          (() => {
            const days = Number.parseInt(responseDeadline)
            if (isNaN(days)) return "[Response Deadline Date]"
            const date = new Date()
            date.setDate(date.getDate() + days)
            return date.toLocaleDateString("en-AU")
          })(),
        )
    }

    // Generate a unique ID for the letter
    const uniqueId = uuidv4().substring(0, 8)
    const filename = `letter_of_demand_${uniqueId}`

    // Return the generated letter
    return {
      success: true,
      letterText,
      filename,
      customerName,
      mechanicName,
      generatedDate: new Date().toISOString(),
      documentType: "Letter of Demand to Mechanic",
    }
  } catch (error) {
    console.error("Letter of demand generation error:", error)
    throw new Error(`Failed to generate letter of demand: ${error.message}`)
  }
}
