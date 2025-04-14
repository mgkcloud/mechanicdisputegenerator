/**
 * Australian document generator module for Next.js
 * Generates legal documents for Australian mechanic disputes
 */
import { v4 as uuidv4 } from "uuid"
import { generateDocumentData } from './services/document-generation-service.js'
import { renderDocumentTemplate } from './services/template-service.js'
import { storeDocument, getDocument } from './document-storage.js'
import { AU_DOCUMENT_TYPES } from './constants.js' // Import from new constants file

/**
 * Creates a basic, schema-compliant data structure from raw form data for fallback purposes.
 * Provides default values for potentially missing fields expected by the template.
 * @param {object} formData - The original form data.
 * @param {string} documentType - The type of document being generated.
 * @returns {object} - A basic data object suitable for template rendering.
 */
function createFallbackDocumentData(formData, documentType) {
    console.log('Creating fallback document data...');
    const now = new Date().toISOString();
    
    // Map known fields and provide defaults for missing ones
    const fallbackData = {
        documentType: documentType,
        state: formData.state || '[State Not Provided]',
        senderInfo: {
            name: formData.customer_name || '[Customer Name Not Provided]',
            address: formData.customer_address || '',
            phone: formData.customer_phone || '',
            email: formData.customer_email || '[Customer Email Not Provided]'
        },
        recipientInfo: {
            name: formData.mechanic_name || '[Mechanic Name Not Provided]',
            address: formData.mechanic_address || '',
            abn: formData.mechanic_abn || '',
            contactPerson: formData.mechanic_contact_person || ''
        },
        vehicleDetails: {
            make: formData.vehicle_make || '[Make]',
            model: formData.vehicle_model || '[Model]',
            year: formData.vehicle_year || null, // Use null for potentially numeric fields if missing
            registration: formData.vehicle_rego || '[Registration]'
        },
        incidentDetails: {
            serviceDate: formData.service_date || '[Service Date]',
            // Add other essential fields expected by the specific template, with defaults
            timelineEvents: formData.timelineEvents || [{ description: '[Timeline details not provided]' }],
            disputedDamageDescription: formData.disputed_damage_description || '[Damage description not provided]',
            calculatedResponseDate: formData.calculatedResponseDate || '[Response Date Not Provided]', 
            // Add other incident fields as needed by templates
        },
        paymentDetails: { // Provide defaults even if not present in form
             paymentMadeUnderProtest: formData.paymentMadeUnderProtest || false,
             protestedInvoiceAmount: formData.protestedInvoiceAmount || null,
             invoiceNumber: formData.invoiceNumber || '',
             paymentDate: formData.paymentDate || null
        },
        remedyDetails: { // Provide defaults
            demandType: formData.demandType || 'compensation',
            demandAmount: formData.demandAmount || null,
            alternativeRemedyOffered: formData.alternativeRemedyOffered || 'none',
            insuranceDetails: formData.insuranceDetails || { insurer: '', claimNumber: '', excessAmount: null }
        },
        escalationDetails: { // Provide defaults
             escalationBody: formData.escalationBody || '[Escalation Body Not Provided]',
             responseDeadlineDays: formData.responseDeadlineDays || 10,
        },
        // Add placeholders for AI-generated sections expected by template
        legalBasis: { summaryText: '[Legal basis summary not available - generation failed]' },
        incidentNarrative: { text: '[Incident narrative not available - generation failed]' },
        remedyStatement: { text: '[Remedy statement not available - generation failed]', summaryDemand: 'compensation' },
        escalationText: { text: '[Escalation details not available - generation failed]' },
        // Add placeholders for consumer complaint AI sections if needed
        metadata: {
            generatedDate: now,
            schemaVersion: "1.0.0", // Fallback uses current schema version
            generationId: `fallback-${uuidv4().substring(0,8)}`
        }
    };
    return fallbackData;
}

