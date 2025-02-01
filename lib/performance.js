// Performance monitoring and optimization utilities
const PERFORMANCE_MARKS = {
  APP_LOAD: "app-load",
  FIRST_PAINT: "first-paint",
  FIRST_CONTENTFUL_PAINT: "first-contentful-paint",
  TIME_TO_INTERACTIVE: "time-to-interactive",
};

// Initialize performance monitoring
export function initPerformanceMonitoring() {
  if (typeof window === "undefined") return;

  // Mark app load time
  performance.mark(PERFORMANCE_MARKS.APP_LOAD);

  // Observer for paint timing
  if (PerformanceObserver) {
    const paintObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        // Log paint timing
        console.debug(`${entry.name}: ${entry.startTime}ms`);
        performance.mark(entry.name);
      }
    });

    paintObserver.observe({ entryTypes: ["paint"] });

    // Observer for long tasks
    const longTaskObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.duration > 50) {
          // Tasks longer than 50ms
          console.warn("Long task detected:", {
            duration: entry.duration,
            startTime: entry.startTime,
            name: entry.name,
          });
        }
      }
    });

    longTaskObserver.observe({ entryTypes: ["longtask"] });
  }
}

// Debounce function for performance optimization
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Throttle function for performance optimization
export function throttle(func, limit) {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// Measure component render time
export function measureRenderTime(Component) {
  return function WrappedComponent(props) {
    const startTime = performance.now();
    const result = Component(props);
    const endTime = performance.now();

    console.debug(
      `${Component.name || "Component"} render time: ${endTime - startTime}ms`
    );

    return result;
  };
}

// Optimize heavy calculations
export function memoizeCalculation(func) {
  const cache = new Map();

  return (...args) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }

    const result = func(...args);
    cache.set(key, result);
    return result;
  };
}
