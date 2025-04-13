/**
 * Dynamic robots.txt generation for Australian Mechanic Dispute Resolution
 * 
 * This file generates a robots.txt file for the website using Next.js App Router conventions.
 * It defines rules for search engine crawlers and includes a reference to the sitemap.
 * 
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots
 */

/**
 * Generates robots.txt content
 * @returns {Object} Robots.txt configuration
 */
export default function robots() {
  return {
    // Define the rules for all bots
    rules: {
      userAgent: '*',
      allow: ['/'],
      // Disallow private/sensitive areas - adjust as needed
      disallow: [
        '/api/',              // API endpoints
        '/documents/',        // User document view pages
        '/payment-success/',  // Payment confirmation page
        '/payment-cancelled/', // Payment cancellation page
        '/thank-you/',        // Thank you / document download pages
        '/test-route/',       // Test routes
      ],
    },
    // Add sitemap URL
    sitemap: 'https://mechanicdispute.com.au/sitemap.xml',
    // Add host directive for clarity
    host: 'https://mechanicdispute.com.au',
  };
} 