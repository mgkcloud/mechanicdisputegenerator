import OpenAI from 'openai';

// Initialize OpenAI client with better error handling
let openai;
try {
  // Check if API key is available
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.warn('WARNING: OPENAI_API_KEY environment variable is not set. AI content generation will fail.');
  }
  
  openai = new OpenAI({
    apiKey: apiKey,
    // Default to 3 retries on rate limits
    maxRetries: 3,
  });
  console.log('OpenAI client initialized successfully');
} catch (error) {
  console.error('Failed to initialize OpenAI client:', error.message);
  // Create a stub client that will throw appropriate errors when used
  openai = {
    chat: {
      completions: {
        create: () => {
          throw new Error('OpenAI client failed to initialize. Check your API key and environment configuration.');
        }
      }
    }
  };
}

const DEFAULT_MODEL = "gpt-4o"; // Or fetch from env
const MAX_RETRIES = 2; // Or fetch from env

/**
 * Calls the OpenAI API with retry logic.
 * Enhanced with better error handling and reporting.
 * @param {object} params - Parameters for the OpenAI API call (model, messages, etc.)
 * @param {number} maxRetries - Maximum number of retries.
 * @returns {Promise<object>} - The OpenAI API response object.
 * @throws {Error} - If the API call fails after all retries.
 */
async function callOpenAIWithRetry(params, maxRetries = MAX_RETRIES) {
    let attempts = 0;
    while (attempts <= maxRetries) {
        try {
            console.log(`Attempt ${attempts + 1} to call OpenAI model ${params.model || DEFAULT_MODEL}...`);
            
            // Ensure JSON mode is requested if not already specified
            const apiParams = { 
                ...params,
                response_format: { type: "json_object" } 
            };
            
            const result = await openai.chat.completions.create(apiParams);
            
            // Basic check for response content
            if (!result.choices || result.choices.length === 0 || !result.choices[0].message || !result.choices[0].message.content) {
                throw new Error('OpenAI response is empty or malformed.');
            }
            
            console.log(`OpenAI call successful (Attempt ${attempts + 1}). Finish reason: ${result.choices[0].finish_reason}`);
            
            // Check finish reason - might be incomplete due to token limits
            if (result.choices[0].finish_reason === 'length') {
                 console.warn('OpenAI response might be truncated due to token limits.');
                 // Decide how to handle this - maybe throw an error or try to proceed?
                 // For now, let's allow proceeding but log warning.
            }

            return result;
        } catch (error) {
            attempts++;
            
            // Classify the error for better handling
            let errorType = 'UNKNOWN';
            let retryable = true;
            let errorDetail = error.message;
            
            // Check for specific OpenAI error types
            if (error.status === 429) {
                errorType = 'RATE_LIMIT';
            } else if (error.status >= 500) {
                errorType = 'SERVER_ERROR';
            } else if (error.status === 401 || error.status === 403) {
                errorType = 'AUTH_ERROR';
                retryable = false; // Don't retry auth errors
            } else if (error.name === 'SyntaxError') {
                errorType = 'PARSE_ERROR';
                errorDetail = 'Failed to parse OpenAI response as JSON'; 
            }
            
            console.error(`OpenAI API call failed (Attempt ${attempts}/${maxRetries + 1}):`, {
                errorType,
                message: error.message,
                status: error.status,
                retryable
            });
            
            if (!retryable || attempts > maxRetries) {
                console.error('Cannot retry OpenAI call. Failing.');
                throw new Error(`Failed to call OpenAI API (${errorType}): ${errorDetail}`);
            }
            
            // Improved exponential backoff with jitter
            const baseDelay = 1000 * Math.pow(2, attempts - 1); // 1s, 2s, 4s, ...
            const jitter = Math.random() * 500; // Add up to 500ms of random jitter
            const delay = baseDelay + jitter;
            
            console.log(`Waiting ${Math.round(delay)}ms before retry...`);
            await new Promise(r => setTimeout(r, delay));
        }
    }
}

