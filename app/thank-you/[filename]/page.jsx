// This is now a Server Component

import React from 'react';
// Import the new Client Component
import ThankYouClientContent from './thank-you-client'; // Use relative path

// Metadata export is allowed in Server Components
export const metadata = {
  title: "Document Confirmation | Australian Mechanic Dispute Resolution",
  description: "Thank you for generating your legal document for Australian mechanic disputes.",
}

// Optional: If you need to fetch server-side data for the metadata or page,
// you could do it here, but the current metadata is static.
// async function getPageData(filename) { ... }

// Server Component: Renders the Client Component and passes data
// Mark the component as async to allow awaiting params if needed by Next.js
export default async function ThankYouPage({ params }) {
  // Destructure filename from params, awaiting as suggested by the error
  const resolvedParams = await params;
  const { filename } = resolvedParams;

  // Any server-side logic or data fetching would go here

  // Render the Client Component, passing the destructured filename
  return <ThankYouClientContent originalFilename={filename} />;
}
