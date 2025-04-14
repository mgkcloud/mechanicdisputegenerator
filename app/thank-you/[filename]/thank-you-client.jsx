'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { CheckCircle, FileText, Download, AlertTriangle } from 'lucide-react';

// Helper function to format document type from filename (can stay here or be moved to utils)
function formatDocumentType(filename) {
  if (!filename) return 'Document';
  const parts = filename.split('_');
  if (parts.length > 2) {
    return parts.slice(1, -1).join(' ').replace(/_/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  }
  return 'Legal Document';
}

export default function ThankYouClientContent({ originalFilename }) { // Receive filename as prop
  const documentType = formatDocumentType(originalFilename);
  const router = useRouter();

  const [isRegenerating, setIsRegenerating] = useState(false);
  const [regenerationError, setRegenerationError] = useState(null);

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    setRegenerationError(null);
    console.log(`Initiating regeneration for: ${originalFilename}`);

    try {
      const response = await fetch('/api/regenerate-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ originalFilename }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to regenerate document.');
      }
      const newFilename = data.filename;
      console.log(`Regeneration successful. New filename: ${newFilename}`);
      router.push(`/thank-you/${newFilename}`);
    } catch (error) {
      console.error('Regeneration failed:', error);
      setRegenerationError(error.message || 'An unexpected error occurred during regeneration.');
    } finally {
      setIsRegenerating(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-lg shadow-lg">
        <CardHeader className="text-center">
          <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
          <CardTitle className="text-2xl font-bold">Document Ready!</CardTitle>
          <CardDescription>Your {documentType} has been generated successfully.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-center space-x-4">
            <Link href={`/documents/view/${originalFilename}`} passHref legacyBehavior>
              <Button variant="outline" asChild>
                <a><FileText className="mr-2 h-4 w-4" /> View Document</a>
              </Button>
            </Link>
            <Link href={`/documents/download/${originalFilename}`} passHref legacyBehavior>
              <Button asChild>
                <a><Download className="mr-2 h-4 w-4" /> Download Document</a>
              </Button>
            </Link>
          </div>
          <div className="pt-4 text-center border-t mt-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Need to make changes? You can regenerate the document with the same input data.
            </p>
            <Button 
              onClick={handleRegenerate}
              disabled={isRegenerating}
              variant="secondary"
            >
              {isRegenerating ? 'Regenerating...' : 'Regenerate Document'}
            </Button>
            {regenerationError && (
              <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm flex items-center">
                <AlertTriangle className="h-4 w-4 mr-2 flex-shrink-0" />
                <span>Error: {regenerationError}</span>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="text-xs text-center text-gray-500 dark:text-gray-400">
          <p>Remember to review the document carefully. This service is not a substitute for professional legal advice.</p>
        </CardFooter>
      </Card>
    </div>
  );
} 