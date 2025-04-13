// Remove obsolete import
// import { validateAgainstSchema } from '../validation/schema-validator.js';

// Placeholder imports - These functions will be implemented in other tasks/files
// Assume ai-generation-service exports these async functions
import { 
    generateLegalBasisSection, 
    generateIncidentNarrativeSection, 
    generateRemedySection, 
    generateEscalationSection,
    // Add other AI generators as needed (e.g., for consumer complaints)
} from './ai-generation-service.js'; // This file needs to be created (Task 2.2)

// Helper function to safely access nested properties
const getSafe = (obj, path, defaultValue = undefined) => {
    return path.split('.').reduce((acc, key) => (acc && acc[key] !== undefined && acc[key] !== null) ? acc[key] : defaultValue, obj);
};

// Helper function to parse vehicle details string
// Basic parsing - assumes "Year Make Model, Rego: REGISTRATION" format or similar
// Can be made more robust
function parseVehicleDetails(detailsString) {
    if (!detailsString) return { year: '', make: '', model: '', registration: '' };

    let year = '', make = '', model = '', registration = '';
    const regoMatch = detailsString.match(/(?:Rego|Registration)[:\s]+([\w\d]+)/i);
    if (regoMatch) {
        registration = regoMatch[1].trim();
        // Remove the rego part for easier parsing of the rest
        detailsString = detailsString.replace(regoMatch[0], '').trim();
    }

    const parts = detailsString.split(/,|\s+/).filter(Boolean); // Split by comma or space
    if (parts.length > 0) {
        // Check if the first part looks like a year (4 digits)
        if (/^\d{4}$/.test(parts[0])) {
            year = parts.shift();
        }
    }
    if (parts.length > 0) make = parts.shift(); // Assume next is make
    if (parts.length > 0) model = parts.join(' '); // Assume rest is model

    return { year, make, model, registration };
}

/**
 * Creates the base document data structure from raw form data.
 * Performs necessary mappings, parsing, and sets defaults.
 * @param {object} formData - The aggregated raw form data from all steps.
 * @param {string} documentType - The type of document (e.g., 'letter_of_demand').
 * @returns {object} - The structured base data object ready for AI generation context.
 */
