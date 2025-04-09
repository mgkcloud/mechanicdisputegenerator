/**
 * PDF generator module for Next.js
 * Creates HTML formatted for PDF conversion/display
 */

/**
 * Generate HTML formatted for a document from text content
 * @param {string} text - The document text content
 * @param {string} businessName - Business name for the document
 * @param {string} documentType - Type of document
 * @returns {string} - HTML formatted document
 */
export function generatePdfHtml(text, businessName, documentType) {
  const currentDate = new Date().toLocaleDateString("en-AU", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  // Validate input text
  if (!text || typeof text !== "string") {
    console.error("Invalid text input:", text)
    text = "Error: Document generation failed. Please try again."
  }

  // Clean the text of any potential harmful or broken content
  try {
    // Remove any control characters that might corrupt the output
    text = text.replace(/[\x00-\x09\x0B\x0C\x0E-\x1F\x7F]/g, "")

    // Fix repeating date patterns
    text = text.replace(/(\d{1,2}\/\d{1,2}\/\d{4}){2,}/g, (match) => {
      return match.substring(0, 10) // Keep only the first date
    })
  } catch (error) {
    console.error("Error sanitizing text:", error)
    text = "Error sanitizing document text. Please regenerate the document."
  }

  // Process the text into HTML paragraphs
  let paragraphs
  try {
    paragraphs = text.split("\n")
  } catch (error) {
    console.error("Error splitting text into paragraphs:", error)
    paragraphs = ["Error processing document text. Please regenerate the document."]
  }

  let htmlContent = ""

  for (const para of paragraphs) {
    try {
      if (!para.trim()) continue

      // Encode the paragraph text for HTML to prevent XSS and rendering issues
      const safePara = para
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;")

      // Handle markdown-style headers (# Header)
      if (safePara.trim().startsWith("#")) {
        const headerText = safePara.replace(/#/g, "").trim()
        htmlContent += `<h2 class="document-header">${headerText}</h2>`
      }
      // Handle all-caps headers (HEADER)
      else if (safePara.trim() === safePara.trim().toUpperCase() && safePara.trim().length > 3) {
        htmlContent += `<h2 class="document-header">${safePara.trim()}</h2>`
      }
      // Handle bullet points
      else if (safePara.trim().startsWith("•") || safePara.trim().startsWith("-") || safePara.trim().startsWith("*")) {
        htmlContent += `<p class="document-bullet">${safePara.trim()}</p>`
      }
      // Handle signature lines
      else if (
        safePara.toLowerCase().includes("signature") ||
        safePara.toLowerCase().includes("sign") ||
        safePara.toLowerCase().includes("date:")
      ) {
        htmlContent += `<p class="document-signature">${safePara}</p>`
      }
      // Regular paragraph
      else {
        htmlContent += `<p class="document-paragraph">${safePara}</p>`
      }
    } catch (error) {
      console.error("Error processing paragraph:", error)
      htmlContent += `<p class="document-paragraph">Error processing paragraph.</p>`
    }
  }

  // Sanitize business name and document type for HTML
  const safeBusinessName = businessName
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")

  const safeDocumentType = documentType
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")

  // Create the full HTML document with styling
  const fullHtml = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${safeDocumentType} for ${safeBusinessName}</title>
    <style>
      body {
        font-family: 'Times New Roman', Times, serif;
        line-height: 1.5;
        color: #000;
        max-width: 800px;
        margin: 0 auto;
        padding: 40px;
      }
      .document-title {
        text-align: center;
        font-size: 18px;
        font-weight: bold;
        margin-bottom: 5px;
        color: #000066;
      }
      .document-subtitle {
        text-align: center;
        font-size: 16px;
        margin-bottom: 20px;
        color: #000066;
      }
      .document-date {
        text-align: right;
        font-size: 12px;
        color: #666;
        margin-bottom: 30px;
      }
      .document-header {
        font-size: 14px;
        font-weight: bold;
        margin-top: 20px;
        margin-bottom: 10px;
        color: #000066;
        border-bottom: 1px solid #eee;
        padding-bottom: 5px;
      }
      .document-paragraph {
        font-size: 12px;
        text-align: justify;
        margin-bottom: 10px;
        text-indent: 20px;
      }
      .document-bullet {
        font-size: 12px;
        margin-left: 30px;
        margin-bottom: 5px;
      }
      .document-signature {
        font-size: 12px;
        margin-top: 30px;
        margin-bottom: 30px;
      }
      @media print {
        body {
          padding: 0;
        }
        @page {
          margin: 2cm;
        }
      }
    </style>
  </head>
  <body>
    <div class="document-title">${safeDocumentType.toUpperCase()}</div>
    <div class="document-subtitle">For: ${safeBusinessName}</div>
    <div class="document-date">Date: ${currentDate}</div>
    
    ${htmlContent}
    
    <script>
      // Optional: Auto-print when loaded
      // window.onload = function() { window.print(); };
    </script>
  </body>
  </html>
  `

  return fullHtml
}
