/**
 * Feature Flag Management
 * Simple feature flag system based on environment variables and user ID percentage hashing
 *
 * Usage:
 *   if (isFeatureEnabled('NEW_DASHBOARD')) { ... }
 *   if (isFeatureEnabledForUser('BETA_FEATURE', userId)) { ... }
 *
 * Environment variable format:
 *   FEATURE_NEW_DASHBOARD=true                    // Global on/off
 *   FEATURE_BETA_FEATURE=50                       // 50% rollout
 *   FEATURE_EXPERIMENTAL=false                    // Disabled
 */

/**
 * Check if a feature is globally enabled
 * Reads from FEATURE_<name> environment variable
 *
 * @param name Feature name (case-insensitive, underscores added)
 * @returns true if feature is enabled
 */
export function isFeatureEnabled(name: string): boolean {
  const envKey = `FEATURE_${name.toUpperCase()}`;
  const value = process.env[envKey];

  if (!value) return false;

  // "true" = enabled, "false" = disabled
  if (value === 'true') return true;
  if (value === 'false') return false;

  // Numeric value = percentage rollout (always true for global check)
  const percent = parseInt(value, 10);
  return !isNaN(percent) && percent > 0;
}

/**
 * Check if a feature is enabled for a specific user
 * Uses deterministic hashing for consistent percentage-based rollout
 *
 * @param name Feature name
 * @param userId User identifier (string or number)
 * @returns true if feature is enabled for this user
 */
export function isFeatureEnabledForUser(name: string, userId: string | number): boolean {
  const envKey = `FEATURE_${name.toUpperCase()}`;
  const value = process.env[envKey];

  if (!value) return false;
  if (value === 'true') return true;
  if (value === 'false') return false;

  // Percentage-based rollout
  const percent = parseInt(value, 10);
  if (isNaN(percent)) return false;

  // Deterministic hash: same user always gets same result
  const hash = simpleHash(`${name}:${userId}`);
  const bucket = hash % 100;

  return bucket < percent;
}

/**
 * Simple deterministic hash function (djb2 algorithm)
 * Produces consistent results for the same input
 */
function simpleHash(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33 + str.charCodeAt(i)) >>> 0;
  }
  return hash;
}

/**
 * Get all enabled features (for debugging)
 */
export function getEnabledFeatures(): Record<string, string> {
  const features: Record<string, string> = {};

  for (const key of Object.keys(process.env)) {
    if (key.startsWith('FEATURE_')) {
      const value = process.env[key];
      if (value) {
        features[key] = value;
      }
    }
  }

  return features;
}