function createBaseDocumentData(formData, documentType) {
    console.log('Creating base document data from formData:', formData);

    // Parse vehicle details
    const { year, make, model, registration } = parseVehicleDetails(formData.vehicle_details);

    // Map form data to base schema structure, using safe access and defaults
    const baseData = {
        documentType: documentType,
        state: getSafe(formData, 'state', 'VIC'), // Default to VIC if missing
        senderInfo: {
            name: getSafe(formData, 'customer_name', 'Customer Name Missing'),
            address: getSafe(formData, 'customer_address', ''),
            email: getSafe(formData, 'customer_email', ''),
            phone: getSafe(formData, 'customer_phone', '')
        },
        recipientInfo: {
            name: getSafe(formData, 'mechanic_name', 'Mechanic Name Missing'),
            address: getSafe(formData, 'mechanic_address', ''),
            abn: getSafe(formData, 'mechanic_abn', '')
        },
        vehicleDetails: {
            year: year,
            make: make,
            model: model,
            registration: registration
        },
        incidentDetails: {
            serviceDate: getSafe(formData, 'service_date', ''),
            incidentDate: getSafe(formData, 'incident_date', getSafe(formData, 'service_date', '')), // Default to service date if missing
            disputedDamageDescription: getSafe(formData, 'damage_description', 'Damage details not provided.'), // Map from form field name
            acknowledgedDamageDescription: getSafe(formData, 'acknowledged_damage_description', 'None specified'),
            preServiceEvidenceAvailable: getSafe(formData, 'pre_service_evidence_available', false),
            timelineEvents: getSafe(formData, 'timelineEvents', []), // Expects an array
            previousCommunicationSummary: getSafe(formData, 'previous_communication_summary', ''),
        },
        // Safely access nested remedyDetails object
        remedyDetails: {
            demandType: getSafe(formData, 'remedyDetails.demandType', 'other'), // Default if missing
            demandAmount: parseFloat(getSafe(formData, 'remedyDetails.demandAmount', 0)) || 0, // Ensure number
            alternativeRemedyOffered: getSafe(formData, 'remedyDetails.alternativeRemedyOffered', ''),
            // Map insurance details from potential flat structure or nested
            insuranceDetails: {
                insurer: getSafe(formData, 'remedyDetails.insuranceDetails.insurer', getSafe(formData, 'insurance_insurer', '')), // Allow flat backup
                claimNumber: getSafe(formData, 'remedyDetails.insuranceDetails.claimNumber', getSafe(formData, 'insurance_claim_number', '')), // Map from form
                excessAmount: parseFloat(getSafe(formData, 'remedyDetails.insuranceDetails.excessAmount', getSafe(formData, 'insurance_excess', 0))) || 0 // Map from form
            },
            demandOtherDetails: getSafe(formData, 'remedyDetails.demand_other_details', getSafe(formData, 'demand_other_details', '')) // Allow flat backup
        },
         // Safely access nested escalationDetails object
        escalationDetails: {
            responseDeadlineDays: parseInt(getSafe(formData, 'escalationDetails.responseDeadlineDays', 14), 10) || 14, // Ensure integer
            // Use specific state tribunal or default generic text
            escalationBody: getSafe(formData, 'escalationDetails.escalationBody', 'the relevant state tribunal (e.g., VCAT, NCAT, QCAT)'),
            paymentMadeUnderProtest: getSafe(formData, 'escalationDetails.paymentMadeUnderProtest', false),
            // Calculate deadline date based on generation date and days
            // Note: This calculation should ideally happen closer to final output/templating
            // Or be passed explicitly in formData as 'calculatedResponseDate'
            calculatedResponseDate: getSafe(formData, 'calculatedResponseDate', '') // Expect pre-calculated date if available
        },
        metadata: {
            generatedDate: new Date().toISOString(),
            schemaVersion: "1.0.0" // TODO: Consider fetching dynamically or from schema
        },
        // Pass the original formData within baseData specifically for AI functions
        // This gives them access to ALL raw fields if needed for context,
        // without polluting the main structured baseData used for validation/templating.
        formData: formData
    };

    console.log('Constructed baseData:', baseData);
    return baseData;
}

/**
 * Orchestrates the generation of structured document data.
 * Fetches different sections (potentially via parallel AI calls) and assembles them.
 * Validates the final assembled data against the appropriate JSON schema.
 * 
 * @param {object} formData - The raw input data from the form.
 * @param {string} documentType - The type of document (e.g., 'letter_of_demand').
 * @returns {Promise<object>} - A promise that resolves to the complete, validated document data object.
 * @throws {Error} - If generation or validation fails critically.
 */
