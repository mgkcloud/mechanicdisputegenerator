import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export async function PUT(request, { params }) {
  const path = params.path?.join('/') || '';
  console.log(`[DEV UPLOADS] Received file upload for path: ${path}`);
  
  try {
    // Get environment variables
    let env = {};
    let R2_BUCKET = null;
    
    try {
      const context = await getCloudflareContext({ async: true });
      env = context.env || {};
      R2_BUCKET = env.DOCUMENTS_BUCKET;
      console.log(`[DEV UPLOADS] Available environment variables: ${Object.keys(env).filter(k => !k.includes('KEY')).join(', ')}`);
    } catch (err) {
      console.log(`[DEV UPLOADS] Not running in Cloudflare context: ${err.message}`);
      env = process.env;
    }
    
    // Get the file content
    const fileContent = await request.arrayBuffer();
    console.log(`[DEV UPLOADS] Received file, size: ${fileContent.byteLength} bytes`);
    
    // Try to use R2 bucket if available
    if (R2_BUCKET) {
      console.log(`[DEV UPLOADS] Using R2 bucket to store file`);
      await R2_BUCKET.put(path, fileContent, {
        httpMetadata: {
          contentType: request.headers.get('Content-Type') || 'application/octet-stream',
          cacheControl: 'public, max-age=31536000',
        }
      });
      
      console.log(`[DEV UPLOADS] File stored successfully in R2`);
      return NextResponse.json({ success: true, message: 'File uploaded successfully to R2' });
    }
    
    // Fallback - in real development you might want to store this locally
    console.log(`[DEV UPLOADS] No storage available, simulating successful upload`);
    return NextResponse.json({ 
      success: true, 
      message: 'File upload simulated (no storage available)',
      path: path,
      size: fileContent.byteLength,
      contentType: request.headers.get('Content-Type') || 'application/octet-stream'
    });
    
  } catch (error) {
    console.error(`[DEV UPLOADS] Error handling upload:`, error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Unknown error' 
    }, { status: 500 });
  }
}

// Also handle POST requests which some clients might use
export const POST = PUT; 