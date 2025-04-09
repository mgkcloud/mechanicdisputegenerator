/**
 * HTML to DOCX converter utility
 */
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from "docx";
import { JSDOM } from "jsdom";

/**
 * Convert HTML to DOCX format
 * @param {string} html - HTML content to convert
 * @param {Object} metadata - Document metadata
 * @param {string} metadata.title - Document title
 * @param {string} metadata.subject - Document subject
 * @param {string} metadata.creator - Document creator
 * @returns {Promise<Buffer>} - DOCX document as buffer
 */
export async function htmlToDocx(html, metadata = {}) {
  try {
    console.log("Starting HTML to DOCX conversion");
    
    // Create a basic document if input is empty
    if (!html || html.trim() === '') {
      console.log("Empty HTML provided, creating basic document");
      return createBasicDocument(metadata);
    }
    
    // Parse HTML using JSDOM
    const dom = new JSDOM(html);
    const document = dom.window.document;
    
    // Create a new Word document
    const doc = new Document({
      title: metadata.title || "Document",
      subject: metadata.subject || "",
      creator: metadata.creator || "System",
      description: metadata.description || "",
      sections: [], // Initialize with empty sections array
    });
    
    // Set of paragraphs to add to the document
    const docElements = [];
    
    try {
      // Try to extract content based on document classes
      extractStructuredContent(document, docElements);
    } catch (extractError) {
      console.log("Error in structured extraction, falling back to basic extraction", extractError);
      // If structured extraction fails, fall back to basic extraction
      extractBasicContent(document, docElements);
    }
    
    // If no content was extracted, create a fallback paragraph
    if (docElements.length === 0) {
      console.log("No content extracted, using fallback content");
      docElements.push(createFallbackParagraph(metadata.title || "Document"));
    }
    
    // Add section with content to the document
    doc.addSection({
      properties: {
        page: {
          margin: {
            top: 1440, // 1 inch top margin
            right: 1440, // 1 inch right margin
            bottom: 1440, // 1 inch bottom margin
            left: 1440, // 1 inch left margin
          },
        },
      },
      children: docElements,
    });
    
    console.log("Document created successfully, generating buffer");
    // Generate the DOCX file as a buffer
    return await Packer.toBuffer(doc);
  } catch (error) {
    console.error("Error converting HTML to DOCX:", error);
    // If all else fails, return a very basic document
    console.log("Fatal error, returning emergency basic document");
    return createEmergencyDocument(metadata);
  }
}

/**
 * Extract content from HTML using structured selectors
 * @param {Document} document - JSDOM document
 * @param {Array} docElements - Array to populate with paragraphs
 */
