/**
 * Dynamic sitemap generation for Australian Mechanic Dispute Resolution
 * 
 * This file generates a sitemap.xml file for the website using Next.js App Router conventions.
 * It includes all important pages with appropriate lastModified dates and priorities.
 * 
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap
 */

// Base URL of the website
const baseUrl = 'https://mechanicdispute.com.au';

// Last modification date for static pages - use actual deployment date if available
const staticPageLastModified = new Date().toISOString();

/**
 * Generates the sitemap for the website
 * @returns {Array} Array of sitemap entries
 */
export default function sitemap() {
  const mainPages = [
    {
      url: `${baseUrl}`,
      lastModified: staticPageLastModified,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/faq`,
      lastModified: staticPageLastModified,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/how-it-works`,
      lastModified: staticPageLastModified,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: staticPageLastModified,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: staticPageLastModified,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: staticPageLastModified,
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: staticPageLastModified,
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/disclaimer`,
      lastModified: staticPageLastModified,
      changeFrequency: 'yearly',
      priority: 0.4,
    },
    {
      url: `${baseUrl}/thank-you`,
      lastModified: staticPageLastModified,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];

  /**
   * NOTE: This is the place to add any dynamic pages to the sitemap.
   * For example, if we had blog posts or other dynamic content, we could fetch them here
   * and add them to the sitemap entries.
   * 
   * Example:
   * const blogPosts = await getBlogPosts();
   * const blogSitemapEntries = blogPosts.map(post => ({
   *   url: `${baseUrl}/blog/${post.slug}`,
   *   lastModified: post.updatedAt,
   *   changeFrequency: 'monthly',
   *   priority: 0.7,
   * }));
   * 
   * return [...mainPages, ...blogSitemapEntries];
   */

  return mainPages;
} 