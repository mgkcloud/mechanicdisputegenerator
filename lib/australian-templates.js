/**
 * Australian legal templates for mechanic disputes
 */

// Document templates
export const AUSTRALIAN_TEMPLATES = {
  // Fallback template for any unknown document type
  default_template: `
[Your Name]
[Your Address]
[Your Phone]
[Your Email]

[Date]

[Mechanic Business Name]
[Mechanic Address]
[Mechanic ABN]

Dear Sir/Madam,

RE: Mechanic Dispute - Vehicle Damage Claim

I am writing regarding damage to my vehicle that occurred while it was in your care for servicing.

**Vehicle Details:**
Make: [Vehicle Make]
Model: [Vehicle Model]
Year: [Vehicle Year]
Registration: [Vehicle Registration]

**Incident Details:**
On [Service Date], I brought my vehicle to your workshop for servicing. When I collected the vehicle, I discovered damage that was not present when I left the vehicle in your care.

The damage consists of [Damage Description].

**Legal Position:**
Under Australian Consumer Law, services must be provided with due care and skill. By damaging my vehicle, you have failed to meet this guarantee.

**Demand:**
I request that you pay the full cost of repairing the damage, amounting to $[Repair Cost], within [Response Deadline] days of this letter.

If I do not receive a satisfactory response by [Response Deadline Date], I will consider escalating this matter through appropriate channels.

Yours faithfully,

[Your Name]
`,

  // Letter of Demand template - Enhanced Version
  letter_of_demand: `
[Your Name]
[Your Address]
[Your Phone]
[Your Email]

[Date]

[Mechanic Business Name]
[Mechanic Address]
[Mechanic ABN]

**VIA EMAIL AND REGISTERED POST** 

**RE: LETTER OF DEMAND – Damage to Vehicle [Vehicle Registration] During Service on [Service Date]**

Dear Sir/Madam,

I am writing to formally demand compensation for significant damage caused to my vehicle, a [Vehicle Year] [Vehicle Make] [Vehicle Model] (Registration: [Vehicle Registration]), while it was in the care of your workshop for service on [Service Date].

**Background:**
I entrusted my vehicle to your business for [Service Description] on [Service Date]. Upon collection on [Collection Date/Time], I immediately identified new damage to the [Damage Location(s)] which was not present when I delivered the vehicle. 
[Optional: Add brief timeline summary if complex, e.g., "Your staff member [Staff Name, if known] acknowledged causing the [Specific part, e.g., rear] damage... However, responsibility for the [Other part, e.g., front] damage was denied..."]

**Evidence:**
The damage consists of [Detailed Damage Description].
I have photographic evidence clearly showing the vehicle's undamaged condition prior to the service and the new damage present upon collection. 
[Optional: Mention other evidence]
  - I have obtained an independent repair quote from [Repair Shop Name] for $[Repair Cost].
  - My insurer, [Insurance Company Name], has been notified (Claim #[Insurance Claim Number]). The applicable excess is $[Insurance Excess].

**Legal Liability:**
Under Australian law, particularly the Australian Consumer Law (ACL) which applies in [State, e.g., Victoria], you have a legal obligation to provide services with due care and skill. This includes taking all necessary care to prevent loss or damage to my property while it is in your possession. 
Furthermore, under the principles of bailment, as the bailee holding my vehicle for reward, you owe a duty of care. The law presumes you are liable for damage occurring in your custody unless you can prove you took reasonable care, which has not been demonstrated.
The damage to my vehicle is a direct result of a breach of these obligations.

[Optional: Include if payment was made under protest]
**Payment Under Protest:**
Please note that the service invoice ([Invoice Number]) for $[Service Cost] was paid on [Payment Date] **under protest**. This payment was made solely to secure the release of my vehicle and does not constitute acceptance of the service quality or waiver of my rights regarding the damage caused.

**Demand for Remedy:**
I demand that you take immediate responsibility for the damage caused. To resolve this matter, you must either:
1.  **Arrange and cover the full cost of repairs** for all damage ([Damage Location(s)]) at a reputable repairer agreed upon by us, restoring the vehicle to its pre-service condition. OR
2.  **Reimburse me for the full repair cost** of $[Repair Cost] as quoted by [Repair Shop Name]. OR
3.  **If proceeding via my insurance:** Formally accept full liability in writing to my insurer ([Insurance Company Name], Claim #[Insurance Claim Number]) and reimburse me for the insurance excess of $[Insurance Excess]. Acknowledgment of liability is required to prevent adverse impacts on my insurance record and future premiums.

I require your written confirmation of how you will remedy this situation within **[Response Deadline, e.g., 10 business days]** from the date of this letter (i.e., by [Response Deadline Date]).

Please be advised that I am **not** willing to sign any release agreement that waives future claims or includes a non-disparagement clause as a condition of receiving the compensation I am legally entitled to.

**Failure to Comply:**
If I do not receive a satisfactory response and commitment to rectify the damage by [Response Deadline Date], I will escalate this matter without further notice. This will include lodging a formal complaint with Consumer Affairs Victoria and initiating legal proceedings against [Mechanic Business Name] in the Victorian Civil and Administrative Tribunal (VCAT) to recover all losses, including repair costs, insurance excess, potential increases in premiums, and associated costs.

I trust this matter can be resolved amicably and promptly.

Yours faithfully,


______________________
[Your Name]
Owner of Vehicle [Vehicle Registration]
  `,

  // Consumer Affairs Victoria complaint template
  consumer_complaint: `
**CONSUMER AFFAIRS VICTORIA COMPLAINT**

**Consumer Details:**
Name: [Your Name]
Address: [Your Address]
Phone: [Your Phone]
Email: [Your Email]

**Trader Details:**
Business Name: [Mechanic Business Name]
Address: [Mechanic Address]
ABN: [Mechanic ABN]
Phone: [Mechanic Phone]
Email: [Mechanic Email]

**Complaint Details:**

**Product/Service:**
Vehicle servicing provided on [Service Date]

**Vehicle Details:**
Make: [Vehicle Make]
Model: [Vehicle Model]
Year: [Vehicle Year]
Registration: [Vehicle Registration]

**Description of Issue:**
I brought my vehicle to [Mechanic Business Name] for servicing on [Service Date]. When I collected the vehicle, I discovered damage to [Damage Location] that was not present when I left the vehicle in their care.

The damage consists of [Damage Description].

**Steps Taken to Resolve:**
1. I immediately notified the business of the damage on [Notification Date].
2. I sent a formal letter of demand on [Letter Date] requesting compensation for the repair costs.
3. The business [describe their response or lack thereof].
4. I have obtained an independent repair quote of $[Repair Cost] from [Repair Shop Name].

**Evidence Available:**
- Photos of the damage
- Service invoice
- Independent repair quote
- Copy of letter of demand
- [Any other evidence]

**Desired Outcome:**
I am seeking full compensation for the repair costs of $[Repair Cost] without having to sign any release of future claims or non-disparagement agreement.

I believe the business has breached the Australian Consumer Law by failing to provide services with due care and skill, resulting in damage to my vehicle.

I authorize Consumer Affairs Victoria to contact the trader on my behalf to attempt to resolve this dispute.

[Your Name]
[Date]
  `,

  // VCAT application guidance template
  vcat_application: `
**VCAT APPLICATION GUIDANCE**

**Case Type:**
Consumer and trader dispute under the Australian Consumer Law

**Tribunal:**
Victorian Civil and Administrative Tribunal (VCAT)

**Applicant Details:**
[Your full legal name and contact details]

**Respondent Details:**
[Full legal business name of the mechanic]
[Complete business address]
[ABN/ACN if available]

**Claim Amount:**
$[Total amount claimed] - This should be the repair cost or your insurance excess

**Claim Details:**

**What Happened:**
On [Service Date], I took my [Vehicle Make/Model/Year] to [Mechanic Business Name] for servicing. When I collected the vehicle, I discovered damage to [Damage Location] that was not present when I left the vehicle in their care.

The damage consists of [Damage Description].

I have obtained a repair quote of $[Repair Cost] from [Repair Shop Name].

**Legal Basis for Claim:**
Under the Australian Consumer Law (ACL), services must be provided with due care and skill. This is a consumer guarantee that cannot be excluded. The ACL requires that a service provider must take all necessary care to avoid loss or damage to the consumer's property.

By damaging my vehicle while it was in their care, [Mechanic Business Name] has failed to meet this guarantee.

**Steps Taken to Resolve:**
1. I immediately notified the business of the damage on [Notification Date].
2. I sent a formal letter of demand on [Letter Date] requesting compensation for the repair costs.
3. I filed a complaint with Consumer Affairs Victoria on [CAV Complaint Date].
4. [Describe any other steps taken]

**Evidence to Bring to Hearing:**
- Photos of the damage
- Service invoice and proof of payment
- Independent repair quote
- Copy of letter of demand
- Consumer Affairs Victoria complaint reference
- Timeline of events
- Any admission of liability from the mechanic
- Insurance claim details (if applicable)

**What to Expect at VCAT:**
1. The hearing will be relatively informal
2. You will present your case first, then the mechanic will respond
3. The VCAT member may ask questions of both parties
4. Bring three copies of all documents (one for you, one for the mechanic, one for VCAT)
5. Speak clearly and stick to the facts
6. Focus on how the mechanic breached the consumer guarantee of due care and skill

**Possible Outcomes:**
If successful, VCAT may order the mechanic to pay you compensation for the repair costs. If unsuccessful, you may be required to pay the mechanic's filing fee.

**Filing Fee:**
For claims up to $3,000: approximately $72
For claims up to $15,000: approximately $240

**Time Limit:**
Applications must generally be made within 6 years of the incident, but it's best to file as soon as possible.
  `,

  // Insurance claim support letter template
  insurance_claim: `
[Your Name]
[Your Address]
[Your Phone]
[Your Email]

[Date]

[Insurance Company Name]
[Insurance Company Address]

RE: Insurance Claim #[Claim Number] - Vehicle Damage During Mechanic Service

Dear Claims Handler,

I am writing regarding my insurance claim for damage to my vehicle that occurred while it was being serviced by [Mechanic Business Name] on [Service Date].

**Vehicle Details:**
Make: [Vehicle Make]
Model: [Vehicle Model]
Year: [Vehicle Year]
Registration: [Vehicle Registration]
Policy Number: [Insurance Policy Number]

**Incident Details:**
On [Service Date], I brought my vehicle to [Mechanic Business Name] for servicing. When I collected the vehicle, I discovered damage to [Damage Location] that was not present when I left the vehicle in their care.

The damage consists of [Damage Description].

**Mechanic Liability:**
Under the Australian Consumer Law, the mechanic is liable for damage caused to my vehicle while it was in their care. Services must be provided with due care and skill, and the mechanic failed to meet this guarantee.

I have notified the mechanic of their liability and have sent them a formal letter of demand. [Include details of their response if applicable]

**Request:**
I understand that under my insurance policy, I am required to pay an excess of $[Excess Amount]. However, as the damage was caused by a third party who is liable under Australian Consumer Law, I request that:

1. The insurance company pursue the mechanic for recovery of all costs associated with this claim, including my excess
2. My no-claims bonus/rating be preserved as this incident was not my fault

**Evidence:**
I have attached the following documents to support my claim:
- Photos of the damage
- Service invoice from the mechanic
- Copy of my letter of demand to the mechanic
- Independent repair quote
- [Any other relevant documents]

Please advise if you require any additional information to process this claim and pursue recovery from the liable mechanic.

Thank you for your assistance in this matter.

Yours sincerely,

[Your Name]
  `,
}

