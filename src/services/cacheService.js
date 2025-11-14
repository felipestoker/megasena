/**
 * Cache Service
 * Manages localStorage cache for lottery data
 */

import { CACHE_KEYS, API_CONFIG } from '../constants/config';

/**
 * Saves draws to cache
 * @param {Array} draws - Draws to cache
 */
export function saveDrawsToCache(draws) {
  try {
    localStorage.setItem(CACHE_KEYS.DRAWS, JSON.stringify(draws));
    localStorage.setItem(CACHE_KEYS.LAST_UPDATE, new Date().getTime().toString());
  } catch (error) {
    console.error('Error saving to cache:', error);
  }
}

/**
 * Gets draws from cache
 * @returns {Array|null} Cached draws or null
 */
export function getDrawsFromCache() {
  try {
    const cachedData = localStorage.getItem(CACHE_KEYS.DRAWS);
    return cachedData ? JSON.parse(cachedData) : null;
  } catch (error) {
    console.error('Error reading from cache:', error);
    return null;
  }
}

/**
 * Gets last update timestamp
 * @returns {number|null} Timestamp or null
 */
export function getLastUpdateTime() {
  try {
    const lastUpdate = localStorage.getItem(CACHE_KEYS.LAST_UPDATE);
    return lastUpdate ? parseInt(lastUpdate) : null;
  } catch (error) {
    console.error('Error reading last update time:', error);
    return null;
  }
}

/**
 * Checks if cache is valid
 * @param {string} mode - 'quick' or 'full'
 * @returns {boolean} True if cache is valid
 */
export function isCacheValid(mode = 'quick') {
  const lastUpdate = getLastUpdateTime();
  if (!lastUpdate) return false;

  const cacheAge = new Date().getTime() - lastUpdate;
  const maxAge = mode === 'quick'
    ? API_CONFIG.CACHE_DURATION.QUICK
    : API_CONFIG.CACHE_DURATION.FULL;

  return cacheAge < maxAge;
}

/**
 * Checks if full data is loaded
 * @returns {boolean} True if full data is loaded
 */
export function isFullDataLoaded() {
  try {
    return localStorage.getItem(CACHE_KEYS.FULL_DATA_LOADED) === 'true';
  } catch (error) {
    return false;
  }
}

/**
 * Sets full data loaded flag
 * @param {boolean} loaded - Whether full data is loaded
 */
export function setFullDataLoaded(loaded) {
  try {
    localStorage.setItem(CACHE_KEYS.FULL_DATA_LOADED, loaded.toString());
  } catch (error) {
    console.error('Error setting full data loaded flag:', error);
  }
}

/**
 * Clears all cache
 */
export function clearCache() {
  try {
    localStorage.removeItem(CACHE_KEYS.DRAWS);
    localStorage.removeItem(CACHE_KEYS.LAST_UPDATE);
    localStorage.removeItem(CACHE_KEYS.FULL_DATA_LOADED);
  } catch (error) {
    console.error('Error clearing cache:', error);
  }
}
