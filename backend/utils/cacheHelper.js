/**
 * Cache Helper Utilities
 * Provides helper functions for cache management
 */

import {
  invalidateCache,
  clearCache,
  getCacheStats,
} from '../middleware/cache.js';

/**
 * Invalidate cache for specific routes
 */
export function invalidateRouteCache(route) {
  const patterns = [`/api/${route}`, `/api/${route}/`];

  let totalInvalidated = 0;
  patterns.forEach((pattern) => {
    totalInvalidated += invalidateCache(pattern);
  });

  return totalInvalidated;
}

/**
 * Invalidate cache for multiple routes
 */
export function invalidateMultipleRoutes(routes) {
  let total = 0;
  routes.forEach((route) => {
    total += invalidateRouteCache(route);
  });
  return total;
}

/**
 * Invalidate all API caches
 */
export function invalidateAllAPICache() {
  return invalidateCache('/api/');
}

/**
 * Get cache statistics endpoint handler
 */
export function getCacheStatsHandler(req, res) {
  const stats = getCacheStats();
  res.json({
    success: true,
    data: stats,
    message: 'Cache statistics retrieved successfully',
  });
}

/**
 * Clear all cache endpoint handler
 */
export function clearCacheHandler(req, res) {
  const cleared = clearCache();
  res.json({
    success: true,
    message: `Cleared ${cleared} cache entries`,
    data: { cleared },
  });
}