/**
 * Handles errors during the primary document generation flow.
 * Attempts to generate a fallback document using basic data and templates.
 * @param {Error} error - The error caught during generation.
 * @param {object} formData - The original form data.
 * @param {string} documentType - The type of document.
 * @returns {Promise<object>} - Fallback document result.
 * @throws {Error} - If fallback generation also fails.
 */
async function handleGenerationError(error, formData, documentType) {
  console.error("Primary document generation failed:", error.message);
  console.log("Attempting fallback generation...");
  
  try {
      // 1. Create basic document data structure from formData
      const fallbackData = createFallbackDocumentData(formData, documentType);
      
      // 2. Optional validation removed - Rely on template robustness for fallback
      console.log('Skipping validation for fallback data, proceeding with template rendering.');
      
      // 3. Render using the same template engine
      console.log(`Rendering fallback template for ${documentType}...`);
      const documentText = await renderDocumentTemplate(documentType, fallbackData);
      
      // 4. Prepare fallback response structure
      const uniqueId = uuidv4().substring(0, 8);
      const filename = `au_${documentType}_${uniqueId}_fallback`;
      
      console.log("Successfully generated fallback document.");
      
      return {
        success: true, // Indicate overall success but with fallback flag
        isFallback: true,
        documentText,
        documentData: fallbackData, // Include the fallback data used
        filename,
        documentType: AU_DOCUMENT_TYPES[documentType] || "Australian Legal Document (Fallback)",
        customerName: fallbackData.senderInfo.name,
        mechanicName: fallbackData.recipientInfo.name,
        warning: `Primary generation failed: ${error.message}. Displaying fallback document.`
      };

  } catch (fallbackError) {
      console.error("Fallback generation also failed:", fallbackError);
      // Re-throw the fallback error to be caught by the final catch block
      throw new Error(`Fallback mechanism failed: ${fallbackError.message}`);
  }
}

/**
 * Generates an Australian legal document using structured data and templating.
 * Orchestrates data generation, rendering, and fallback handling.
 * @param {Object} formData - Form data from the request.
 * @returns {Promise<Object>} - Generated document result including text and structured data.
 */
