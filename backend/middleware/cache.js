/**
 * Caching Middleware for Express
 * Optimized for Vercel Free Tier
 *
 * Features:
 * - In-memory caching (no external dependencies)
 * - HTTP cache headers
 * - Smart cache invalidation
 * - TTL (Time To Live) support
 * - Memory-efficient with size limits
 */

// In-memory cache store
// Using Map for O(1) lookups
const cacheStore = new Map();

// Cache statistics
const cacheStats = {
  hits: 0,
  misses: 0,
  sets: 0,
  deletes: 0,
};

// Configuration
const CACHE_CONFIG = {
  // Default TTL in milliseconds
  defaultTTL: 5 * 60 * 1000, // 5 minutes
  // Maximum cache size (number of entries)
  maxSize: 1000,
  // Cache size check interval (cleanup old entries)
  cleanupInterval: 10 * 60 * 1000, // 10 minutes
};

/**
 * Generate cache key from request
 */
function generateCacheKey(req) {
  const { path, query, user } = req;
  const queryString = JSON.stringify(query || {});
  const userId = user?.id || 'public';
  return `${path}:${queryString}:${userId}`;
}

/**
 * Clean up expired entries and enforce size limit
 */
function cleanupCache() {
  const now = Date.now();
  const entries = Array.from(cacheStore.entries());

  // Remove expired entries
  entries.forEach(([key, value]) => {
    if (value.expiresAt && value.expiresAt < now) {
      cacheStore.delete(key);
      cacheStats.deletes++;
    }
  });

  // If still over limit, remove oldest entries
  if (cacheStore.size > CACHE_CONFIG.maxSize) {
    const sortedEntries = Array.from(cacheStore.entries()).sort(
      (a, b) => (a[1].createdAt || 0) - (b[1].createdAt || 0),
    );

    const toRemove = sortedEntries.slice(
      0,
      cacheStore.size - CACHE_CONFIG.maxSize,
    );
    toRemove.forEach(([key]) => {
      cacheStore.delete(key);
      cacheStats.deletes++;
    });
  }
}

// Start cleanup interval
setInterval(cleanupCache, CACHE_CONFIG.cleanupInterval);

/**
 * Cache middleware factory
 * @param {Object} options - Cache options
 * @param {number} options.ttl - Time to live in milliseconds
 * @param {boolean} options.useETag - Use ETag for HTTP caching
 * @param {string[]} options.invalidateOn - Methods that invalidate cache (e.g., ['POST', 'PUT', 'DELETE'])
 */
export function cache(options = {}) {
  const {
    ttl = CACHE_CONFIG.defaultTTL,
    useETag = true,
    invalidateOn = ['POST', 'PUT', 'DELETE', 'PATCH'],
  } = options;

  return async (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      // Invalidate cache for write operations
      if (invalidateOn.includes(req.method)) {
        invalidateCache(req.path);
      }
      return next();
    }

    const cacheKey = generateCacheKey(req);
    const cached = cacheStore.get(cacheKey);

    // Check if cache exists and is valid
    if (cached && (!cached.expiresAt || cached.expiresAt > Date.now())) {
      cacheStats.hits++;

      // Set HTTP cache headers
      if (useETag && cached.etag) {
        res.setHeader('ETag', cached.etag);

        // Check if client has cached version
        const clientETag = req.headers['if-none-match'];
        if (clientETag === cached.etag) {
          return res.status(304).end(); // Not Modified
        }
      }

      // Set cache control headers
      const maxAge = Math.floor((cached.expiresAt - Date.now()) / 1000);
      res.setHeader(
        'Cache-Control',
        `public, max-age=${maxAge}, stale-while-revalidate=60`,
      );
      res.setHeader('X-Cache', 'HIT');

      return res.json(cached.data);
    }

    // Cache miss - intercept response
    cacheStats.misses++;
    const originalJson = res.json.bind(res);

    res.json = function (data) {
      // Only cache successful responses
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const expiresAt = Date.now() + ttl;
        const etag = useETag ? generateETag(data) : null;

        cacheStore.set(cacheKey, {
          data,
          expiresAt,
          createdAt: Date.now(),
          etag,
        });

        cacheStats.sets++;

        // Set cache headers
        const maxAge = Math.floor(ttl / 1000);
        res.setHeader(
          'Cache-Control',
          `public, max-age=${maxAge}, stale-while-revalidate=60`,
        );
        res.setHeader('X-Cache', 'MISS');

        if (etag) {
          res.setHeader('ETag', etag);
        }
      }

      return originalJson(data);
    };

    next();
  };
}

/**
 * Generate ETag from data
 */
function generateETag(data) {
  const str = JSON.stringify(data);
  // Simple hash function (for production, consider using crypto)
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return `"${Math.abs(hash).toString(16)}"`;
}

/**
 * Invalidate cache for a specific path pattern
 */
export function invalidateCache(pathPattern) {
  const keysToDelete = [];

  cacheStore.forEach((value, key) => {
    if (key.startsWith(pathPattern)) {
      keysToDelete.push(key);
    }
  });

  keysToDelete.forEach((key) => {
    cacheStore.delete(key);
    cacheStats.deletes++;
  });

  return keysToDelete.length;
}

/**
 * Clear all cache
 */
export function clearCache() {
  const size = cacheStore.size;
  cacheStore.clear();
  cacheStats.deletes += size;
  return size;
}

/**
 * Get cache statistics
 */
export function getCacheStats() {
  return {
    ...cacheStats,
    size: cacheStore.size,
    hitRate:
      cacheStats.hits + cacheStats.misses > 0
        ? (
            (cacheStats.hits / (cacheStats.hits + cacheStats.misses)) *
            100
          ).toFixed(2) + '%'
        : '0%',
  };
}

/**
 * Pre-configured cache middleware for common use cases
 */
export const cacheMiddleware = {
  // Short cache (1 minute) - for frequently changing data
  short: cache({ ttl: 60 * 1000 }),

  // Medium cache (5 minutes) - default for most GET endpoints
  medium: cache({ ttl: 5 * 60 * 1000 }),

  // Long cache (15 minutes) - for static/semi-static data
  long: cache({ ttl: 15 * 60 * 1000 }),

  // Very long cache (1 hour) - for truly static data
  veryLong: cache({ ttl: 60 * 60 * 1000 }),

  // No HTTP caching (only in-memory)
  memoryOnly: cache({ useETag: false }),
};