/**
 * Generates the Legal Basis section using OpenAI.
 * @param {object} baseData - The base document data for context.
 * @returns {Promise<object>} - A promise resolving to the structured legal basis section (e.g., { legalBasis: { summaryText: '...' } }).
 * @throws {Error} - If generation or parsing fails.
 */
export async function generateLegalBasisSection(baseData) {
    console.log('Generating Legal Basis section...');
    // Access potentially nested formData if it was passed in baseData
    const formData = baseData.formData || {}; 
    const contextType = baseData.contextType || 'letter_of_demand';
    
    // Adjust prompt based on context type
    let contextualInstructions = '';
    let systemRole = "You are an expert Australian legal assistant specialized in consumer law and automotive disputes.";
    
    switch(contextType) {
        case 'consumer_complaint':
            contextualInstructions = "Focus on language appropriate for a consumer affairs complaint. Emphasize consumer guarantees under Australian Consumer Law and reference relevant consumer protection agencies.";
            break;
        case 'tribunal_application':
            contextualInstructions = "Use formal legal terminology suitable for a tribunal application. Reference relevant precedents and tribunal-specific language for the state jurisdiction.";
            systemRole = "You are an expert Australian legal assistant specializing in tribunal applications for consumer disputes.";
            break;
        case 'insurance_claim':
            contextualInstructions = "Focus on bailment principles and how they apply to insurance claims. Reference relevant sections of the Insurance Contracts Act where applicable.";
            systemRole = "You are an expert Australian legal assistant specializing in insurance law and consumer rights.";
            break;
        default: // letter_of_demand
            contextualInstructions = "The tone should be formal and assertive but not overly aggressive.";
            break;
    }
    
    const prompt = `Generate a concise legal basis paragraph for an Australian ${contextType.replace('_', ' ')} regarding vehicle damage that allegedly occurred while under a mechanic's care. The context is specific to the state/territory of ${baseData.state || 'Australia'}. Write from the perspective of the customer (${baseData.senderInfo.name}) to the mechanic (${baseData.recipientInfo.name}).

Context:
- Customer: ${baseData.senderInfo.name}
- Mechanic: ${baseData.recipientInfo.name}
- Alleged Damage: ${formData.disputed_damage_description || 'As detailed elsewhere in this letter'}
- Vehicle: ${baseData.vehicleDetails.year || ''} ${baseData.vehicleDetails.make} ${baseData.vehicleDetails.model} (${baseData.vehicleDetails.registration})
- State/Territory: ${baseData.state || 'VIC'}

The legal basis should reference:
1. Relevant guarantees under the Australian Consumer Law (ACL), specifically the guarantee that services will be rendered with due care and skill.
2. The mechanic's duty of care as a bailee for reward while the vehicle was in their possession.
3. Briefly mention the potential liability for damage caused due to negligence or failure to meet ACL guarantees.

Output Instructions:
- ${contextualInstructions}
- Aim for approximately 100-150 words.
- Respond ONLY with a valid JSON object containing a single key "legalBasis" which itself is an object with a single key "summaryText" containing the generated paragraph as a string value.
Example Format: { "legalBasis": { "summaryText": "Your generated paragraph here..." } }`;

    try {
        const result = await callOpenAIWithRetry({
            model: DEFAULT_MODEL,
            messages: [
                {
                    role: "system",
                    content: systemRole + " Generate precise JSON responses that exactly match the requested format. Adhere strictly to the output instructions."
                },
                { role: "user", content: prompt }
            ],
            temperature: 0.5, // Lower temperature for more deterministic legal text
            // max_tokens: 300 // Optional: Set a max token limit for the section
        });

        const content = result.choices[0].message.content;
        const sectionData = JSON.parse(content);

        // Basic validation: Check if the expected structure is present
        if (!sectionData || !sectionData.legalBasis || typeof sectionData.legalBasis.summaryText !== 'string' || sectionData.legalBasis.summaryText.trim() === '') {
            console.error('Invalid JSON structure received for Legal Basis:', content);
            throw new Error('Generated Legal Basis section has invalid structure or empty content.');
        }

        console.log('Legal Basis section generated successfully.');
        return sectionData; // Return the whole object { legalBasis: { summaryText: '...' } }

    } catch (error) {
        console.error('Error generating Legal Basis section:', error);
        // Propagate the error to be handled by the orchestrator
        throw new Error(`Failed to generate Legal Basis section: ${error.message}`);
    }
}

