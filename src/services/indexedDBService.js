/**
 * IndexedDB Service
 * Manages persistent local storage of lottery draws using IndexedDB
 */

const DB_NAME = 'MegaSenaDB';
const DB_VERSION = 1;
const STORE_NAME = 'draws';
const METADATA_STORE = 'metadata';

/**
 * Opens the IndexedDB database
 * @returns {Promise<IDBDatabase>}
 */
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      // Create draws store if it doesn't exist
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const drawsStore = db.createObjectStore(STORE_NAME, { keyPath: 'concurso' });
        drawsStore.createIndex('data', 'data', { unique: false });
        drawsStore.createIndex('isMegaDaVirada', 'isMegaDaVirada', { unique: false });
      }

      // Create metadata store if it doesn't exist
      if (!db.objectStoreNames.contains(METADATA_STORE)) {
        db.createObjectStore(METADATA_STORE, { keyPath: 'key' });
      }
    };
  });
}

/**
 * Saves a single draw to IndexedDB
 * @param {Object} draw - Draw object to save
 * @returns {Promise<void>}
 */
export async function saveDraw(draw) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(draw);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

/**
 * Saves multiple draws to IndexedDB in batch
 * @param {Array} draws - Array of draw objects
 * @returns {Promise<void>}
 */
export async function saveDrawsBatch(draws) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    let completed = 0;
    const total = draws.length;

    draws.forEach((draw) => {
      const request = store.put(draw);
      request.onsuccess = () => {
        completed++;
        if (completed === total) {
          resolve();
        }
      };
      request.onerror = () => reject(request.error);
    });

    if (total === 0) resolve();
  });
}

/**
 * Gets all draws from IndexedDB
 * @returns {Promise<Array>}
 */
export async function getAllDraws() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => {
      const draws = request.result;
      // Sort by contest number descending
      draws.sort((a, b) => b.concurso - a.concurso);
      resolve(draws);
    };
    request.onerror = () => reject(request.error);
  });
}

/**
 * Gets a single draw by contest number
 * @param {number} concurso - Contest number
 * @returns {Promise<Object|null>}
 */
export async function getDrawByNumber(concurso) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(concurso);

    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Gets the highest contest number stored
 * @returns {Promise<number|null>}
 */
export async function getLatestStoredContest() {
  const draws = await getAllDraws();
  if (draws.length === 0) return null;
  return draws[0].concurso; // Already sorted descending
}

/**
 * Gets the total count of draws stored
 * @returns {Promise<number>}
 */
export async function getDrawsCount() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.count();

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Clears all draws from IndexedDB
 * @returns {Promise<void>}
 */
export async function clearAllDraws() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.clear();

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

/**
 * Saves metadata (like last sync time, etc.)
 * @param {string} key - Metadata key
 * @param {any} value - Metadata value
 * @returns {Promise<void>}
 */
export async function saveMetadata(key, value) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([METADATA_STORE], 'readwrite');
    const store = transaction.objectStore(METADATA_STORE);
    const request = store.put({ key, value, updatedAt: new Date().toISOString() });

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

/**
 * Gets metadata by key
 * @param {string} key - Metadata key
 * @returns {Promise<any|null>}
 */
export async function getMetadata(key) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([METADATA_STORE], 'readonly');
    const store = transaction.objectStore(METADATA_STORE);
    const request = store.get(key);

    request.onsuccess = () => {
      const result = request.result;
      resolve(result ? result.value : null);
    };
    request.onerror = () => reject(request.error);
  });
}

/**
 * Checks if database has any data
 * @returns {Promise<boolean>}
 */
export async function hasData() {
  const count = await getDrawsCount();
  return count > 0;
}

/**
 * Gets database statistics
 * @returns {Promise<Object>}
 */
export async function getDBStats() {
  const count = await getDrawsCount();
  const latestContest = await getLatestStoredContest();
  const lastSync = await getMetadata('lastSyncTime');
  const firstSync = await getMetadata('firstSyncTime');

  return {
    totalDraws: count,
    latestContest,
    lastSyncTime: lastSync,
    firstSyncTime: firstSync,
    hasData: count > 0,
  };
}
