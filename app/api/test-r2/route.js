import { NextResponse } from "next/server";
import { storeDocument, getDocument, getEnv } from "@/lib/document-storage";

/**
 * API route to test R2 storage
 * @param {Request} request - The incoming request
 */
export async function GET(request) {
  try {
    const timestamp = new Date().toISOString();
    const testFileName = `test_file_${Date.now()}`;
    const testContent = `Test file created at ${timestamp}`;
    const results = {
      timestamp,
      testFileName,
      writeSuccess: false,
      readSuccess: false,
      readContent: null,
      bucketInfo: null,
      error: null
    };

    console.log(`\n----- R2 STORAGE TEST -----`);
    console.log(`Creating test file: ${testFileName}`);

    // Get bucket information directly
    try {
      const env = await getEnv();
      const bucketName = env?.DOCUMENTS_BUCKET?.name || "unknown";
      results.bucketInfo = {
        bucketName,
        hasBinding: !!env.DOCUMENTS_BUCKET,
        envKeys: Object.keys(env).filter(k => !k.includes('KEY')),
      };
      console.log(`R2 bucket info: ${JSON.stringify(results.bucketInfo)}`);
    } catch (bucketError) {
      console.error(`Error getting bucket info: ${bucketError.message}`);
      results.error = `Bucket info error: ${bucketError.message}`;
    }

    // Try to write a test file
    try {
      await storeDocument(testFileName, testContent, { 
        contentType: "text/plain",
        format: "txt",
        metadata: { test: true, timestamp }
      });
      results.writeSuccess = true;
      console.log(`✅ Test file written successfully`);
    } catch (writeError) {
      console.error(`❌ Failed to write test file: ${writeError.message}`);
      results.error = `Write error: ${writeError.message}`;
    }

    // Immediately try to read it back
    if (results.writeSuccess) {
      try {
        const readContent = await getDocument(`${testFileName}.txt`);
        results.readSuccess = !!readContent;
        results.readContent = readContent;
        console.log(`${results.readSuccess ? '✅' : '❌'} Read test: ${results.readSuccess ? 'SUCCESS' : 'FAILED'}`);
        if (readContent) {
          console.log(`Read content: ${readContent}`);
        }
      } catch (readError) {
        console.error(`❌ Failed to read test file: ${readError.message}`);
        results.error = `Read error: ${readError.message}`;
      }
    }

    console.log(`---------------------------\n`);
    
    // Return detailed results
    return NextResponse.json(results);
  } catch (error) {
    console.error("Error in R2 test:", error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
} 