// --- Placeholder Stubs for other AI Generators --- 

export async function generateIncidentNarrativeSection(baseData) {
    console.log('Generating Incident Narrative section...');
    const formData = baseData.formData || {};
    // Construct timeline string if available
    let timelineString = "";
    if (formData.timelineEvents && formData.timelineEvents.length > 0) {
        timelineString = "Key events include:\\n" + formData.timelineEvents.map(event => 
            `- ${event.timestamp ? event.timestamp + ': ' : ''}${event.description}`
        ).join('\\n');
    } else {
        timelineString = "The sequence of events needs further detail, but the vehicle was brought in for service on " + baseData.incidentDetails.serviceDate + ".";
    }

    const prompt = `Generate a narrative describing the incident for an Australian Letter of Demand. The customer (${baseData.senderInfo.name}) alleges their vehicle (${baseData.vehicleDetails.make} ${baseData.vehicleDetails.model}) sustained damage while in the care of the mechanic (${baseData.recipientInfo.name}) on or around ${baseData.incidentDetails.serviceDate}.

Context:
- Customer: ${baseData.senderInfo.name}
- Mechanic: ${baseData.recipientInfo.name}
- Vehicle: ${baseData.vehicleDetails.year || ''} ${baseData.vehicleDetails.make} ${baseData.vehicleDetails.model} (${baseData.vehicleDetails.registration})
- Service Date: ${baseData.incidentDetails.serviceDate}
- Disputed Damage: ${formData.disputed_damage_description || 'Not specified'}
- Damage Acknowledged by Mechanic: ${formData.acknowledged_damage_description || 'None specified'}
- Timeline Summary: ${timelineString}
- Evidence of Pre-Service Condition Available: ${formData.pre_service_evidence_available ? 'Yes' : 'No'}

Instructions:
- Write a factual narrative from the customer's perspective.
- Focus on the timeline, the condition of the vehicle before service (if evidence available), the service performed, when the damage was noticed, and the nature of the disputed damage.
- Keep it concise and objective, approximately 150-250 words.
- Respond ONLY with a valid JSON object containing a single key "incidentNarrative" which itself is an object with a single key "text" containing the generated narrative as a string value.
Example Format: { "incidentNarrative": { "text": "Your generated narrative here..." } }`;

    try {
        const result = await callOpenAIWithRetry({
            model: DEFAULT_MODEL,
            messages: [
                {
                    role: "system",
                    content: "You are an expert Australian legal assistant. Generate precise JSON responses that exactly match the requested format. Focus on clear, factual narrative writing for legal correspondence."
                },
                { role: "user", content: prompt }
            ],
            temperature: 0.6, 
            // max_tokens: 400 // Optional: Set a max token limit
        });

        const content = result.choices[0].message.content;
        const sectionData = JSON.parse(content);

        // Basic validation
        if (!sectionData || !sectionData.incidentNarrative || typeof sectionData.incidentNarrative.text !== 'string' || sectionData.incidentNarrative.text.trim() === '') {
            console.error('Invalid JSON structure received for Incident Narrative:', content);
            throw new Error('Generated Incident Narrative section has invalid structure or empty content.');
        }

        console.log('Incident Narrative section generated successfully.');
        return sectionData;

    } catch (error) {
        console.error('Error generating Incident Narrative section:', error);
        throw new Error(`Failed to generate Incident Narrative section: ${error.message}`);
    }
}

