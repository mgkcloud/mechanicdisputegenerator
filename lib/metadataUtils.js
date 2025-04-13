/**
 * Utility functions for generating metadata and SEO tags.
 */

/**
 * Returns the base URL for the site.
 * Uses NEXT_PUBLIC_BASE_URL environment variable, falling back to localhost.
 * @returns {string} The base URL.
 */
export function getBaseUrl() {
  return process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
}

const SITE_DEFAULTS = {
  title: "Australian Mechanic Dispute Resolution",
  description: "Generate professional legal documents for resolving disputes with mechanics in Australia",
  ogImage: `${getBaseUrl()}/og-image.png`,
  siteName: "Australian Mechanic Dispute Resolution",
  locale: "en_AU",
  twitterCard: "summary_large_image",
};

/**
 * Generates Open Graph metadata object.
 * @param {object} options - Options for OG metadata.
 * @param {string} [options.title] - Page-specific title.
 * @param {string} [options.description] - Page-specific description.
 * @param {string} [options.imageUrl] - Page-specific image URL.
 * @param {string} [options.type='website'] - OG type (e.g., article, website).
 * @returns {object} Open Graph metadata object.
 */
export function generateOpenGraph({ title, description, imageUrl, type = 'website' } = {}) {
  const effectiveTitle = title ? `${title} | ${SITE_DEFAULTS.siteName}` : SITE_DEFAULTS.title;
  const effectiveDescription = description || SITE_DEFAULTS.description;
  const effectiveImageUrl = imageUrl || SITE_DEFAULTS.ogImage;

  return {
    title: effectiveTitle,
    description: effectiveDescription,
    url: getBaseUrl(), // Consider making this dynamic per page if needed
    siteName: SITE_DEFAULTS.siteName,
    images: [
      {
        url: effectiveImageUrl,
        width: 1200,
        height: 630,
        alt: effectiveTitle,
      },
    ],
    locale: SITE_DEFAULTS.locale,
    type: type,
  };
}

/**
 * Generates Twitter card metadata object.
 * @param {object} options - Options for Twitter metadata.
 * @param {string} [options.title] - Page-specific title.
 * @param {string} [options.description] - Page-specific description.
 * @param {string} [options.imageUrl] - Page-specific image URL.
 * @returns {object} Twitter card metadata object.
 */
export function generateTwitterCard({ title, description, imageUrl } = {}) {
  const effectiveTitle = title ? `${title} | ${SITE_DEFAULTS.siteName}` : SITE_DEFAULTS.title;
  const effectiveDescription = description || SITE_DEFAULTS.description;
  const effectiveImageUrl = imageUrl || SITE_DEFAULTS.ogImage;

  return {
    card: SITE_DEFAULTS.twitterCard,
    title: effectiveTitle,
    description: effectiveDescription,
    images: [effectiveImageUrl],
    // Add site or creator handle if available
    // site: '@YourTwitterHandle',
    // creator: '@CreatorHandle',
  };
} 