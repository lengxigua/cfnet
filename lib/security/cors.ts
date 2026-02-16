import { NextRequest, NextResponse } from 'next/server';

/**
 * CORS Configuration
 * Supports ALLOWED_ORIGINS environment variable for origin control
 */

/**
 * Get allowed origins from environment variable
 * Format: comma-separated list, "*" allows all origins
 */
function getAllowedOrigins(): string[] {
  const origins = process.env.ALLOWED_ORIGINS || '*';
  if (origins === '*') return ['*'];
  return origins
    .split(',')
    .map(o => o.trim())
    .filter(Boolean);
}

/**
 * Check if origin is allowed
 */
function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return false;
  const allowed = getAllowedOrigins();
  if (allowed.includes('*')) return true;
  return allowed.includes(origin);
}

/**
 * Apply CORS headers to response
 */
export function applyCorsHeaders(request: NextRequest, response: NextResponse): NextResponse {
  const origin = request.headers.get('origin');

  if (origin && isOriginAllowed(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
  } else if (getAllowedOrigins().includes('*')) {
    response.headers.set('Access-Control-Allow-Origin', '*');
  }

  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  response.headers.set(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, X-CSRF-Token, X-Request-ID'
  );
  response.headers.set('Access-Control-Max-Age', '86400');
  response.headers.set('Access-Control-Allow-Credentials', 'true');

  return response;
}

/**
 * Handle OPTIONS preflight request
 */
export function handlePreflight(request: NextRequest): NextResponse {
  const response = new NextResponse(null, { status: 204 });
  return applyCorsHeaders(request, response);
}

/**
 * Check if request is a CORS preflight
 */
export function isPreflightRequest(request: NextRequest): boolean {
  return (
    request.method === 'OPTIONS' &&
    request.headers.has('origin') &&
    request.headers.has('access-control-request-method')
  );
}
