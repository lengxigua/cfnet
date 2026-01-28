/**
 * Library Index
 * Centralized export for all library modules
 *
 * This provides a single import point for commonly used utilities,
 * reducing the number of import statements needed in application code.
 */

// =============================================================================
// API Utilities
// =============================================================================
export {
  withRepositories,
  successResponse,
  createdResponse,
  noContentResponse,
  errorResponse,
  paginatedResponse,
  withRateLimit,
  getRateLimitStatus,
} from './api';

// =============================================================================
// Error Types
// =============================================================================
export {
  ErrorType,
  ERROR_STATUS_MAP,
  AppError,
  DatabaseError,
  DatabaseQueryError,
  FileError,
  ValidationError,
  AuthenticationError,
  ResourceNotFoundError,
  BusinessLogicError,
  ExternalServiceError,
  isOperationalError,
  createAppErrorFromNative,
} from './errors';

// =============================================================================
// Validators
// =============================================================================
export {
  validateEmail,
  validateIntegerId,
  parseAndValidateBody,
  EMAIL_REGEX,
  emailSchema,
  optionalNameSchema,
  simplePasswordSchema,
  userCreateSchema,
  userUpdateSchema,
  userRegistrationSchema,
} from './validators';

// =============================================================================
// Rate Limiting
// =============================================================================
export {
  checkRateLimit,
  checkUploadRateLimit,
  checkDownloadRateLimit,
  checkRegistrationRateLimit,
  checkLoginRateLimit,
  checkPasswordResetRateLimit,
  checkApiRateLimit,
} from './rate-limiter';
export type { RateLimitConfig, RateLimitResult } from './rate-limiter';

// =============================================================================
// Cache
// =============================================================================
export {
  CACHE_KEYS,
  CACHE_TTL,
  CacheClient,
  createCacheClient,
  getKVNamespace,
  withCache,
  invalidateUserCache,
  invalidatePostCache,
  invalidateSubscriptionCache,
  invalidateCacheKeys,
} from './cache/client';

// =============================================================================
// Database
// =============================================================================
export { prisma, getCloudflareEnv } from './db/client';

// =============================================================================
// HTTP Client
// =============================================================================
export { httpClient, http, ApiError } from './http';
export type { ApiSuccessResponse, ApiErrorResponse, ApiResponse } from './http';

// =============================================================================
// Logger
// =============================================================================
export { logger, LogLevel } from './logger';

// =============================================================================
// Analytics
// =============================================================================
export { analytics, AnalyticsEventType, AnalyticsClient } from './analytics';

// =============================================================================
// Signed URLs
// =============================================================================
export { generateSignedUrl, verifySignedUrl, createSignedDownloadUrl } from './signed-url';

// =============================================================================
// Utilities
// =============================================================================
export { cn } from './utils';
