import { getDocumentTypeName } from "@/lib/thank-you"
import Link from "next/link"

// Metadata for the page
export const metadata = {
  title: "Document Confirmation | Australian Mechanic Dispute Resolution",
  description: "Thank you for generating your legal document for Australian mechanic disputes.",
}

/**
 * Get document metadata for the server-side props
 * @param {string} filename - Document filename
 */
async function getDocumentMetadata(filename) {
  try {
    // In a real app, you would fetch metadata from your database or storage
    // For now, we'll just return a basic object

    // Try to extract document type from filename
    let documentType = "legal_document"
    if (filename.includes("letter_of_demand")) {
      documentType = "letter_of_demand"
    } else if (filename.includes("consumer_complaint")) {
      documentType = "consumer_complaint"
    } else if (filename.includes("vcat_application")) {
      documentType = "vcat_application"
    } else if (filename.includes("insurance_claim")) {
      documentType = "insurance_claim"
    }

    return {
      customerName: "Valued Customer", // In a real app, you would get this from storage metadata
      documentType,
      generatedDate: new Date().toISOString(),
    }
  } catch (error) {
    console.error(`Error fetching document metadata for ${filename}:`, error)
    return {
      customerName: "Valued Customer",
      documentType: "legal_document",
      generatedDate: new Date().toISOString(),
    }
  }
}

/**
 * Thank You page component
 * @param {Object} params - Route params including filename
 */
export default async function ThankYouPage({ params }) {
  const { filename } = params

  // Get document metadata
  const metadata = await getDocumentMetadata(filename)

  // URLs for viewing and downloading document
  const permanentUrl = `/api/documents/${filename}`
  const downloadUrl = `/api/documents/${filename}?download=true`

  // Format the date for display
  const date = new Date().toLocaleDateString("en-AU", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  // Get user-friendly document type name
  const documentTypeName = getDocumentTypeName(metadata.documentType)

  return (
    <>
      <header className="bg-[#0D2750] text-white py-10 px-4 text-center shadow-lg">
        <div className="container mx-auto max-w-7xl">
          <h1 className="text-4xl font-bold mb-4 tracking-tight">Australian Mechanic Dispute Resolution</h1>
          <p className="text-xl">Thank you for using our service</p>
        </div>
      </header>

      <main className="container mx-auto max-w-7xl py-8 px-4">
        <div className="card">
          <h2 className="text-2xl font-bold mb-6 text-[#0D2750]">Your Document Is Ready!</h2>
          <div className="alert alert-success">
            <p>
              <strong>Success!</strong> Your document has been generated and permanently stored.
            </p>
          </div>

          <p className="mb-4">Dear {metadata.customerName},</p>
          <p className="mb-6">
            Your {documentTypeName} has been successfully created on {date}. You can access your document using the
            links below at any time.
          </p>

          <div className="bg-white p-8 rounded-xl shadow-lg mb-8">
            <h3 className="text-xl font-semibold mb-4">Document Details</h3>

            <div className="p-6 rounded-xl mb-4 bg-[#E8EAEC] shadow-inner flex flex-col md:flex-row items-center">
              <div className="text-4xl text-[#3498db] mr-6">📄</div>
              <div className="flex-grow">
                <div className="font-bold mb-2">View Your Document Online</div>
                <p className="mb-2">
                  You can view your document in your browser at any time using this permanent link:
                </p>
                <div className="font-mono bg-gray-100 p-2 rounded-md text-sm break-all">{permanentUrl}</div>
              </div>
              <div className="mt-4 md:mt-0 md:ml-4">
                <Link href={permanentUrl} target="_blank" className="btn">
                  View
                </Link>
              </div>
            </div>

            <div className="p-6 rounded-xl mb-4 bg-[#E8EAEC] shadow-inner flex flex-col md:flex-row items-center">
              <div className="text-4xl text-[#3498db] mr-6">⬇️</div>
              <div className="flex-grow">
                <div className="font-bold mb-2">Download Your Document</div>
                <p className="mb-2">You can download a copy of your document to save on your device:</p>
                <div className="font-mono bg-gray-100 p-2 rounded-md text-sm break-all">{downloadUrl}</div>
              </div>
              <div className="mt-4 md:mt-0 md:ml-4">
                <Link href={downloadUrl} className="btn" download>
                  Download
                </Link>
              </div>
            </div>
          </div>

          <h3 className="text-xl font-semibold mb-4">What's Next?</h3>
          <p className="mb-4">Here are the recommended steps to take with your document:</p>
          <ol className="list-decimal ml-8 mb-6">
            <li className="mb-2">Review your document carefully to ensure all details are correct</li>
            <li className="mb-2">Print a copy for your records</li>
            <li className="mb-2">Send the document to the mechanic via registered mail or email</li>
            <li className="mb-2">Keep track of all communication with the mechanic</li>
            <li className="mb-2">Follow up after the specified response deadline</li>
          </ol>

          <Link href="/" className="btn">
            Create Another Document
          </Link>
        </div>
      </main>

      <footer className="bg-[#0D2750] text-white py-10 px-4 text-center mt-16 shadow-inner">
        <div className="container mx-auto max-w-7xl">
          <p className="mb-2">
            &copy; {new Date().getFullYear()} Australian Mechanic Dispute Resolution. All rights reserved.
          </p>
          <p>This service provides legal document templates and is not a substitute for professional legal advice.</p>
        </div>
      </footer>
    </>
  )
}
