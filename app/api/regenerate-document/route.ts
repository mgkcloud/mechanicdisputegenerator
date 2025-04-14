import { NextResponse } from "next/server"
import { getDocument } from "@/lib/document-storage"
import { generateAustralianDocument } from "@/lib/document-generator-au"
import { handleApiError, ApiError } from "@/lib/error-utils"

// --- Type Definitions ---

// Interface for the successful result of generateAustralianDocument
interface GenerationSuccessResponse {
  success: true;
  isFallback: boolean;
  documentText: string;
  documentData: any; // Consider defining a more specific type for documentData if possible
  filename: string;
  documentType: string;
  customerName?: string;
  mechanicName?: string;
  warning?: string;
}

// Interface for the error result of generateAustralianDocument (and potentially others)
interface GenerationErrorResponse {
  success: false;
  error: string;
  documentType?: string;
}

// Interface for the result of handleApiError (can be reused)
interface ErrorResponse {
  success: false;
  error: string;
  details?: any;
  statusCode: number;
}

// Combined type for the result of generateAustralianDocument
type GenerationResult = GenerationSuccessResponse | GenerationErrorResponse;

/**
 * API route to regenerate a document from stored input data.
 * @param {Request} req - The incoming request
 */
export async function POST(req: Request) {
  try {
    const { originalFilename } = await req.json();

    if (!originalFilename || typeof originalFilename !== 'string') {
      throw new ApiError("Missing or invalid originalFilename", 400);
    }

    // Derive the filename where the input data is stored
    const inputDataFilename = `${originalFilename}.input.json`;
    
    // Log regeneration request prominently
    console.log(`\n=============================================`);
    console.log(`REGENERATION REQUEST`);
    console.log(`ORIGINAL DOCUMENT: ${originalFilename}`);
    console.log(`INPUT DATA FILE: ${inputDataFilename}`);
    console.log(`=============================================\n`);
    
    console.log(`Regeneration request for: ${originalFilename}, fetching input from: ${inputDataFilename}`);

    // 1. Retrieve the stored input data
    let storedInputJson;
    try {
      storedInputJson = await getDocument(inputDataFilename);
      console.log(`Input data fetch result for ${inputDataFilename}: ${storedInputJson ? 'SUCCESS' : 'NOT FOUND'}`);
      
      if (!storedInputJson) {
        // If input data isn't found, it could be that our previous fix hasn't been applied to this file yet
        // Try the old format as a fallback (without .input.json)
        const alternativeFilename = `${originalFilename}.json`;
        console.log(`Trying alternative input filename: ${alternativeFilename}`);
        storedInputJson = await getDocument(alternativeFilename);
        console.log(`Alternative input fetch result: ${storedInputJson ? 'SUCCESS' : 'NOT FOUND'}`);
        
        if (!storedInputJson) {
          throw new ApiError(`Input data not found for ${originalFilename}. Tried both ${inputDataFilename} and ${alternativeFilename}`, 404);
        }
      }
    } catch (error) {
      console.error(`Error fetching input data for ${inputDataFilename}:`, 
        error instanceof Error ? error.message : String(error));
      throw new ApiError(`Failed to retrieve input data for ${originalFilename}: ${error instanceof Error ? error.message : 'Unknown error'}`, 500);
    }

    // 2. Parse the input data
    let originalFormData;
    try {
      console.log(`Parsing input JSON (${typeof storedInputJson}, length: ${storedInputJson.length})`);
      originalFormData = JSON.parse(storedInputJson);
      console.log(`Successfully parsed input data for ${originalFilename}. Data includes properties: ${Object.keys(originalFormData).join(', ')}`);
    } catch (parseError) {
      console.error(`Failed to parse stored input JSON for ${originalFilename}:`, 
        parseError instanceof Error ? parseError.message : String(parseError));
      // Log a sample of the JSON to help debug
      console.error(`JSON sample (first 100 chars): ${storedInputJson.substring(0, 100)}...`);
      throw new ApiError("Failed to load original input data.", 500);
    }

    // 3. Re-run the generation process
    console.log(`Calling generateAustralianDocument with retrieved input data for ${originalFilename}...`);
    // Assert the type since the imported function is JS
    const regenerationResult = await generateAustralianDocument(originalFormData) as GenerationResult;

    // Type guard: Check if generation was successful
    if (!regenerationResult.success) {
       // Now we know it's a GenerationErrorResponse
       const errorMessage = regenerationResult.error || "Regeneration failed without specific error message";
       throw new ApiError(errorMessage, 500);
    }

    // If we reach here, regenerationResult is GenerationSuccessResponse
    console.log(`Regeneration successful for ${originalFilename}. New filename: ${regenerationResult.filename}`);
    
    // Log regeneration result prominently
    console.log(`\n=============================================`);
    console.log(`REGENERATION COMPLETE`);
    console.log(`ORIGINAL DOCUMENT: ${originalFilename}`);
    console.log(`NEW DOCUMENT: ${regenerationResult.filename}`);
    console.log(`=============================================\n`);

    // 4. Return the new document details (similar to the original generate API)
    return NextResponse.json({
      ...regenerationResult, // Contains new filename, text, data, etc.
    });

  } catch (error) {
    // Improve error logging to capture more information
    const errorObj = {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined,
      details: error instanceof ApiError ? error.details : undefined,
      statusCode: error instanceof ApiError ? error.statusCode : 500
    };
    
    console.error("Error during document regeneration:", JSON.stringify(errorObj, null, 2));
    
    // Cast the result of handleApiError
    const errorResponse = handleApiError(error as Error | ApiError) as ErrorResponse;
    // Ensure statusCode exists before accessing it
    const statusCode = errorResponse?.statusCode || 500;
    return NextResponse.json(errorResponse, { status: statusCode });
  }
} 