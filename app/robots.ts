import type { MetadataRoute } from 'next';

/**
 * Dynamic robots.txt generation
 * Controls search engine crawling behavior
 */
export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.SITE_URL || process.env.NEXTAUTH_URL || 'https://{{YOUR_DOMAIN}}';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/dashboard/', '/profile/', '/billing/', '/upload/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
