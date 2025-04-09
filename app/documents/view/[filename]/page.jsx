import { getDocument } from "@/lib/document-storage"

/**
 * Document viewer page component
 * 
 * @param {Object} props - Component props
 * @param {Promise<Object>} props.params - Route params
 * @param {string} props.params.filename - Document filename
 */
export default async function ViewDocumentPage(props) {
  const params = await props.params
  const { filename } = params
  
  // Get the document HTML
  const documentHtml = await getDocument(filename)
  
  // If no document is found, show an error
  if (!documentHtml) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-3xl font-bold text-red-600 mb-4">Document Not Found</h1>
        <p className="mb-4">The document you're looking for could not be found.</p>
        <a href="/" className="text-blue-600 hover:underline">Return to Home</a>
      </div>
    )
  }
  
  // Use dangerouslySetInnerHTML to render the document HTML
  return (
    <div 
      className="document-container" 
      dangerouslySetInnerHTML={{ __html: documentHtml }}
    />
  )
}

// Generate metadata for the page
export async function generateMetadata({ params }) {
  const { filename } = await params
  
  let documentType = "Legal Document"
  if (filename.includes("letter_of_demand")) {
    documentType = "Letter of Demand"
  } else if (filename.includes("consumer_complaint")) {
    documentType = "Consumer Complaint"
  } else if (filename.includes("vcat_application")) {
    documentType = "VCAT Application"
  } else if (filename.includes("insurance_claim")) {
    documentType = "Insurance Claim Support Letter"
  }
  
  return {
    title: `${documentType} | Australian Mechanic Dispute Resolution`,
    description: "View your legal document for Australian mechanic disputes."
  }
} 