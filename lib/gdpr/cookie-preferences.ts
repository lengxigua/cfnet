/**
 * Cookie preference management for GDPR compliance
 * Stores user preferences in localStorage
 */

export interface CookiePreferences {
  necessary: boolean; // Always true - required for app functionality
  analytics: boolean; // Analytics and performance tracking
  marketing: boolean; // Marketing and advertising cookies
  updatedAt: string; // ISO timestamp of last update
}

const COOKIE_PREFERENCES_KEY = 'cookie_preferences';

/**
 * Default preferences (only necessary cookies)
 */
export const DEFAULT_PREFERENCES: CookiePreferences = {
  necessary: true,
  analytics: false,
  marketing: false,
  updatedAt: new Date().toISOString(),
};

/**
 * Get stored cookie preferences
 * Returns null if user hasn't made a choice yet
 */
export function getCookiePreferences(): CookiePreferences | null {
  if (typeof window === 'undefined') return null;

  try {
    const stored = localStorage.getItem(COOKIE_PREFERENCES_KEY);
    if (!stored) return null;
    return JSON.parse(stored) as CookiePreferences;
  } catch {
    return null;
  }
}

/**
 * Save cookie preferences
 */
export function saveCookiePreferences(
  preferences: Omit<CookiePreferences, 'necessary' | 'updatedAt'>
): void {
  if (typeof window === 'undefined') return;

  const fullPreferences: CookiePreferences = {
    ...preferences,
    necessary: true, // Always required
    updatedAt: new Date().toISOString(),
  };

  try {
    localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(fullPreferences));
  } catch {
    // localStorage may be unavailable in some contexts
  }
}

/**
 * Accept all cookies
 */
export function acceptAllCookies(): void {
  saveCookiePreferences({
    analytics: true,
    marketing: true,
  });
}

/**
 * Accept only necessary cookies
 */
export function acceptNecessaryCookies(): void {
  saveCookiePreferences({
    analytics: false,
    marketing: false,
  });
}

/**
 * Check if user has made a cookie choice
 */
export function hasUserConsented(): boolean {
  return getCookiePreferences() !== null;
}

/**
 * Check if a specific cookie category is allowed
 */
export function isCookieCategoryAllowed(
  category: keyof Omit<CookiePreferences, 'updatedAt'>
): boolean {
  const preferences = getCookiePreferences();
  if (!preferences) return category === 'necessary';
  return preferences[category];
}
