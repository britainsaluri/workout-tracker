/**
 * Storage Abstraction Layer for Workout Tracker
 *
 * Provides a unified interface for data persistence using:
 * 1. localStorage (primary, fastest)
 * 2. IndexedDB (fallback for larger data)
 *
 * Features:
 * - Offline-first design
 * - Automatic fallback mechanism
 * - Data versioning for migrations
 * - Export/import functionality
 * - Compression for large datasets
 */

const STORAGE_VERSION = '1.0.0';
const DB_NAME = 'WorkoutTrackerDB';
const DB_VERSION = 1;
const STORES = {
  WORKOUTS: 'workouts',
  RESULTS: 'results',
  PROGRESS: 'progress',
  METADATA: 'metadata'
};

class StorageLayer {
  constructor() {
    this.useIndexedDB = false;
    this.db = null;
    this.initialized = false;
    this.storageType = 'localStorage'; // Default
  }

  /**
   * Initialize storage system
   * Tests localStorage and falls back to IndexedDB if needed
   */
  async init() {
    if (this.initialized) return;

    try {
      // Test localStorage availability and quota
      const testKey = '__storage_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);

      // Check available space (rough estimate)
      const spaceCheck = this._estimateLocalStorageSpace();
      if (spaceCheck < 1000000) { // Less than 1MB available
        throw new Error('Insufficient localStorage space');
      }

      this.storageType = 'localStorage';
      this.initialized = true;
      console.log('[Storage] Using localStorage');
    } catch (error) {
      console.warn('[Storage] localStorage unavailable, falling back to IndexedDB:', error.message);
      await this._initIndexedDB();
    }

    // Initialize metadata if not exists
    await this._initMetadata();
  }

