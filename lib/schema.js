/**
 * Schema.org JSON-LD utilities for improved SEO and search engine understanding
 * 
 * This file contains utility functions to generate structured data (JSON-LD)
 * for various pages across the mechanic dispute resolution website.
 * 
 * Each function returns a properly formatted object that can be used with
 * Next.js's metadata API or directly in page components.
 */

/**
 * Generate Organization schema for the website
 * @param {Object} options - Organization details
 * @returns {Object} - Organization schema object
 */
export function generateOrganizationSchema(options = {}) {
  const {
    name = "Australian Mechanic Dispute Resolution",
    url = "https://mechanicdispute.com.au",
    logo = "https://mechanicdispute.com.au/logo.png",
    sameAs = [],
    description = "Professional legal document generation service for mechanic disputes in Australia.",
  } = options;

  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name,
    url,
    logo,
    description,
    ...(sameAs.length > 0 && { sameAs }),
  };
}

/**
 * Generate WebPage schema for any page
 * @param {Object} options - Page details
 * @returns {Object} - WebPage schema object
 */
export function generateWebPageSchema(options = {}) {
  const {
    name = "",
    description = "",
    url = "",
    datePublished = new Date().toISOString(),
    dateModified = new Date().toISOString(),
  } = options;

  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name,
    description,
    url,
    datePublished,
    dateModified,
  };
}

/**
 * Generate Service schema for detailing the mechanic dispute service
 * @param {Object} options - Service details
 * @returns {Object} - Service schema object
 */
export function generateServiceSchema(options = {}) {
  const {
    name = "Mechanic Dispute Resolution",
    description = "Professional document generation service for resolving disputes with mechanics in Australia.",
    provider = "Australian Mechanic Dispute Resolution",
    url = "https://mechanicdispute.com.au",
    areaServed = "Australia",
    serviceType = "Legal Document Generation",
    availableChannel = "https://mechanicdispute.com.au",
  } = options;

  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name,
    description,
    provider: {
      '@type': 'Organization',
      name: provider,
    },
    url,
    areaServed,
    serviceType,
    availableChannel: {
      '@type': 'ServiceChannel',
      serviceUrl: availableChannel,
    },
  };
}

/**
 * Generate FAQPage schema for FAQ page
 * @param {Array} faqs - Array of question/answer objects { question, answer }
 * @returns {Object} - FAQPage schema object
 */
export function generateFAQPageSchema(faqs = []) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  };
}

/**
 * Generate HowTo schema for process-based pages
 * @param {Object} options - HowTo details
 * @param {Array} steps - Array of step objects { name, text, url, image }
 * @returns {Object} - HowTo schema object
 */
export function generateHowToSchema(options = {}, steps = []) {
  const {
    name = "How to Resolve a Mechanic Dispute",
    description = "Step-by-step guide to resolving a dispute with a mechanic in Australia",
    totalTime = "PT30M", // ISO 8601 duration format
    estimatedCost = {
      currency: "AUD",
      value: "79.99"
    },
    supply = [],
    tool = [],
  } = options;

  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name,
    description,
    totalTime,
    estimatedCost: {
      '@type': 'MonetaryAmount',
      currency: estimatedCost.currency,
      value: estimatedCost.value
    },
    ...(supply.length > 0 && {
      supply: supply.map(item => ({
        '@type': 'HowToSupply',
        name: item
      }))
    }),
    ...(tool.length > 0 && {
      tool: tool.map(item => ({
        '@type': 'HowToTool',
        name: item
      }))
    }),
    step: steps.map((step, index) => ({
      '@type': 'HowToStep',
      url: step.url || undefined,
      image: step.image || undefined,
      name: step.name,
      itemListElement: {
        '@type': 'HowToDirection',
        text: step.text
      },
      position: index + 1
    }))
  };
}

/**
 * Generate Offer schema for service pricing
 * @param {Object} options - Offer details
 * @returns {Object} - Offer schema object
 */
export function generateOfferSchema(options = {}) {
  const {
    name = "",
    description = "",
    price = "0.00",
    priceCurrency = "AUD",
    availability = "https://schema.org/InStock",
    url = "",
    validFrom = new Date().toISOString(),
  } = options;

  return {
    '@context': 'https://schema.org',
    '@type': 'Offer',
    name,
    description,
    price,
    priceCurrency,
    availability,
    url,
    validFrom,
  };
}

/**
 * Combine multiple JSON-LD schemas into a single script
 * @param {Array} schemas - Array of schema objects to combine
 * @returns {Object} - Structured metadata object for Next.js
 */
export function generateJsonLd(schemas) {
  // Filter out any undefined or null schemas
  const validSchemas = schemas.filter(Boolean);
  
  if (validSchemas.length === 0) return null;
  
  // If only one schema, return it directly
  if (validSchemas.length === 1) {
    return {
      __html: JSON.stringify(validSchemas[0])
    };
  }
  
  // For multiple schemas, create an array of @graph objects
  const combined = {
    '@context': 'https://schema.org',
    '@graph': validSchemas.map(schema => {
      // Remove the @context from each individual schema when combining
      const { '@context': _, ...rest } = schema;
      return rest;
    })
  };
  
  return {
    __html: JSON.stringify(combined)
  };
}

/**
 * Create Next.js metadata object with JSON-LD schema
 * @param {Object} options - Metadata options
 * @param {Array} schemas - Array of schema objects
 * @returns {Object} - Complete Next.js metadata object
 */
export function createMetadataWithSchema(options = {}, schemas = []) {
  const {
    title = "Australian Mechanic Dispute Resolution",
    description = "Generate professional legal documents for resolving disputes with mechanics in Australia",
    url = "https://mechanicdispute.com.au",
    openGraph = {},
  } = options;

  const jsonLd = generateJsonLd(schemas);
  
  return {
    title,
    description,
    metadataBase: new URL(url),
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: "Australian Mechanic Dispute Resolution",
      locale: "en_AU",
      type: "website",
      ...openGraph,
    },
    ...(jsonLd && {
      jsonLd
    })
  };
} 