import { NextResponse } from "next/server"
import { generateAustralianDocument } from "@/lib/document-generator-au"
import { ApiError, handleApiError, validateRequiredFields } from "@/lib/error-utils"
import { formatFormDataLog } from "@/lib/form-utils"
import { storeDocument, getDocument } from "@/lib/document-storage"

// Import Zod schemas
import { LetterOfDemandInputSchema } from "@/lib/validation/zod-schemas";
import { ZodError } from "zod"; // Add import for ZodError type
// Add other schema imports when needed

// Define a map for Zod schema lookup
const zodSchemaMap = {
  letter_of_demand: LetterOfDemandInputSchema,
  // consumer_complaint: ConsumerComplaintInputSchema, // Add when needed
};

// Define type for document generation result
interface DocumentResult {
  success: boolean;
  documentText: string;
  filename: string;
  documentType: string;
  documentData?: Record<string, any>;
  customerName?: string;
  mechanicName?: string;
  isFallback?: boolean;
  warning?: string;
  error?: string;
}

// Define a type for error responses
interface ErrorResponse {
  success: false;
  error: string;
  details?: any;
  statusCode: number;
}

/**
 * API route to generate a legal document
 * @param {Request} req - The incoming request
 */
export async function POST(req: Request) {
  try {
    // Parse the form data
    const formData = await req.formData();
    console.log("Received form data:", formatFormDataLog(formData));

    // Convert FormData to a regular object for document generation
    const jsonData: Record<string, any> = {};
    
    // Extract and parse all JSON fields
    for (const [key, value] of formData.entries()) {
      if (typeof value === 'string') {
        // Try to parse as JSON if it's a string and looks like JSON
        if (value.trim().startsWith('{') || value.trim().startsWith('[')) {
          try {
            jsonData[key] = JSON.parse(value);
          } catch (error) {
            console.error(`Failed to parse JSON for field ${key}: ${value}`, error);
            throw new ApiError(`Invalid JSON in field '${key}'. Please check the format.`, 400);
          }
        } else {
          // Not JSON, just use the string value
          jsonData[key] = value;
        }
      } else {
        // For non-string values (like File objects)
        jsonData[key] = value;
      }
    }

    // Get document type from form data (using consistent key naming)
    const documentType = jsonData.document_type;
    if (!documentType) {
      throw new ApiError("Document type is required", 400);
    }

    // Validate required fields based on document type
    const requiredFields = getRequiredFieldsByDocumentType(documentType);
    validateRequiredFields(jsonData, requiredFields);

    // Generate the document
    // Use a type assertion since the JS function's return type can't be inferred precisely
    const document = await generateAustralianDocument(jsonData) as DocumentResult;
    
    if (!document || !document.success) {
      const errorMessage = document?.error || "Failed to generate document (Unknown reason)";
      throw new ApiError(errorMessage, 500);
    }

    // Save the generated document (HTML)
    try {
      await storeDocument(document.filename, document.documentText, {
        contentType: "text/html",
        format: "html", // Explicitly set format to html
        metadata: { type: document.documentType }
      });
      console.log(`HTML document saved successfully: ${document.filename}`);
    } catch (htmlSaveError: unknown) {
      const errorMessage = htmlSaveError instanceof Error ? htmlSaveError.message : String(htmlSaveError);
      console.error(`ERROR SAVING HTML DOCUMENT: ${errorMessage}`);
      // Continue execution - we can still return the document even if storage fails
    }

    // Save the input data (JSON) - with isolated error handling
    try {
      const inputFilename = `${document.filename}.input.json`;
      const jsonString = JSON.stringify(jsonData, null, 2);
      
      console.log(`\n------ INPUT JSON SAVE ATTEMPT ------`);
      console.log(`Input filename: ${inputFilename}`);
      console.log(`JSON string length: ${jsonString.length}`);
      console.log(`JSON first 100 chars: ${jsonString.substring(0, 100)}...`);
      
      await storeDocument(document.filename, jsonString, {
        contentType: "application/json",
        format: "input.json",
        metadata: { originalDocument: document.filename }
      });
      
      // Verify it was saved using the full filename
      const verificationCheck = await getDocument(inputFilename);
      if (verificationCheck) {
        console.log(`✅ INPUT JSON VERIFIED: Successfully stored and retrieved ${inputFilename} (${verificationCheck.length} bytes)`);
      } else {
        console.error(`❌ INPUT JSON VERIFICATION FAILED: Could not retrieve ${inputFilename} after saving`);
      }
      console.log(`----------------------------------\n`);
    } catch (jsonSaveError: unknown) {
      const errorMessage = jsonSaveError instanceof Error ? jsonSaveError.message : String(jsonSaveError);
      const errorStack = jsonSaveError instanceof Error ? jsonSaveError.stack : undefined;
      const errorName = jsonSaveError instanceof Error ? jsonSaveError.constructor.name : 'Unknown';
      
      console.error(`\n❌❌❌ ERROR SAVING JSON INPUT DATA ❌❌❌`);
      console.error(`Error type: ${errorName}`);
      console.error(`Error message: ${errorMessage}`);
      console.error(`Error stack: ${errorStack}`);
      console.error(`------------------------------------------\n`);
      // Continue execution - regeneration won't work but at least document creation succeeds
    }

    // Return success response
    return NextResponse.json({
      ...document
    });
  } catch (error) {
    // Convert to proper response using handleApiError
    const errorResponse = handleApiError(error as Error | ApiError) as ErrorResponse;
    return NextResponse.json(errorResponse, { status: errorResponse.statusCode || 500 });
  }
}

// Helper function to determine required fields based on document type
function getRequiredFieldsByDocumentType(documentType: string): string[] {
  switch (documentType) {
    case 'vcat_application':
      return ['customer_name', 'customer_email', 'mechanic_name', 'damage_description'];
    case 'letter_of_demand':
      return ['customer_name', 'customer_email', 'mechanic_name', 'damage_description'];
    case 'consumer_complaint':
      return ['customer_name', 'customer_email', 'mechanic_name', 'damage_description'];
    case 'insurance_claim':
      return ['customer_name', 'customer_email', 'mechanic_name', 'damage_description', 'insurance_insurer'];
    default:
      return ['document_type']; // At minimum, document type is required
  }
}
