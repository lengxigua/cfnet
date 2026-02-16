import type { MetadataRoute } from 'next';

/**
 * Web App Manifest for PWA support
 * Customize name, icons, and theme colors for your application
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: '{{SITE_NAME}}',
    short_name: '{{SHORT_NAME}}',
    description: '{{SITE_DESCRIPTION}}',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#000000',
    icons: [
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
