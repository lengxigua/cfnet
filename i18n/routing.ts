import { defineRouting } from 'next-intl/routing';

/**
 * i18n routing configuration
 * Defines supported locales and default locale
 */
export const routing = defineRouting({
  locales: ['zh', 'en'],
  defaultLocale: 'zh',
});