export async function generateDocumentData(formData, documentType) {
    console.log(`Starting document data generation for type: ${documentType}`);
    let baseData;
    try {
        // 1. Create base document data (synchronous part)
        // Note: createBaseDocumentData now includes the original formData nested within it
        // under the 'formData' key, specifically for AI context.
        baseData = createBaseDocumentData(formData, documentType);
        console.log('Base data created.');

        // 2. Define AI generation tasks based on document type
        let aiTasks = [];
        let sectionMap = [];

        // Configure AI tasks based on document type
        switch(documentType) {
            case 'letter_of_demand':
                sectionMap = ['legalBasis', 'incidentNarrative', 'remedyStatement', 'escalationText'];
                aiTasks = [
                    generateLegalBasisSection(baseData),      // Promise for legal basis
                    generateIncidentNarrativeSection(baseData),// Promise for incident narrative
                    generateRemedySection(baseData),         // Promise for remedy statement
                    generateEscalationSection(baseData)      // Promise for escalation text
                ];
                break;
                
            case 'consumer_complaint':
                // Consumer complaints use mostly the same sections but with different context
                sectionMap = ['legalBasis', 'incidentNarrative', 'remedyStatement'];
                aiTasks = [
                    generateLegalBasisSection({...baseData, contextType: 'consumer_complaint'}),
                    generateIncidentNarrativeSection({...baseData, contextType: 'consumer_complaint'}),
                    generateRemedySection({...baseData, contextType: 'consumer_complaint'})
                ];
                break;
                
            case 'vcat_application':
                // Tribunal applications need particular legal terminology
                sectionMap = ['legalBasis', 'incidentNarrative', 'remedyStatement', 'tribunalAdvice'];
                aiTasks = [
                    generateLegalBasisSection({...baseData, contextType: 'tribunal_application'}),
                    generateIncidentNarrativeSection({...baseData, contextType: 'tribunal_application'}),
                    generateRemedySection({...baseData, contextType: 'tribunal_application'}),
                    // This would be a new function needed in ai-generation-service.js
                    // For now, we'll handle without it and rely on the template's static content
                    // Future task: implement generateTribunalAdviceSection()
                ];
                break;
                
            case 'insurance_claim':
                // Insurance claims need specific insurance-oriented sections
                sectionMap = ['legalBasis', 'incidentNarrative', 'remedyStatement', 'insuranceAdvice'];
                aiTasks = [
                    generateLegalBasisSection({...baseData, contextType: 'insurance_claim'}),
                    generateIncidentNarrativeSection({...baseData, contextType: 'insurance_claim'}),
                    generateRemedySection({...baseData, contextType: 'insurance_claim'}),
                    // This would be a new function needed in ai-generation-service.js
                    // For now, we'll handle without it and rely on the template's static content
                    // Future task: implement generateInsuranceAdviceSection()
                ];
                break;
                
            default:
                throw new Error(`Unsupported document type for AI generation: ${documentType}`);
        }

        // 3. Execute AI generation tasks in parallel
        console.log(`Executing ${aiTasks.length} AI generation tasks in parallel...`);
        const results = await Promise.allSettled(aiTasks);
        console.log('AI generation tasks completed.');

        // 4. Process results and assemble complete data
        const generatedSections = {};
        let criticalFailure = false;
        results.forEach((result, index) => {
            // Map index back to a meaningful section name
            let sectionName = 'unknown_section';
            sectionName = sectionMap[index] || sectionName;

            if (result.status === 'fulfilled') {
                console.log(`${sectionName} generated successfully.`);
                // Merge the *contents* of the returned object into generatedSections
                // Assumes AI functions return { sectionKey: { data... } }
                // e.g., { legalBasis: { summaryText: '...' } }
                Object.assign(generatedSections, result.value);
            } else {
                console.error(`${sectionName} generation failed:`, result.reason);
                // Decide if this failure is critical. For now, assume all are.
                criticalFailure = true;
            }
        });

        // Special handling for tribunal applications and insurance claims
        // If we're missing the specialized sections because the functions don't exist yet,
        // add placeholder content so templates don't break
        if (documentType === 'vcat_application' && !generatedSections.tribunalAdvice) {
            generatedSections.tribunalAdvice = {
                text: 'For tribunal applications, ensure you bring three copies of all documents to the hearing and speak clearly.'
            };
        }
        
        if (documentType === 'insurance_claim' && !generatedSections.insuranceAdvice) {
            generatedSections.insuranceAdvice = {
                text: 'Ensure your insurance claim is supported by all available evidence and clearly references your policy details.'
            };
        }

        if (criticalFailure) {
            throw new Error('One or more critical document sections failed to generate.');
        }

        // Combine base data with successfully generated sections
        const completeData = { ...baseData, ...generatedSections };

        // Remove the temporary nested formData before final validation/return
        delete completeData.formData;

        console.log('Document data assembled. Proceeding to validation...');

        // 5. Validate complete data against the specific schema (REMOVED - Validation now happens in API route before calling this service)
        console.log('Skipping final internal validation as it was done in API route.');
        return completeData;

    } catch (error) {
        console.error("Error during document data generation process:", error);
        // Log or handle the specific error appropriately
        // Rethrowing allows the caller (e.g., the main worker handler) to manage the failure
        throw new Error(`Document generation failed: ${error.message}`);
    }
} 