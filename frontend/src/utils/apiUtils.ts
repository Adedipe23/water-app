// Cache for API responses
interface CacheItem<T> {
  data: T;
  timestamp: number;
}

const apiCache: Record<string, CacheItem<any>> = {};
const pendingRequests: Record<string, Promise<any>> = {};

// Cache expiration time (5 minutes)
const CACHE_EXPIRATION = 5 * 60 * 1000;

// Debounce time (500ms)
const DEBOUNCE_TIME = 500;

// Last fetch timestamps for throttling
const lastFetchTimes: Record<string, number> = {};

/**
 * Fetch data with caching, debouncing, and request deduplication
 */
export async function fetchWithCache<T>(
  key: string,
  fetchFn: () => Promise<T>,
  options: {
    forceRefresh?: boolean;
    cacheDuration?: number;
    debounceTime?: number;
  } = {}
): Promise<T> {
  const {
    forceRefresh = false,
    cacheDuration = CACHE_EXPIRATION,
    debounceTime = DEBOUNCE_TIME,
  } = options;

  // Check if we need to throttle this request
  const now = Date.now();
  const lastFetch = lastFetchTimes[key] || 0;
  if (now - lastFetch < debounceTime) {
    // Return cached data if available
    if (apiCache[key] && !forceRefresh) {
      return apiCache[key].data;
    }
    
    // If no cached data, wait for the debounce period
    await new Promise(resolve => setTimeout(resolve, debounceTime - (now - lastFetch)));
  }
  
  // Update last fetch time
  lastFetchTimes[key] = now;

  // Check cache first
  if (!forceRefresh && apiCache[key] && now - apiCache[key].timestamp < cacheDuration) {
    return apiCache[key].data;
  }

  // Check if there's already a pending request for this key
  if (pendingRequests[key]) {
    return pendingRequests[key];
  }

  // Make the request and cache the promise
  const requestPromise = fetchFn()
    .then(data => {
      // Cache the result
      apiCache[key] = {
        data,
        timestamp: Date.now(),
      };
      // Remove from pending requests
      delete pendingRequests[key];
      return data;
    })
    .catch(error => {
      // Remove from pending requests on error
      delete pendingRequests[key];
      throw error;
    });

  pendingRequests[key] = requestPromise;
  return requestPromise;
}

/**
 * Clear cache for a specific key or all cache if no key provided
 */
export function clearCache(key?: string): void {
  if (key) {
    delete apiCache[key];
  } else {
    Object.keys(apiCache).forEach(k => delete apiCache[k]);
  }
}