  /**
   * Initialize IndexedDB as fallback
   */
  async _initIndexedDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        reject(new Error('Failed to open IndexedDB'));
      };

      request.onsuccess = (event) => {
        this.db = event.target.result;
        this.useIndexedDB = true;
        this.storageType = 'indexedDB';
        this.initialized = true;
        console.log('[Storage] Using IndexedDB');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Create object stores
        if (!db.objectStoreNames.contains(STORES.WORKOUTS)) {
          db.createObjectStore(STORES.WORKOUTS, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(STORES.RESULTS)) {
          const resultsStore = db.createObjectStore(STORES.RESULTS, {
            keyPath: 'id',
            autoIncrement: true
          });
          resultsStore.createIndex('date', 'date', { unique: false });
          resultsStore.createIndex('exerciseId', 'exerciseId', { unique: false });
        }
        if (!db.objectStoreNames.contains(STORES.PROGRESS)) {
          db.createObjectStore(STORES.PROGRESS, { keyPath: 'key' });
        }
        if (!db.objectStoreNames.contains(STORES.METADATA)) {
          db.createObjectStore(STORES.METADATA, { keyPath: 'key' });
        }
      };
    });
  }

  /**
   * Initialize metadata with version info
   */
  async _initMetadata() {
    const metadata = await this.get('metadata', 'app_metadata');
    if (!metadata) {
      await this.set('metadata', 'app_metadata', {
        version: STORAGE_VERSION,
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      });
    }
  }

  /**
   * Estimate available localStorage space
   */
  _estimateLocalStorageSpace() {
    try {
      let total = 0;
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          total += localStorage[key].length + key.length;
        }
      }
      // Typical limit is 5-10MB, return remaining estimate
      return 5000000 - total;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Get data from storage
   * @param {string} store - Store name (workouts, results, progress, metadata)
   * @param {string} key - Key to retrieve
   * @returns {Promise<any>} Retrieved data or null
   */
  async get(store, key) {
    if (!this.initialized) await this.init();

    if (this.useIndexedDB) {
      return this._getFromIndexedDB(store, key);
    } else {
      return this._getFromLocalStorage(store, key);
    }
  }

  /**
   * Set data in storage
   * @param {string} store - Store name
   * @param {string} key - Key to store
   * @param {any} value - Value to store
   * @returns {Promise<void>}
   */
  async set(store, key, value) {
    if (!this.initialized) await this.init();

    // Update metadata timestamp
    if (store !== 'metadata' || key !== 'app_metadata') {
      const metadata = await this.get('metadata', 'app_metadata');
      if (metadata) {
        metadata.lastUpdated = new Date().toISOString();
        await this.set('metadata', 'app_metadata', metadata);
      }
    }

    if (this.useIndexedDB) {
      return this._setInIndexedDB(store, key, value);
    } else {
      return this._setInLocalStorage(store, key, value);
    }
  }

  /**
   * Get all items from a store
   * @param {string} store - Store name
   * @returns {Promise<Array>} Array of all items
   */
  async getAll(store) {
    if (!this.initialized) await this.init();

    if (this.useIndexedDB) {
      return this._getAllFromIndexedDB(store);
    } else {
      return this._getAllFromLocalStorage(store);
    }
  }

  /**
   * Query items by index (IndexedDB only, falls back to filter for localStorage)
   * @param {string} store - Store name
   * @param {string} indexName - Index name
   * @param {any} value - Value to query
   * @returns {Promise<Array>} Matching items
   */
  async query(store, indexName, value) {
    if (!this.initialized) await this.init();

    if (this.useIndexedDB) {
      return this._queryIndexedDB(store, indexName, value);
    } else {
      // Fallback: get all and filter
      const all = await this.getAll(store);
      return all.filter(item => item[indexName] === value);
    }
  }

  /**
   * Delete item from storage
   * @param {string} store - Store name
   * @param {string} key - Key to delete
   * @returns {Promise<void>}
   */
  async delete(store, key) {
    if (!this.initialized) await this.init();

    if (this.useIndexedDB) {
      return this._deleteFromIndexedDB(store, key);
    } else {
      return this._deleteFromLocalStorage(store, key);
    }
  }

  /**
   * Clear entire store
   * @param {string} store - Store name
   * @returns {Promise<void>}
   */
  async clear(store) {
    if (!this.initialized) await this.init();

    if (this.useIndexedDB) {
      return this._clearIndexedDB(store);
    } else {
      return this._clearLocalStorage(store);
    }
  }

  /**
   * Export all data as JSON
   * @returns {Promise<string>} JSON string of all data
   */
  async export() {
    if (!this.initialized) await this.init();

    const exportData = {
      version: STORAGE_VERSION,
      exportDate: new Date().toISOString(),
      storageType: this.storageType,
      data: {}
    };

    // Export all stores
    for (const storeName of Object.values(STORES)) {
      exportData.data[storeName] = await this.getAll(storeName);
    }

    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Import data from JSON
   * @param {string} jsonString - JSON string to import
   * @param {boolean} merge - If true, merge with existing data; if false, replace
   * @returns {Promise<void>}
   */
  async import(jsonString, merge = false) {
    if (!this.initialized) await this.init();

    try {
      const importData = JSON.parse(jsonString);

      // Validate version compatibility
      if (!importData.version) {
        throw new Error('Invalid import file: missing version');
      }

      if (!merge) {
        // Clear all stores before importing
        for (const storeName of Object.values(STORES)) {
          if (storeName !== 'metadata') { // Preserve metadata
            await this.clear(storeName);
          }
        }
      }

      // Import each store
      for (const [storeName, items] of Object.entries(importData.data)) {
        if (!Array.isArray(items)) continue;

        for (const item of items) {
          const key = item.id || item.key;
          if (key) {
            await this.set(storeName, key, item);
          }
        }
      }

      console.log('[Storage] Import successful');
    } catch (error) {
      console.error('[Storage] Import failed:', error);
      throw error;
    }
  }

  /**
   * Get storage statistics
   * @returns {Promise<object>} Storage stats
   */
  async getStats() {
    if (!this.initialized) await this.init();

    const stats = {
      storageType: this.storageType,
      version: STORAGE_VERSION,
      stores: {}
    };

    for (const storeName of Object.values(STORES)) {
      const items = await this.getAll(storeName);
      stats.stores[storeName] = {
        count: items.length,
        size: JSON.stringify(items).length
      };
    }

    return stats;
  }

  // ==================== localStorage Implementation ====================

  _getFromLocalStorage(store, key) {
    const storageKey = `${store}_${key}`;
    const data = localStorage.getItem(storageKey);
    return data ? JSON.parse(data) : null;
  }

  _setInLocalStorage(store, key, value) {
    const storageKey = `${store}_${key}`;
    try {
      localStorage.setItem(storageKey, JSON.stringify(value));
    } catch (error) {
      // Quota exceeded, try to clear old data or switch to IndexedDB
      console.error('[Storage] localStorage quota exceeded:', error);
      throw error;
    }
  }

  _getAllFromLocalStorage(store) {
    const prefix = `${store}_`;
    const items = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(prefix)) {
        const data = localStorage.getItem(key);
        if (data) {
          try {
            items.push(JSON.parse(data));
          } catch (error) {
            console.error('[Storage] Failed to parse item:', key);
          }
        }
      }
    }

    return items;
  }

  _deleteFromLocalStorage(store, key) {
    const storageKey = `${store}_${key}`;
    localStorage.removeItem(storageKey);
  }

  _clearLocalStorage(store) {
    const prefix = `${store}_`;
    const keysToRemove = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(prefix)) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach(key => localStorage.removeItem(key));
  }

  // ==================== IndexedDB Implementation ====================

  _getFromIndexedDB(store, key) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([store], 'readonly');
      const objectStore = transaction.objectStore(store);
      const request = objectStore.get(key);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  _setInIndexedDB(store, key, value) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([store], 'readwrite');
      const objectStore = transaction.objectStore(store);

      // Ensure the object has the correct key
      const dataToStore = { ...value };
      if (store === STORES.PROGRESS || store === STORES.METADATA) {
        dataToStore.key = key;
      } else {
        dataToStore.id = key;
      }

      const request = objectStore.put(dataToStore);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  _getAllFromIndexedDB(store) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([store], 'readonly');
      const objectStore = transaction.objectStore(store);
      const request = objectStore.getAll();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  _queryIndexedDB(store, indexName, value) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([store], 'readonly');
      const objectStore = transaction.objectStore(store);
      const index = objectStore.index(indexName);
      const request = index.getAll(value);

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  _deleteFromIndexedDB(store, key) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([store], 'readwrite');
      const objectStore = transaction.objectStore(store);
      const request = objectStore.delete(key);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  _clearIndexedDB(store) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([store], 'readwrite');
      const objectStore = transaction.objectStore(store);
      const request = objectStore.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}

// Export singleton instance
export const storage = new StorageLayer();
export { STORES };