export async function generateAustralianDocument(formData) {
  const documentType = formData.document_type
  if (!documentType || !AU_DOCUMENT_TYPES[documentType]) {
    throw new Error(`Invalid or unsupported document type: ${documentType}`)
  }

  try {
    console.log(`Generating ${AU_DOCUMENT_TYPES[documentType]}...`)
    
    // 1. Generate structured JSON document data using the modular service
    // This now handles base data creation, AI calls (parallel), assembly, and validation
    let documentData;
    try {
      documentData = await generateDocumentData(formData, documentType)
      console.log('Structured document data generated successfully.')
    } catch (dataError) {
      console.error('Error generating document data:', JSON.stringify({
        message: dataError.message,
        stack: dataError.stack,
        documentType: documentType
      }))
      throw dataError; // Re-throw to be caught by outer try/catch
    }

    // 2. Render the final document text using a templating engine
    let documentText;
    try {
      documentText = await renderDocumentTemplate(documentType, documentData)
      console.log('Document text rendered successfully from template.')
    } catch (templateError) {
      console.error('Error rendering template:', JSON.stringify({
        message: templateError.message,
        stack: templateError.stack,
        documentType: documentType
      }))
      throw templateError; // Re-throw to be caught by outer try/catch
    }

    // 3. Generate unique ID and filename
    const uniqueId = uuidv4().substring(0, 8)
    const filename = `au_${documentType}_${uniqueId}`
    
    // Log case number prominently for tracking in Cloudflare logs
    console.log(`\n=============================================`);
    console.log(`CASE NUMBER: ${uniqueId}`);
    console.log(`DOCUMENT TYPE: ${documentType}`);
    console.log(`FULL FILENAME: ${filename}`);
    console.log(`=============================================\n`);
    
    // 3.5 Store the document text using the filename
    let storedHtmlUrl, storedInputUrl;
    
    // First, try to store the HTML document
    try {
      // Store HTML Document
      storedHtmlUrl = await storeDocument(filename, documentText, { 
        contentType: "text/html", 
        format: "html",
        metadata: { 
          originalDocumentType: documentType,
          customerName: documentData.senderInfo?.name,
          mechanicName: documentData.recipientInfo?.name,
        } 
      });
      console.log(`Document HTML stored successfully with filename: ${filename}`);
    } catch (htmlError) {
      console.error(`Failed to store HTML document for ${filename}:`, htmlError);
      throw new Error(`Failed to store HTML document: ${htmlError.message}`);
    }
    
    // Then, separately try to store the JSON input data
    try {
      // Store Original Input Data as JSON
      const inputDataFilename = `${filename}.input.json`;
      const jsonString = JSON.stringify(formData, null, 2);
      
      console.log(`\n------ INPUT JSON SAVE ATTEMPT FROM GENERATOR ------`);
      console.log(`Input filename: ${inputDataFilename}`);
      console.log(`JSON string length: ${jsonString.length}`);
      console.log(`JSON first 100 chars: ${jsonString.substring(0, 100)}...`);
      
      // Use the base filename as ID, let storeDocument add the format extension
      storedInputUrl = await storeDocument(filename, jsonString, { 
        contentType: "application/json", 
        format: "input.json", // Use custom format to get the right extension
        metadata: { 
          originalDocumentFilename: filename,
          originalDocumentType: documentType 
        } 
      });
      
      // Attempt to verify the JSON was stored correctly using the full filename
      const verificationCheck = await getDocument(inputDataFilename);
      if (verificationCheck) {
        console.log(`✅ INPUT JSON VERIFIED: Successfully stored and retrieved ${inputDataFilename} (${verificationCheck.length} bytes)`);
      } else {
        console.error(`❌ INPUT JSON VERIFICATION FAILED: Could not retrieve ${inputDataFilename} after saving`);
      }
      
      console.log(`Original input data stored successfully as: ${inputDataFilename}`);
      console.log(`------------------------------------------\n`);
    } catch (jsonError) {
      console.error(`\n❌❌❌ ERROR SAVING JSON INPUT DATA (GENERATOR) ❌❌❌`);
      console.error(`Error type: ${jsonError.constructor?.name || 'Unknown'}`);
      console.error(`Error message: ${jsonError.message || String(jsonError)}`);
      console.error(`Error stack: ${jsonError.stack || 'No stack trace'}`);
      console.error(`------------------------------------------\n`);
      // Continue execution rather than failing - the HTML is already saved
      // Document regeneration won't work but at least the original is available
    }

    // 4. Return the successful result, including the structured data
    return {
      success: true,
      isFallback: false, // Explicitly state it's not a fallback
      documentText,
      documentData, // Include the structured data
      filename,
      documentType: AU_DOCUMENT_TYPES[documentType],
      // Extract names from the validated documentData for consistency
      customerName: documentData.senderInfo?.name || 'Customer',
      mechanicName: documentData.recipientInfo?.name || 'Mechanic',
    }
  } catch (error) {
    console.error(`Error in generateAustralianDocument for type ${documentType}:`, {
      message: error.message,
      stack: error.stack,
      documentType: documentType,
      formDataKeys: Object.keys(formData)
    })
    // Attempt fallback if primary generation fails
    try {
      return await handleGenerationError(error, formData, documentType)
    } catch (fallbackError) {
      console.error("Fallback generation also failed:", {
        original: error.message,
        fallback: fallbackError.message,
        stack: fallbackError.stack
      })
      // If even fallback fails, return a final error response
      return {
        success: false,
        error: `Document generation failed critically: ${error.message}. Fallback also failed: ${fallbackError.message}`,
        documentType: AU_DOCUMENT_TYPES[documentType] || "Unknown Document Type",
      }
    }
  }
}