export async function generateRemedySection(baseData) {
    console.log('Generating Remedy Section...');
    const formData = baseData.formData || {};
    const remedyDetails = formData.remedyDetails || {}; // Handle potential missing details
    const insuranceDetails = remedyDetails.insuranceDetails || {};

    let demandDescription = "";
    let summaryDemand = "compensation"; // Default summary

    switch(remedyDetails.demandType) {
        case 'excessReimbursement':
            demandDescription = `reimbursement of my insurance excess payment of $${remedyDetails.demandAmount || 'AMOUNT_MISSING'}. Details of my insurance claim (Insurer: ${insuranceDetails.insurer || 'N/A'}, Claim No: ${insuranceDetails.claimNumber || 'N/A'}, Excess: $${insuranceDetails.excessAmount || 'N/A'}) can be provided upon request.`;
            summaryDemand = `reimbursement of the insurance excess of $${remedyDetails.demandAmount || 'AMOUNT_MISSING'}`;
            break;
        case 'fullRepairCost':
            demandDescription = `payment for the full cost of repairs, estimated at $${remedyDetails.demandAmount || 'AMOUNT_MISSING'}, required to rectify the damage caused by your workshop. Quotes can be provided.`;
            summaryDemand = `payment for the full repair cost of $${remedyDetails.demandAmount || 'AMOUNT_MISSING'}`;
            break;
        case 'other':
            demandDescription = `compensation amounting to $${remedyDetails.demandAmount || 'AMOUNT_MISSING'} for the damage caused. The specific remedy sought is [${formData.demand_other_details || 'Details Missing - specify in form'}].`;
            summaryDemand = `the remedy described, valued at $${remedyDetails.demandAmount || 'AMOUNT_MISSING'}`;
            break;
        default:
            demandDescription = "appropriate compensation for the damage caused. The specific amount is estimated at $" + (remedyDetails.demandAmount || 'TBC') + ".";
            summaryDemand = "appropriate compensation";
    }
    
    const prompt = `Generate a "Demand for Compensation" section for an Australian Letter of Demand from customer (${baseData.senderInfo.name}) to mechanic (${baseData.recipientInfo.name}).

Context:
- Demand Type: ${remedyDetails.demandType || 'Not specified'}
- Detailed Demand Description: ${demandDescription}
- Alternative Remedy Offered by Customer: ${remedyDetails.alternativeRemedyOffered || 'none'}

Instructions:
- Formally state the demand for compensation based on the provided details.
- Clearly specify what is being demanded (e.g., payment amount, specific action).
- If an alternative remedy was offered (e.g., negotiation), mention it briefly as a potential path to resolution if the primary demand is met promptly.
- Keep the tone firm and direct.
- Respond ONLY with a valid JSON object containing a single key "remedyStatement". This object should have two keys: "text" containing the generated paragraph (approx 50-100 words), and "summaryDemand" containing a very brief summary of the demand (e.g., "reimbursement of $500 excess", "payment for full repair cost"). Use the provided summary: "${summaryDemand}".
Example Format: { "remedyStatement": { "text": "Your generated paragraph here...", "summaryDemand": "${summaryDemand}" } }`;

    try {
        const result = await callOpenAIWithRetry({
            model: DEFAULT_MODEL,
            messages: [
                {
                    role: "system",
                    content: "You are an expert Australian legal assistant. Generate precise JSON responses that exactly match the requested format. Focus on clear, formal demand statements for legal correspondence."
                },
                { role: "user", content: prompt }
            ],
            temperature: 0.5,
            // max_tokens: 250 // Optional
        });

        const content = result.choices[0].message.content;
        const sectionData = JSON.parse(content);

        // Basic validation
        if (!sectionData || !sectionData.remedyStatement || typeof sectionData.remedyStatement.text !== 'string' || sectionData.remedyStatement.text.trim() === '' || typeof sectionData.remedyStatement.summaryDemand !== 'string' || sectionData.remedyStatement.summaryDemand.trim() === '') {
            console.error('Invalid JSON structure received for Remedy Section:', content);
            throw new Error('Generated Remedy section has invalid structure or empty content.');
        }
        
        // Ensure the summary demand matches what we passed in the prompt to prevent hallucination
        if (sectionData.remedyStatement.summaryDemand !== summaryDemand) {
             console.warn(`Generated summaryDemand ('${sectionData.remedyStatement.summaryDemand}') does not match expected ('${summaryDemand}'). Using expected value.`);
             sectionData.remedyStatement.summaryDemand = summaryDemand;
        }


        console.log('Remedy Section generated successfully.');
        return sectionData;

    } catch (error) {
        console.error('Error generating Remedy Section:', error);
        throw new Error(`Failed to generate Remedy Section: ${error.message}`);
    }
}

