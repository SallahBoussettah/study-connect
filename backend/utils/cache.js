/**
 * Cache utility functions
 */

/**
 * Get data from cache if available, otherwise fetch from DB and cache it
 * @param {string} key - Cache key
 * @param {Function} fetchFn - Function to fetch data if not in cache
 * @param {number} ttl - Time to live in seconds (default: 300s = 5 minutes)
 * @returns {Promise<any>} - Cached or fetched data
 */
const getOrFetch = async (key, fetchFn, ttl = 300) => {
  // Check if cache is available
  if (!global.userCache) {
    console.warn('Cache not available, fetching data directly');
    return await fetchFn();
  }
  
  // Try to get from cache
  const cachedData = global.userCache.get(key);
  
  if (cachedData !== undefined) {
    return cachedData;
  }
  
  // Fetch data
  const data = await fetchFn();
  
  // Cache data
  global.userCache.set(key, data, ttl);
  
  return data;
};

/**
 * Cache data
 * @param {string} key - Cache key
 * @param {any} data - Data to cache
 * @param {number} ttl - Time to live in seconds (default: 300s = 5 minutes)
 */
const cacheData = (key, data, ttl = 300) => {
  if (!global.userCache) {
    return;
  }
  
  global.userCache.set(key, data, ttl);
};

/**
 * Invalidate cache entry
 * @param {string} key - Cache key to invalidate
 */
const invalidateCache = (key) => {
  if (!global.userCache) {
    return;
  }
  
  global.userCache.del(key);
};

/**
 * Invalidate cache entries by pattern
 * @param {RegExp} pattern - Regular expression pattern to match keys
 */
const invalidateCachePattern = (pattern) => {
  if (!global.userCache) {
    return;
  }
  
  const keys = global.userCache.keys();
  const matchingKeys = keys.filter(key => pattern.test(key));
  
  matchingKeys.forEach(key => {
    global.userCache.del(key);
  });
};

module.exports = {
  getOrFetch,
  cacheData,
  invalidateCache,
  invalidateCachePattern
}; 