// Template mapping for document types
const TEMPLATE_MAPPING = {
  letter_of_demand: "letter_of_demand",
  consumer_complaint: "consumer_complaint",
  vcat_application: "vcat_application",
  insurance_claim: "insurance_claim",
}

/**
 * Get a specific Australian legal template
 * @param {string} documentType - Document type from the form
 * @returns {string} - Template content
 */
export function getAustralianTemplate(documentType) {
  try {
    // Clean up the documentType parameter
    const cleanDocType = typeof documentType === "string" ? documentType.trim().toLowerCase() : "default_template"

    // Map the document type to the template key
    const templateKey = TEMPLATE_MAPPING[cleanDocType] || cleanDocType

    // Get the template or use the default template if not found
    let template = AUSTRALIAN_TEMPLATES[templateKey] || AUSTRALIAN_TEMPLATES["default_template"]

    // If we still don't have a template, use a basic fallback
    if (!template) {
      console.error(`Template not found for document type: ${cleanDocType}, mapped to key: ${templateKey}`)
      return "Template not found. Please try a different document type."
    }

    // Clean the template text - remove any control characters
    template = template.replace(/[\x00-\x09\x0B\x0C\x0E-\x1F\x7F]/g, "")

    // Fix repeating date patterns that might appear
    template = template.replace(/(\d{1,2}\/\d{1,2}\/\d{4}){2,}/g, (match) => {
      return match.substring(0, 10) // Keep only the first date
    })

    // Fix any other date-like patterns that look corrupted
    template = template.replace(/\d{4}-\d{2}-\d{2}\d+/g, (match) => {
      return match.substring(0, 10) // Keep only the first 10 chars of date
    })

    // Remove any other suspicious repeating patterns
    template = template.replace(/(y\d{1,2}\/\d{1,2}\/\d{4}){2,}/g, (match) => {
      return match.substring(0, match.length / 2) // Keep only half to break the pattern
    })

    // Sanitize the template against bad patterns
    template = template.replace(/(\d{2,}){3,}/g, "") // Remove long repeating number sequences

    return template
  } catch (error) {
    console.error("Error in getAustralianTemplate:", error)
    return `An error occurred while retrieving the template. Please try again.

[Your Name]
[Your Address]

Dear Sir/Madam,

RE: Mechanic Dispute

I am writing regarding damage to my vehicle that occurred while it was in your care for servicing.

Yours faithfully,
[Your Name]`
  }
}

/**
 * Get all available Australian legal templates
 * @returns {Object} - All templates
 */
export function getAllAustralianTemplates() {
  return AUSTRALIAN_TEMPLATES
}
