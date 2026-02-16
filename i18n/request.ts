import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

/**
 * next-intl server configuration
 * Loads locale messages based on the current request
 */
export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  // Validate locale
  if (!locale || !routing.locales.includes(locale as 'en' | 'zh')) {
    locale = routing.defaultLocale;
  }

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
