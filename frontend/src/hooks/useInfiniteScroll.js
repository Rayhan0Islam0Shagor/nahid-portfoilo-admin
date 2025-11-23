import { useEffect, useRef, useCallback } from 'react';

/**
 * Custom hook for infinite scroll
 * @param {Function} loadMore - Function to call when more items should be loaded
 * @param {boolean} hasMore - Whether there are more items to load
 * @param {boolean} isLoading - Whether data is currently loading
 * @param {Object} options - Configuration options
 * @param {number} options.threshold - Distance from bottom to trigger load (default: 200px)
 * @param {number} options.rootMargin - Root margin for Intersection Observer
 */
export function useInfiniteScroll(loadMore, hasMore, isLoading, options = {}) {
  const { threshold = 200, rootMargin = '0px' } = options;
  const observerTarget = useRef(null);

  const handleObserver = useCallback(
    (entries) => {
      const [target] = entries;
      if (target.isIntersecting && hasMore && !isLoading) {
        loadMore();
      }
    },
    [hasMore, isLoading, loadMore],
  );

  useEffect(() => {
    const element = observerTarget.current;
    if (!element) return;

    const observer = new IntersectionObserver(handleObserver, {
      rootMargin: `${threshold}px ${rootMargin}`,
      threshold: 0.1,
    });

    observer.observe(element);

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [handleObserver, threshold, rootMargin]);

  return observerTarget;
}

