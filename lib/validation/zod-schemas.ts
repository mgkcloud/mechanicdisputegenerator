import { z } from 'zod';

// --- Reusable Base Schemas ---

const SenderInfoSchema = z.object({
    name: z.string().min(1, { message: "Sender name is required" }),
    address: z.string().optional(),
    email: z.string().email({ message: "Invalid email format" }).min(1, { message: "Sender email is required"}),
    phone: z.string().optional(),
});

const RecipientInfoSchema = z.object({
    name: z.string().min(1, { message: "Mechanic name is required" }),
    address: z.string().min(1, { message: "Mechanic address is required" }), // Make address required
    abn: z.string().optional(),
});

// We receive vehicle_details as a string, parsing happens before validation usually
// If validation happens on the parsed object, use this:
/*
const VehicleDetailsSchema = z.object({
    year: z.string().optional(), // Could add .regex(/^\d{4}$/) if format is strict
    make: z.string().min(1, { message: "Vehicle make is required" }),
    model: z.string().min(1, { message: "Vehicle model is required" }),
    registration: z.string().min(1, { message: "Vehicle registration is required" }),
});
*/

const TimelineEventSchema = z.object({
    timestamp: z.string().optional(), // Keeping as string for flexibility
    description: z.string().min(1, { message: "Timeline event description cannot be empty" })
});

const InsuranceDetailsSchema = z.object({
    insurer: z.string().optional(),
    claimNumber: z.string().optional(),
    // Use preprocess to convert empty string/null to undefined before number validation
    excessAmount: z.preprocess(
        (val) => (val === '' || val === null || val === undefined) ? undefined : Number(val),
        z.number().positive({ message: "Excess amount must be a positive number" }).optional()
    ),
});

const RemedyDetailsSchema = z.object({
    demandType: z.enum(['fullRepairCost', 'excessReimbursement', 'other'], { required_error: "Please select a demand type"}),
    // Use preprocess for amount as well
    demandAmount: z.preprocess(
        (val) => (val === '' || val === null || val === undefined) ? undefined : Number(val),
        z.number().positive({ message: "Claimed amount must be a positive number" })
    ),
    alternativeRemedyOffered: z.string().optional(),
    insuranceDetails: InsuranceDetailsSchema.optional(), // Optional object itself
    demandOtherDetails: z.string().optional(),
}).refine(data => {
    // If demandType is 'other', demandOtherDetails must be provided
    if (data.demandType === 'other') {
        return typeof data.demandOtherDetails === 'string' && data.demandOtherDetails.trim().length > 0;
    }
    return true;
}, {
    message: "Please specify details for the 'Other' remedy type",
    path: ['demandOtherDetails'], // Path of the error
}).refine(data => {
    // If demandType is 'excessReimbursement', insurance details (at least excessAmount) should ideally be present
    // This is a softer check, adjust as needed
    if (data.demandType === 'excessReimbursement') {
        return data.insuranceDetails?.excessAmount !== undefined && data.insuranceDetails.excessAmount > 0;
    }
    return true;
}, {
    message: "Please provide valid insurance excess details for excess reimbursement",
    path: ['insuranceDetails', 'excessAmount'],
});

const EscalationDetailsSchema = z.object({
    // Preprocess to handle empty string from input
    responseDeadlineDays: z.preprocess(
        (val) => (val === '' || val === null || val === undefined) ? undefined : parseInt(String(val), 10),
        z.number().int().min(5, { message: "Deadline must be at least 5 days"}).max(30, { message: "Deadline cannot exceed 30 days"})
    ),
    escalationBody: z.string().min(1, { message: "Please select an escalation body" }),
    paymentMadeUnderProtest: z.boolean().optional().default(false),
    // calculatedResponseDate is derived data, not validated here
});

// --- Main Input Schema --- 

// This schema validates the structure expected from the *combined* frontend form data
export const LetterOfDemandInputSchema = z.object({
    document_type: z.literal('letter_of_demand'),
    state: z.string().min(2, { message: "State is required" }),
    // Raw vehicle details string from form
    vehicle_details: z.string().min(5, { message: "Vehicle details are required (e.g., Year Make Model, Rego XXXYYY)"}),
    service_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Valid service date is required" }),
    incident_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Valid incident date required" }).optional(),
    damage_description: z.string().min(10, { message: "Damage description is required (min 10 characters)" }),
    acknowledged_damage_description: z.string().optional(),
    pre_service_evidence_available: z.boolean().optional().default(false),
    previous_communication_summary: z.string().optional(),
    // Timeline events array (optional, not currently in form but planned)
    timelineEvents: z.array(TimelineEventSchema).optional().default([]), 

    // Keep old fields temporarily? Validate them if they exist?
    // Or refine them out here?
    repair_cost: z.string().optional(), 
    insurance_claim: z.enum(['yes', 'no']).optional(),
    insurance_excess: z.string().optional(),
    insurance_claim_number: z.string().optional(),

    // Base Info Objects
    senderInfo: SenderInfoSchema, // Directly include or define inline
    recipientInfo: RecipientInfoSchema, // Directly include or define inline

    // Nested Detail Objects
    remedyDetails: RemedyDetailsSchema,
    escalationDetails: EscalationDetailsSchema,

}).transform(data => ({
    // Perform transformations *after* validation if needed
    ...data,
    // Example: Ensure incident_date defaults to service_date if empty
    incident_date: data.incident_date || data.service_date,
}));


// Infer the TypeScript type from the schema
export type LetterOfDemandInput = z.infer<typeof LetterOfDemandInputSchema>;

// --- (Optional) Output Schema ---

// If you want to validate the final data structure *before* it goes to the template
// you could define an output schema here. It would include the AI-generated fields.
/*
export const LetterOfDemandOutputSchema = z.object({
    documentType: z.literal('letter_of_demand'),
    state: z.string(),
    senderInfo: SenderInfoSchema, 
    recipientInfo: RecipientInfoSchema,
    vehicleDetails: VehicleDetailsSchema, // Use parsed version here
    incidentDetails: z.object({
        serviceDate: z.string(),
        incidentDate: z.string(),
        disputedDamageDescription: z.string(),
        acknowledgedDamageDescription: z.string().optional(),
        preServiceEvidenceAvailable: z.boolean().optional(),
        timelineEvents: z.array(TimelineEventSchema).optional(),
        previousCommunicationSummary: z.string().optional(),
        // Potentially add calculatedResponseDate if it belongs here
        calculatedResponseDate: z.string().optional()
    }),
    remedyDetails: RemedyDetailsSchema, 
    escalationDetails: EscalationDetailsSchema,
    metadata: z.object({
        generatedDate: z.string().datetime(),
        schemaVersion: z.string(),
    }),
    // Add AI generated sections
    legalBasis: z.object({ 
        summaryText: z.string().min(1)
    }).optional(), // Optional because generation might fail
    incidentNarrative: z.object({
        text: z.string().min(1)
    }).optional(),
    remedyStatement: z.object({
        text: z.string().min(1),
        summaryDemand: z.string().min(1)
    }).optional(),
    escalationText: z.object({
        text: z.string().min(1)
    }).optional(),
});

export type LetterOfDemandOutput = z.infer<typeof LetterOfDemandOutputSchema>;
*/ 