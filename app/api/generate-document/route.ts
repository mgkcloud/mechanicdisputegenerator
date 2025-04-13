import { NextResponse } from "next/server"
import { generateAustralianDocument } from "@/lib/document-generator-au"
import { ApiError, handleApiError, validateRequiredFields } from "@/lib/error-utils"
import { formatFormDataLog } from "@/lib/form-utils"

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
  documentText: string;
  filename: string;
  documentType: string;
  isFallback?: boolean;
  warning?: string;
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
    const document = await generateAustralianDocument(jsonData);
    
    if (!document) {
      throw new ApiError("Failed to generate document", 500);
    }

    // Return success response
    return NextResponse.json({
      success: true,
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
