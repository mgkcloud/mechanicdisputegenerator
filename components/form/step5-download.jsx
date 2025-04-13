"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, AlertTriangle } from "lucide-react"
import { useState, useEffect } from "react"

// Check if we're running on the server
const isServer = typeof window === 'undefined';

/**
 * Safely get a property from an object
 * @param {Object} obj - The object to get a property from
 * @param {string} key - The key to access
 * @param {any} fallback - The fallback value if the property doesn't exist
 * @returns {any} - The property value or fallback
 */
const safeGet = (obj, key, fallback) => {
  if (!obj || typeof obj !== 'object') return fallback;
  return obj[key] !== undefined && obj[key] !== null ? obj[key] : fallback;
};

/**
 * The fifth and final step of the form process - Download document
 * Displays download options for the generated document
 */
export default function Step5Download({ documentData, onDownload }) {
  const [isDataValid, setIsDataValid] = useState(false);
  
  // Validate document data when the component mounts or documentData changes
  useEffect(() => {
    if (!documentData) {
      setIsDataValid(false);
      return;
    }
    
    // Check if document data has the necessary properties
    const hasDocumentType = !!safeGet(documentData, 'documentType', '');
    const hasPdfUrl = !!safeGet(documentData, 'pdfUrl', '');
    const hasDocxUrl = !!safeGet(documentData, 'docxUrl', '');
    
    setIsDataValid(hasDocumentType && (hasPdfUrl || hasDocxUrl));
  }, [documentData]);
  
  // During server-side rendering, render a minimal placeholder
  // This prevents the "Cannot read properties of undefined" error during prerendering
  if (isServer) {
    return (
      <div className="max-w-2xl mx-auto my-8">
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Your Document</CardTitle>
            <CardDescription>Loading document information...</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Client-side rendering with proper null checks
  if (!documentData || !isDataValid) {
    return (
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader className="bg-amber-50 dark:bg-amber-900/20">
            <div className="flex items-center justify-center mb-2">
              <AlertTriangle className="h-6 w-6 text-amber-500" />
            </div>
            <CardTitle>Document Not Found</CardTitle>
            <CardDescription>
              There was a problem retrieving your document. Please try again or contact support.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 text-center">
            <p className="text-sm text-muted-foreground mb-4">
              If you were in the middle of creating a document, please try the following:
            </p>
            <ul className="list-disc text-left mx-auto max-w-xs text-sm text-muted-foreground space-y-1">
              <li>Refresh the page</li>
              <li>Clear your browser cache</li>
              <li>Start over with a new document</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    )
  }
  
  // Safe document type to display
  const documentType = safeGet(documentData, 'documentType', 'Legal Document');

  const handleDownloadClick = (format) => {
    try {
      // Use the parent component's download handler which includes analytics tracking
      if (typeof onDownload === 'function') {
        onDownload(format);
      } else {
        // Fallback if no handler provided
        const url = safeGet(documentData, `${format}Url`, '');
        if (url) {
          window.open(url, '_blank');
        } else {
          console.warn(`No URL available for format: ${format}`);
        }
      }
    } catch (error) {
      console.error("Error during download:", error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto my-8">
      <Card className="shadow-lg">
        <CardHeader className="bg-green-50 dark:bg-green-900/20 border-b text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-800">
            <Check className="h-6 w-6 text-green-600 dark:text-green-300" />
          </div>
          <CardTitle className="text-2xl">Your Document is Ready!</CardTitle>
          <CardDescription className="text-base mt-2">
            Thank you for using our service. Your {documentType.toLowerCase()} has been generated successfully.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 pb-2">
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">Download Options</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Your document is available in multiple formats. Choose the one that works best for you.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {safeGet(documentData, 'pdfUrl', '') && (
                <div className="border rounded-lg p-4 bg-slate-50 dark:bg-slate-800/50">
                  <h4 className="font-medium mb-2">PDF Format</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Best for printing and sharing. Cannot be edited.
                  </p>
                  <Button 
                    variant="default" 
                    className="w-full"
                    onClick={() => handleDownloadClick('pdf')}
                  >
                    Download PDF
                  </Button>
                </div>
              )}
              
              {safeGet(documentData, 'docxUrl', '') && (
                <div className="border rounded-lg p-4 bg-slate-50 dark:bg-slate-800/50">
                  <h4 className="font-medium mb-2">Word Document</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Editable format. Make changes using Microsoft Word or similar.
                  </p>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => handleDownloadClick('docx')}
                  >
                    Download DOCX
                  </Button>
                </div>
              )}
            </div>
          </div>
          
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <h3 className="text-lg font-medium mb-2">What's Next?</h3>
            <ul className="list-disc pl-5 space-y-2 text-sm">
              <li>Review your document to ensure all information is accurate</li>
              <li>Print or save a copy for your records</li>
              <li>Send the document to the mechanic via registered post or email</li>
              <li>Wait for the response period as specified in your document</li>
              <li>If necessary, proceed with further legal action as outlined in your document</li>
            </ul>
          </div>
        </CardContent>
        <CardFooter className="border-t pt-4 text-center block">
          <p className="text-sm text-muted-foreground mb-2">
            Need further assistance? Contact our support team at support@mechanicdispute.com.au
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