function extractStructuredContent(document, docElements) {
  // Process document title
  const titleElement = document.querySelector(".document-title");
  if (titleElement) {
    docElements.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({
            text: titleElement.textContent || "",
            bold: true,
            size: 32, // 16pt
          }),
        ],
      })
    );
  }
  
  // Process document subtitle
  const subtitleElement = document.querySelector(".document-subtitle");
  if (subtitleElement) {
    docElements.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: {
          after: 240, // Extra spacing after subtitle
        },
        children: [
          new TextRun({
            text: subtitleElement.textContent || "",
            size: 28, // 14pt
          }),
        ],
      })
    );
  }
  
  // Process document date
  const dateElement = document.querySelector(".document-date");
  if (dateElement) {
    docElements.push(
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        spacing: {
          after: 400, // Extra spacing after date
        },
        children: [
          new TextRun({
            text: dateElement.textContent || "",
            size: 24, // 12pt
          }),
        ],
      })
    );
  }
  
  // Process all paragraphs in the document
  const paragraphs = document.querySelectorAll(".document-paragraph, .document-header, .document-bullet, .document-signature");
  
  paragraphs.forEach((element) => {
    let paragraph;
    const textContent = element.textContent || "";
    
    if (element.classList.contains("document-header")) {
      // Header elements
      paragraph = new Paragraph({
        heading: HeadingLevel.HEADING_2,
        spacing: {
          before: 240,
          after: 120,
        },
        children: [
          new TextRun({
            text: textContent,
            bold: true,
            size: 28, // 14pt
          }),
        ],
      });
    } 
    else if (element.classList.contains("document-bullet")) {
      // Bullet points
      let bulletText = textContent;
      
      // Remove bullet character if present
      bulletText = bulletText.replace(/^[•\-*]\s*/, "");
      
      paragraph = new Paragraph({
        bullet: {
          level: 0,
        },
        indent: {
          left: 720, // 0.5 inch left indent
        },
        children: [
          new TextRun({
            text: bulletText,
            size: 24, // 12pt
          }),
        ],
      });
    }
    else if (element.classList.contains("document-signature")) {
      // Signature line
      paragraph = new Paragraph({
        spacing: {
          before: 360,
          after: 360,
        },
        children: [
          new TextRun({
            text: textContent,
            size: 24, // 12pt
          }),
        ],
      });
    }
    else {
      // Regular paragraph
      paragraph = new Paragraph({
        indent: {
          firstLine: 720, // 0.5 inch first line indent
        },
        spacing: {
          after: 120,
        },
        children: [
          new TextRun({
            text: textContent,
            size: 24, // 12pt
          }),
        ],
      });
    }
    
    docElements.push(paragraph);
  });
}

/**
 * Extract basic content from HTML by processing all paragraphs
 * @param {Document} document - JSDOM document
 * @param {Array} docElements - Array to populate with paragraphs
 */
function extractBasicContent(document, docElements) {
  // Find the body element
  const bodyContent = document.body ? document.body.textContent : document.documentElement.textContent;
  
  // Split content by double newlines to simulate paragraphs
  const paragraphs = bodyContent.split(/\n\s*\n/).filter(p => p.trim() !== '');
  
  // Create a paragraph for each text block
  paragraphs.forEach((text) => {
    docElements.push(
      new Paragraph({
        children: [
          new TextRun({
            text: text.trim(),
            size: 24, // 12pt
          }),
        ],
      })
    );
  });
}

/**
 * Create a fallback paragraph in case no content is found
 * @param {string} title - Document title
 * @returns {Paragraph} - Fallback paragraph
 */
function createFallbackParagraph(title) {
  return new Paragraph({
    children: [
      new TextRun({
        text: `${title || 'Document'} - No content could be extracted from the HTML.`,
        size: 24, // 12pt
      }),
    ],
  });
}

/**
 * Create a basic document with minimal content when HTML parsing fails
 * @param {Object} metadata - Document metadata
 * @returns {Promise<Buffer>} - DOCX document as buffer
 */
async function createBasicDocument(metadata) {
  const doc = new Document({
    title: metadata.title || "Document",
    subject: metadata.subject || "",
    creator: metadata.creator || "System",
    description: metadata.description || "",
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440,
              right: 1440,
              bottom: 1440,
              left: 1440,
            },
          },
        },
        children: [
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: metadata.title || "Document",
                bold: true,
                size: 32,
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `Created by: ${metadata.creator || "System"}`,
                size: 24,
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `Creation Date: ${new Date().toLocaleDateString()}`,
                size: 24,
              }),
            ],
          }),
        ],
      },
    ],
  });
  
  return await Packer.toBuffer(doc);
}

/**
 * Create an emergency document when all else fails
 * @param {Object} metadata - Document metadata
 * @returns {Promise<Buffer>} - DOCX document as buffer
 */
async function createEmergencyDocument(metadata) {
  try {
    const doc = new Document({
      sections: [
        {
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: "Emergency Document - Conversion Failed",
                  bold: true,
                }),
              ],
            }),
          ],
        },
      ],
    });
    
    return await Packer.toBuffer(doc);
  } catch (error) {
    console.error("Emergency document creation failed:", error);
    throw new Error("Complete failure in document creation");
  }
} 