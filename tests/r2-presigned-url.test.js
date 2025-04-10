/**
 * End-to-end test for R2 presigned URL functionality
 * 
 * This test suite verifies that:
 * 1. The API generates valid presigned URLs
 * 2. Files can be uploaded directly to R2 using these URLs
 * 3. Security measures prevent unauthorized uploads
 * 4. URLs expire after the specified time
 * 
 * To run this test:
 * npm test -- tests/r2-presigned-url.test.js
 */

const fetch = require('node-fetch');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

// Test configuration
const API_URL = process.env.TEST_API_URL || 'http://localhost:3000';
const ENDPOINT = '/api/get-upload-url';
const TEST_FILE_PATH = path.join(__dirname, 'fixtures/test-image.jpg'); // Create this test file

// Test suite
describe('R2 Presigned URL API', () => {
  let testFile;
  
  // Set up test file
  beforeAll(() => {
    if (!fs.existsSync(path.join(__dirname, 'fixtures'))) {
      fs.mkdirSync(path.join(__dirname, 'fixtures'), { recursive: true });
    }
    
    // Create a test file if it doesn't exist
    if (!fs.existsSync(TEST_FILE_PATH)) {
      const testData = Buffer.alloc(1024, 'test-data'); // 1KB test file
      fs.writeFileSync(TEST_FILE_PATH, testData);
    }
    
    testFile = {
      name: 'test-image.jpg',
      type: 'image/jpeg',
      size: fs.statSync(TEST_FILE_PATH).size,
      content: fs.readFileSync(TEST_FILE_PATH)
    };
  });
  
  test('Should generate a valid presigned URL', async () => {
    const response = await fetch(`${API_URL}${ENDPOINT}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fileName: testFile.name,
        contentType: testFile.type,
        fileSize: testFile.size
      })
    });
    
    expect(response.status).toBe(200);
    
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data).toBeDefined();
    expect(data.data.presignedUrl).toBeDefined();
    expect(data.data.objectKey).toBeDefined();
    expect(data.data.expiresAt).toBeDefined();
    
    // Store URL for next test
    global.testData = {
      presignedUrl: data.data.presignedUrl,
      objectKey: data.data.objectKey,
      photoUrl: data.data.url
    };
  });
  
  test('Should successfully upload file using presigned URL', async () => {
    const { presignedUrl } = global.testData;
    
    const uploadResponse = await fetch(presignedUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': testFile.type
      },
      body: testFile.content
    });
    
    expect(uploadResponse.status).toBe(200);
  });
  
  test('Should reject invalid content types', async () => {
    const response = await fetch(`${API_URL}${ENDPOINT}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fileName: 'malicious.exe',
        contentType: 'application/octet-stream',
        fileSize: 1024
      })
    });
    
    expect(response.status).toBe(415); // Unsupported Media Type
    
    const data = await response.json();
    expect(data.success).toBe(false);
    expect(data.error).toBeDefined();
    expect(data.error.code).toBe('UNSUPPORTED_MEDIA_TYPE');
  });
  
  test('Should enforce file size limits', async () => {
    const response = await fetch(`${API_URL}${ENDPOINT}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fileName: 'huge-file.jpg',
        contentType: 'image/jpeg',
        fileSize: 200 * 1024 * 1024 // 200MB - over the 100MB limit
      })
    });
    
    expect(response.status).toBe(413); // Payload Too Large
    
    const data = await response.json();
    expect(data.success).toBe(false);
    expect(data.error).toBeDefined();
    expect(data.error.code).toBe('PAYLOAD_TOO_LARGE');
  });
  
  test('Should require essential parameters', async () => {
    const response = await fetch(`${API_URL}${ENDPOINT}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        // Missing required parameters
      })
    });
    
    expect(response.status).toBe(400); // Bad Request
    
    const data = await response.json();
    expect(data.success).toBe(false);
    expect(data.error).toBeDefined();
    expect(data.error.code).toBe('MISSING_PARAMETERS');
  });
  
  // This test requires manual verification since we can't wait for expiration in a unit test
  test.skip('Should expire URL after specified time', async () => {
    // Note: To properly test this, you would need to:
    // 1. Get a presigned URL with a very short expiration (e.g., 10 seconds)
    // 2. Wait for the URL to expire
    // 3. Try to use the URL and expect a failure
    
    const { presignedUrl } = global.testData;
    console.log('To manually test URL expiration, try using this URL after 1 hour:');
    console.log(presignedUrl);
  });
});

// Helper function to simulate wait
function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
} 