export async function generateEscalationSection(baseData) {
    console.log('Generating Escalation Section...');
    const formData = baseData.formData || {};
    const escalationDetails = formData.escalationDetails || {};
    // Ensure calculatedResponseDate is formatted if available, otherwise calculate roughly
    let responseDeadlineDate = formData.calculatedResponseDate; 
    if (!responseDeadlineDate) {
        const deadlineDays = escalationDetails.responseDeadlineDays || 10;
        const generatedDate = new Date(baseData.metadata.generatedDate || Date.now());
        // Simple calculation - doesn't account for business days perfectly
        const deadline = new Date(generatedDate.setDate(generatedDate.getDate() + deadlineDays)); 
        responseDeadlineDate = deadline.toISOString().split('T')[0]; // YYYY-MM-DD format
         console.warn(`Calculated response date was missing, estimated as ${responseDeadlineDate}`);
    }


    const prompt = `Generate a "Deadline and Further Action" section for an Australian Letter of Demand from customer (${baseData.senderInfo.name}) to mechanic (${baseData.recipientInfo.name}).

Context:
- Response Deadline: Within ${escalationDetails.responseDeadlineDays || '10'} business days, by ${responseDeadlineDate}.
- Intended Escalation Body: ${escalationDetails.escalationBody || 'the relevant state tribunal (e.g., VCAT, NCAT, QCAT)'}
- Recipient Name: ${baseData.recipientInfo.name}
- State/Territory: ${baseData.state || 'VIC'}

Instructions:
- Clearly state the deadline for the recipient to respond and comply with the demand.
- Explicitly state the intention to escalate the matter if the deadline is missed without a satisfactory response.
- Name the specific escalation body (e.g., VCAT, NCAT) if provided, or use a general term like "the relevant state tribunal". Mention lodging a complaint with the state's consumer affairs body (e.g., Consumer Affairs Victoria, NSW Fair Trading) as well.
- Mention seeking recovery of all associated costs through legal proceedings.
- Keep the tone serious and emphasize the finality of this notice before escalation.
- Respond ONLY with a valid JSON object containing a single key "escalationText" which itself is an object with a single key "text" containing the generated paragraph (approx 75-125 words).
Example Format: { "escalationText": { "text": "Your generated paragraph here..." } }`;

    try {
        const result = await callOpenAIWithRetry({
            model: DEFAULT_MODEL,
            messages: [
                {
                    role: "system",
                    content: "You are an expert Australian legal assistant. Generate precise JSON responses that exactly match the requested format. Focus on clear, formal statements regarding deadlines and legal escalation for demand letters."
                },
                { role: "user", content: prompt }
            ],
            temperature: 0.5,
            // max_tokens: 250 // Optional
        });

        const content = result.choices[0].message.content;
        const sectionData = JSON.parse(content);

        // Basic validation
        if (!sectionData || !sectionData.escalationText || typeof sectionData.escalationText.text !== 'string' || sectionData.escalationText.text.trim() === '') {
            console.error('Invalid JSON structure received for Escalation Section:', content);
            throw new Error('Generated Escalation section has invalid structure or empty content.');
        }

        console.log('Escalation Section generated successfully.');
        return sectionData;

    } catch (error) {
        console.error('Error generating Escalation Section:', error);
        throw new Error(`Failed to generate Escalation Section: ${error.message}`);
    }
}

// TODO: Add AI generator functions for consumer_complaint document type 