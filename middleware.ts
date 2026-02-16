/**
 * Middleware combining next-intl i18n routing, NextAuth authentication,
 * CORS, and CSRF protection
 *
 * Strategy: Default-protected - all routes require authentication unless explicitly public
 */

import { auth } from '@/lib/auth/config';
import createIntlMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { routing } from '@/i18n/routing';
import { isPreflightRequest, handlePreflight, applyCorsHeaders } from '@/lib/security/cors';
import { validateCsrfToken, ensureCsrfToken, csrfErrorResponse } from '@/lib/security/csrf';

// Create next-intl middleware handler
const handleI18nRouting = createIntlMiddleware(routing);

/**
 * Public paths that don't require authentication
 * These are checked WITHOUT locale prefix (the locale is stripped first)
 */
const publicPaths = [
  '/', // Home page
  '/privacy', // Privacy policy page
  '/terms', // Terms of service page
  '/login', // Login page
  '/register', // Register page
  '/pricing', // Pricing page
  '/checkout/cancel', // Checkout cancel page
];

/**
 * Auth-only pages (redirect away if already authenticated)
 */
const authPages = ['/login', '/register'];

/**
 * Strip locale prefix from pathname to get the actual route
 */
function stripLocale(pathname: string): string {
  const locales = routing.locales;
  for (const locale of locales) {
    if (pathname.startsWith(`/${locale}/`)) {
      return pathname.slice(`/${locale}`.length) || '/';
    }
    if (pathname === `/${locale}`) {
      return '/';
    }
  }
  return pathname;
}

export default auth(req => {
  const pathname = req.nextUrl.pathname;

  // Skip i18n for API routes - handle directly
  if (pathname.startsWith('/api/')) {
    // Handle CORS preflight
    if (isPreflightRequest(req)) {
      return handlePreflight(req);
    }
    // Validate CSRF for unsafe methods
    if (!validateCsrfToken(req)) {
      return csrfErrorResponse();
    }
    const response = NextResponse.next();
    return ensureCsrfToken(req, applyCorsHeaders(req, response));
  }

  // Handle CORS preflight for non-API routes
  if (isPreflightRequest(req)) {
    return handlePreflight(req);
  }

  // Validate CSRF token for unsafe methods on page routes
  if (!validateCsrfToken(req)) {
    return csrfErrorResponse();
  }

  // Apply i18n routing first
  const i18nResponse = handleI18nRouting(req as unknown as NextRequest);

  // Get the actual path without locale prefix for auth checks
  const actualPath = stripLocale(pathname);
  const isAuthenticated = !!req.auth;
  const isPublicPath = publicPaths.some(
    path => actualPath === path || actualPath.startsWith(path + '/')
  );
  const isAuthPage = authPages.some(
    path => actualPath === path || actualPath.startsWith(path + '/')
  );

  // Also allow API-like public paths at root level
  const isApiPublicPath = [
    '/api/auth',
    '/api/health',
    '/api/register',
    '/api/stripe/webhook',
    '/api/monitoring',
  ].some(path => pathname.startsWith(path));

  // If user is authenticated and trying to access auth pages, redirect to home
  if (isAuthenticated && isAuthPage) {
    const response = NextResponse.redirect(new URL('/', req.url));
    return ensureCsrfToken(req, applyCorsHeaders(req, response));
  }

  // If not authenticated and not public, redirect to login
  if (!isAuthenticated && !isPublicPath && !isApiPublicPath) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    const response = NextResponse.redirect(loginUrl);
    return ensureCsrfToken(req, applyCorsHeaders(req, response));
  }

  // Apply CORS and CSRF token to i18n response
  return ensureCsrfToken(req, applyCorsHeaders(req, i18nResponse));
});

// Configure routes where middleware should run
export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - files in the public folder (images, icons, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
