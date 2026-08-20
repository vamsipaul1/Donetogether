/**
 * High-performance route preloading helper.
 * Call this function on link hover to instruct the browser to prefetch 
 * the dynamic component chunks in the background, making transitions instant.
 */
export const preloadRoute = (importFn: () => Promise<any>) => {
  try {
    const promise = importFn();
    // Silently catch load errors to avoid console noise during background prefetches
    if (promise && typeof promise.catch === "function") {
      promise.catch(() => {});
    }
  } catch (error) {
    // Fail silently in background
  }
};
