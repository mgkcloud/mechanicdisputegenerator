import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";

// Add CORS preflight handler
export async function OPTIONS(request) {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'PUT, POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
      'Access-Control-Max-Age': '86400'
    }
  });
}

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
      const response = NextResponse.json({ success: true, message: 'File uploaded successfully to R2' });
      
      // Add CORS headers to response
      response.headers.set('Access-Control-Allow-Origin', '*');
      response.headers.set('Access-Control-Allow-Methods', 'PUT, POST, GET, OPTIONS');
      
      return response;
    }
    
    // Fallback - in real development you might want to store this locally
    console.log(`[DEV UPLOADS] No storage available, simulating successful upload`);
    const response = NextResponse.json({ 
      success: true, 
      message: 'File upload simulated (no storage available)',
      path: path,
      size: fileContent.byteLength,
      contentType: request.headers.get('Content-Type') || 'application/octet-stream'
    });
    
    // Add CORS headers to response
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'PUT, POST, GET, OPTIONS');
    
    return response;
    
  } catch (error) {
    console.error(`[DEV UPLOADS] Error handling upload:`, error);
    const response = NextResponse.json({ 
      success: false, 
      error: error.message || 'Unknown error' 
    }, { status: 500 });
    
    // Add CORS headers even to error responses
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'PUT, POST, GET, OPTIONS');
    
    return response;
  }
}

// Also handle POST requests which some clients might use
export const POST = PUT; 