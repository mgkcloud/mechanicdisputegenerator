import { NextResponse } from "next/server";
import { getDocument, getDocumentMetadata } from "@/lib/document-storage";
import { handleApiError, validateRequiredFields, ApiError } from "@/lib/error-utils";
import nodemailer from "nodemailer";

/**
 * API route to share a document via email
 * @param {Request} request - The incoming request
 */
export async function POST(request) {
  try {
    // Parse the request body
    const data = await request.json();
    
    // Validate required fields
    validateRequiredFields(data, ["filename", "recipient_email"]);
    const { filename, recipient_email, message } = data;
    
    // Get the document HTML and metadata
    const documentHtml = await getDocument(filename);
    if (!documentHtml) {
      throw new ApiError("Document not found", 404);
    }
    
    const metadata = await getDocumentMetadata(`${filename}.html`);
    const documentType = metadata?.metadata?.documentType || "Legal Document";
    const customerName = metadata?.metadata?.customerName || "Customer";
    
    // Configure email transport
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || "587"),
      secure: process.env.EMAIL_SECURE === "true",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
    
    // Prepare email content
    const emailSubject = `${documentType} for ${customerName}`;
    
    // Default message if none provided
    const emailMessage = message || `Here is the ${documentType} you requested.`;
    
    // Send the email with document attached
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || "noreply@mechanicdispute.com.au",
      to: recipient_email,
      subject: emailSubject,
      text: emailMessage,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333;">${emailSubject}</h2>
          <p style="margin-bottom: 20px;">${emailMessage}</p>
          <p style="margin-bottom: 30px;">You can view the document in your browser or download it using the links below:</p>
          <div style="margin-bottom: 30px;">
            <a href="${process.env.NEXT_PUBLIC_BASE_URL || ''}/documents/view/${filename}" 
               style="display: inline-block; background-color: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; margin-right: 10px;">
              View Document
            </a>
            <a href="${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/documents/download/${filename}?format=pdf" 
               style="display: inline-block; background-color: #EF4444; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; margin-right: 10px;">
              Download PDF
            </a>
            <a href="${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/documents/download/${filename}?format=docx" 
               style="display: inline-block; background-color: #3B82F6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">
              Download DOCX
            </a>
          </div>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">
            This email was sent from the Australian Mechanic Dispute Resolution service. 
            If you did not request this document, please disregard this email.
          </p>
        </div>
      `,
      // Attach inline HTML document
      attachments: [
        {
          filename: `${documentType}.html`,
          content: documentHtml,
          contentType: 'text/html',
        },
      ],
    });
    
    // Return success response
    return NextResponse.json({
      success: true,
      message: `Document shared successfully with ${recipient_email}`,
    });
  } catch (error) {
    const errorResponse = handleApiError(error);
    return NextResponse.json(errorResponse, { status: errorResponse.statusCode });
  }
} 