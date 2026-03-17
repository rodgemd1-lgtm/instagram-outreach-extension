// X API Rate Limiter — Token-bucket style, in-memory
//
// Serverless-safe: each cold start resets the buckets, which is the safe
// direction (we only risk under-counting, never over-counting).
//
// Limits are based on X API v2 Free/Basic tier rate windows (15 minutes).

interface BucketConfig {
  maxRequests: number;
  windowMs: number;
}

interface BucketState {
  requests: number[];  // timestamps of requests within the current window
}

// -----------------------------------------------------------------------
// Endpoint rate limits (X API v2)
// -----------------------------------------------------------------------

const ENDPOINT_LIMITS: Record<string, BucketConfig> = {
  "search/recent":       { maxRequests: 180, windowMs: 15 * 60 * 1000 },
  "users/:id/tweets":    { maxRequests: 900, windowMs: 15 * 60 * 1000 },
  "tweets":              { maxRequests: 200, windowMs: 15 * 60 * 1000 },
  "dm_conversations":    { maxRequests: 200, windowMs: 15 * 60 * 1000 },
};

const DEFAULT_LIMIT: BucketConfig = { maxRequests: 300, windowMs: 15 * 60 * 1000 };

// -----------------------------------------------------------------------
// In-memory state — one bucket per endpoint key
// -----------------------------------------------------------------------

const buckets = new Map<string, BucketState>();

// -----------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------

/**
 * Resolve a raw URL/path to a canonical endpoint key used for rate limiting.
 * Accepts full URLs, relative paths, or short keys like "search/recent".
 */
function resolveEndpointKey(endpoint: string): string {
  // Strip protocol + host if present
  const path = endpoint.replace(/^https?:\/\/[^/]+/, "");

  if (path.includes("/tweets/search/recent") || endpoint === "search/recent") {
    return "search/recent";
  }
  if (/\/users\/[^/]+\/tweets/.test(path) || endpoint === "users/:id/tweets") {
    return "users/:id/tweets";
  }
  if (
    (path.endsWith("/tweets") && !path.includes("search")) ||
    endpoint === "tweets"
  ) {
    return "tweets";
  }
  if (path.includes("/dm_conversations") || endpoint === "dm_conversations") {
    return "dm_conversations";
  }

  return endpoint; // fall through — uses default limit
}

function getConfig(key: string): BucketConfig {
  return ENDPOINT_LIMITS[key] ?? DEFAULT_LIMIT;
}

function getBucket(key: string): BucketState {
  let bucket = buckets.get(key);
  if (!bucket) {
    bucket = { requests: [] };
    buckets.set(key, bucket);
  }
  return bucket;
}

/** Remove timestamps older than the current window from the bucket. */
function pruneExpired(bucket: BucketState, windowMs: number): void {
  const cutoff = Date.now() - windowMs;
  // Since timestamps are monotonically increasing, find the first valid index.
  let firstValid = 0;
  while (firstValid < bucket.requests.length && bucket.requests[firstValid] < cutoff) {
    firstValid++;
  }
  if (firstValid > 0) {
    bucket.requests = bucket.requests.slice(firstValid);
  }
}

// -----------------------------------------------------------------------
// Public API
// -----------------------------------------------------------------------

export interface RateLimitResult {
  allowed: boolean;
  /** Milliseconds until the next slot opens. Only set when `allowed` is false. */
  retryAfter?: number;
  /** Current request count within the window. */
  currentCount: number;
  /** Maximum requests allowed in the window. */
  limit: number;
}

/**
 * Check whether a request to the given endpoint is allowed under the
 * current rate-limit window. Does NOT consume a slot — call `recordRequest`
 * after a successful HTTP call.
 */
export function checkRateLimit(endpoint: string): RateLimitResult {
  const key = resolveEndpointKey(endpoint);
  const config = getConfig(key);
  const bucket = getBucket(key);

  pruneExpired(bucket, config.windowMs);

  if (bucket.requests.length < config.maxRequests) {
    return { allowed: true, currentCount: bucket.requests.length, limit: config.maxRequests };
  }

  // Calculate when the oldest request in the window will expire
  const oldestInWindow = bucket.requests[0];
  const retryAfter = oldestInWindow + config.windowMs - Date.now();

  return {
    allowed: false,
    retryAfter: Math.max(retryAfter, 0),
    currentCount: bucket.requests.length,
    limit: config.maxRequests,
  };
}

/**
 * Record a successful request against the endpoint's rate-limit bucket.
 * Call this AFTER the HTTP request completes (so failed requests don't
 * consume budget, matching X API's own counting behavior).
 */
export function recordRequest(endpoint: string): void {
  const key = resolveEndpointKey(endpoint);
  const config = getConfig(key);
  const bucket = getBucket(key);

  pruneExpired(bucket, config.windowMs);
  bucket.requests.push(Date.now());
}

/**
 * Custom error thrown when a request is rate-limited.
 */
export class RateLimitError extends Error {
  readonly retryAfter: number;
  readonly endpoint: string;

  constructor(endpoint: string, retryAfter: number) {
    const retrySeconds = Math.ceil(retryAfter / 1000);
    super(
      `X API rate limit reached for "${endpoint}". ` +
      `Retry after ${retrySeconds}s. ` +
      `Consider spacing out requests or waiting for the 15-minute window to reset.`
    );
    this.name = "RateLimitError";
    this.endpoint = endpoint;
    this.retryAfter = retryAfter;
  }
}

/**
 * Convenience: check + throw in one call. Use this as a guard at the top
 * of any function that hits the X API.
 */
export function enforceRateLimit(endpoint: string): void {
  const result = checkRateLimit(endpoint);
  if (!result.allowed) {
    throw new RateLimitError(endpoint, result.retryAfter ?? 0);
  }
}

// -----------------------------------------------------------------------
// Testing / diagnostics helper
// -----------------------------------------------------------------------

/** Reset all in-memory buckets. Useful in tests. */
export function resetAllBuckets(): void {
  buckets.clear();
}
