import { NextResponse } from "next/server";
import { getDocument, getDocumentMetadata } from "@/lib/document-storage";
import { handleApiError, ApiError } from "@/lib/error-utils";
import { htmlToDocx } from "@/lib/docx-converter";

/**
 * API route to download a document in different formats
 * @param {Request} request - The incoming request
 * @param {{ params: Promise<{ filename: string }> }} context - The route context object with dynamic parameters
 */
export async function GET(
  request,
  { params }
) {
  try {
    // Await the params Promise to get the actual values
    const { filename } = await params;
    const searchParams = new URL(request.url).searchParams;
    const format = searchParams.get("format") || "pdf";
    
    // Get the document HTML
    const documentHtml = await getDocument(filename);
    
    if (!documentHtml) {
      throw new ApiError("Document not found", 404);
    }
    
    // Get metadata for the document
    const metadata = await getDocumentMetadata(`${filename}.html`);
    const documentType = metadata?.metadata?.documentType || "Legal Document";
    const customerName = metadata?.metadata?.customerName || "Customer";
    
    // Generate a readable filename
    const sanitizedCustomerName = customerName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const sanitizedDocType = documentType.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const readableFilename = `${sanitizedDocType}_${sanitizedCustomerName}`;
    
    // Handle based on requested format
    if (format === "pdf") {
      // For PDF, we'll return the HTML with print-optimized styling
      // Client-side JS will handle the actual printing/saving
      const printOptimizedHtml = generatePrintOptimizedHtml(documentHtml, readableFilename);
      
      // Return the PDF-optimized HTML
      return new NextResponse(printOptimizedHtml, {
        headers: {
          "Content-Type": "text/html",
        },
      });
    } else if (format === "docx") {
      // Convert HTML to DOCX
      const docxBuffer = await htmlToDocx(documentHtml, {
        title: documentType,
        subject: `Document for ${customerName}`,
        creator: "Australian Mechanic Dispute Resolution",
      });
      
      // Return the DOCX as a downloadable file
      return new NextResponse(docxBuffer, {
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "Content-Disposition": `attachment; filename="${readableFilename}.docx"`,
        },
      });
    } else {
      throw new ApiError("Unsupported format requested", 400);
    }
  } catch (error) {
    const errorResponse = handleApiError(error);
    return NextResponse.json(errorResponse, { status: errorResponse.statusCode });
  }
}

/**
 * Generate print-optimized HTML that will automatically trigger download
 * @param {string} html - HTML content to optimize
 * @param {string} filename - Name for the downloaded file
 * @returns {string} - Print-optimized HTML with auto-download script
 */
function generatePrintOptimizedHtml(html, filename) {
  // Extract the document content from the original HTML
  // This assumes the HTML has a body with content
  const bodyContentMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  const bodyContent = bodyContentMatch ? bodyContentMatch[1] : html;
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Download Document</title>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js" integrity="sha512-GsLlZN/3F2ErC5ifS5QtgpiJtWd43JWSuIgh7mbzZ8zBps+dvLusV+eNQATqgA/HdeKFVgA5v3S/cIrLF7QnIg==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
  <style>
    /* Print-specific styles */
    body {
      font-family: 'Times New Roman', Times, serif;
      line-height: 1.5;
      color: #000;
      margin: 0;
      padding: 0;
    }
    
    .download-container {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background: #f8f9fa;
      padding: 15px;
      text-align: center;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      z-index: 1000;
    }
    
    .download-button {
      background-color: #4361ee;
      color: white;
      border: none;
      padding: 10px 20px;
      font-size: 16px;
      border-radius: 4px;
      cursor: pointer;
    }
    
    .document-container {
      width: 21cm;
      min-height: 29.7cm;
      padding: 2cm;
      margin: 80px auto;
      background: white;
      box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    }
    
    @media print {
      .download-container {
        display: none;
      }
      
      .document-container {
        margin: 0;
        padding: 0;
        width: 100%;
        box-shadow: none;
      }
    }
  </style>
</head>
<body>
  <div class="download-container">
    <button class="download-button" id="downloadPdf">Download as PDF</button>
    <span style="margin-left: 10px; font-size: 14px;">or press Ctrl+P to print</span>
  </div>

  <div class="document-container" id="documentContent">
    ${bodyContent}
  </div>

  <script>
    document.getElementById('downloadPdf').addEventListener('click', function() {
      var element = document.getElementById('documentContent');
      var opt = {
        margin: [0.5, 0.5, 0.5, 0.5],
        filename: '${filename}.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
      };
      
      // Generate and download PDF
      html2pdf().set(opt).from(element).save();
    });
  </script>
</body>
</html>`;
} 