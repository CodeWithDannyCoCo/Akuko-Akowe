const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const cache = new Map();

export function getCachedData(key) {
  const cached = cache.get(key);
  if (!cached) return null;

  const { data, timestamp } = cached;
  if (Date.now() - timestamp > CACHE_DURATION) {
    cache.delete(key);
    return null;
  }

  return data;
}

export function setCachedData(key, data) {
  cache.set(key, {
    data,
    timestamp: Date.now(),
  });
}

export async function fetchWithCache(key, fetchFn, options = {}) {
  const { duration = CACHE_DURATION, forceFetch = false } = options;

  if (!forceFetch) {
    const cached = getCachedData(key);
    if (cached) return cached;
  }

  try {
    const data = await fetchFn();
    setCachedData(key, data);
    return data;
  } catch (error) {
    console.error("Cache fetch error:", error);
    throw error;
  }
}

// Prefetch common data
export function prefetchData(paths) {
  if (typeof window === "undefined") return;

  // Wait for the page to load
  window.addEventListener("load", () => {
    // Use requestIdleCallback for better performance
    if ("requestIdleCallback" in window) {
      window.requestIdleCallback(() => {
        paths.forEach((path) => {
          fetch(path).catch(() => {});
        });
      });
    } else {
      // Fallback for browsers that don't support requestIdleCallback
      setTimeout(() => {
        paths.forEach((path) => {
          fetch(path).catch(() => {});
        });
      }, 1000);
    }
  });
}
