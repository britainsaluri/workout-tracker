/**
 * Comprehensive tests for Storage Abstraction Layer
 */

import { storage, STORES } from '../src/storage.js';

describe('Storage Abstraction Layer', () => {
  beforeEach(async () => {
    await storage.init();
    // Clear all stores before each test
    for (const store of Object.values(STORES)) {
      await storage.clear(store);
    }
  });

  describe('Initialization', () => {
    test('should initialize successfully', async () => {
      expect(storage.initialized).toBe(true);
      expect(['localStorage', 'indexedDB']).toContain(storage.storageType);
    });

    test('should create metadata on init', async () => {
      const metadata = await storage.get(STORES.METADATA, 'app_metadata');
      expect(metadata).toBeDefined();
      expect(metadata.version).toBeDefined();
      expect(metadata.createdAt).toBeDefined();
    });
  });

  describe('Basic Operations', () => {
    test('should set and get data', async () => {
      const testData = { id: 'test1', name: 'Test Item', value: 42 };
      await storage.set(STORES.WORKOUTS, 'test1', testData);

      const retrieved = await storage.get(STORES.WORKOUTS, 'test1');
      expect(retrieved).toEqual(testData);
    });

    test('should return null for non-existent key', async () => {
      const result = await storage.get(STORES.WORKOUTS, 'nonexistent');
      expect(result).toBeNull();
    });

    test('should update existing data', async () => {
      await storage.set(STORES.WORKOUTS, 'test1', { id: 'test1', value: 1 });
      await storage.set(STORES.WORKOUTS, 'test1', { id: 'test1', value: 2 });

      const result = await storage.get(STORES.WORKOUTS, 'test1');
      expect(result.value).toBe(2);
    });

    test('should delete data', async () => {
      await storage.set(STORES.WORKOUTS, 'test1', { id: 'test1' });
      await storage.delete(STORES.WORKOUTS, 'test1');

      const result = await storage.get(STORES.WORKOUTS, 'test1');
      expect(result).toBeNull();
    });
  });

  describe('Bulk Operations', () => {
    test('should get all items from a store', async () => {
      await storage.set(STORES.WORKOUTS, 'test1', { id: 'test1', value: 1 });
      await storage.set(STORES.WORKOUTS, 'test2', { id: 'test2', value: 2 });
      await storage.set(STORES.WORKOUTS, 'test3', { id: 'test3', value: 3 });

      const all = await storage.getAll(STORES.WORKOUTS);
      expect(all).toHaveLength(3);
      expect(all.map(item => item.id)).toContain('test1');
      expect(all.map(item => item.id)).toContain('test2');
      expect(all.map(item => item.id)).toContain('test3');
    });

    test('should clear entire store', async () => {
      await storage.set(STORES.WORKOUTS, 'test1', { id: 'test1' });
      await storage.set(STORES.WORKOUTS, 'test2', { id: 'test2' });

      await storage.clear(STORES.WORKOUTS);

      const all = await storage.getAll(STORES.WORKOUTS);
      expect(all).toHaveLength(0);
    });
  });

  describe('Query Operations', () => {
    beforeEach(async () => {
      // Add test data with dates and exercise IDs
      await storage.set(STORES.RESULTS, 'result1', {
        id: 'result1',
        exerciseId: 'ex1',
        date: '2025-01-01',
        weight: 100
      });
      await storage.set(STORES.RESULTS, 'result2', {
        id: 'result2',
        exerciseId: 'ex1',
        date: '2025-01-02',
        weight: 105
      });
      await storage.set(STORES.RESULTS, 'result3', {
        id: 'result3',
        exerciseId: 'ex2',
        date: '2025-01-01',
        weight: 50
      });
    });

    test('should query by exercise ID', async () => {
      const results = await storage.query(STORES.RESULTS, 'exerciseId', 'ex1');
      expect(results).toHaveLength(2);
      expect(results.every(r => r.exerciseId === 'ex1')).toBe(true);
    });

    test('should query by date', async () => {
      const results = await storage.query(STORES.RESULTS, 'date', '2025-01-01');
      expect(results).toHaveLength(2);
      expect(results.every(r => r.date === '2025-01-01')).toBe(true);
    });
  });

  describe('Export/Import', () => {
    beforeEach(async () => {
      await storage.set(STORES.WORKOUTS, 'workout1', {
        id: 'workout1',
        name: 'Program A'
      });
      await storage.set(STORES.RESULTS, 'result1', {
        id: 'result1',
        exerciseId: 'ex1',
        sets: [{ weight: 100, reps: 10 }]
      });
    });

    test('should export all data', async () => {
      const exported = await storage.export();
      expect(exported).toBeDefined();

      const data = JSON.parse(exported);
      expect(data.version).toBeDefined();
      expect(data.exportDate).toBeDefined();
      expect(data.data).toBeDefined();
      expect(data.data[STORES.WORKOUTS]).toBeDefined();
      expect(data.data[STORES.RESULTS]).toBeDefined();
    });

    test('should import data (replace mode)', async () => {
      const exported = await storage.export();

      // Clear and add different data
      await storage.clear(STORES.WORKOUTS);
      await storage.set(STORES.WORKOUTS, 'workout2', {
        id: 'workout2',
        name: 'Program B'
      });

      // Import original data
      await storage.import(exported, false);

      const workouts = await storage.getAll(STORES.WORKOUTS);
      expect(workouts).toHaveLength(1);
      expect(workouts[0].id).toBe('workout1');
    });

    test('should import data (merge mode)', async () => {
      const exported = await storage.export();

      // Add new data
      await storage.set(STORES.WORKOUTS, 'workout2', {
        id: 'workout2',
        name: 'Program B'
      });

      // Import and merge
      await storage.import(exported, true);

      const workouts = await storage.getAll(STORES.WORKOUTS);
      expect(workouts.length).toBeGreaterThanOrEqual(2);
    });

    test('should handle invalid import data', async () => {
      await expect(storage.import('invalid json')).rejects.toThrow();
      await expect(storage.import('{}')).rejects.toThrow();
    });
  });

  describe('Statistics', () => {
    test('should return storage statistics', async () => {
      await storage.set(STORES.WORKOUTS, 'test1', { id: 'test1' });
      await storage.set(STORES.RESULTS, 'test2', { id: 'test2' });

      const stats = await storage.getStats();
      expect(stats.storageType).toBeDefined();
      expect(stats.version).toBeDefined();
      expect(stats.stores).toBeDefined();
      expect(stats.stores[STORES.WORKOUTS].count).toBe(1);
      expect(stats.stores[STORES.RESULTS].count).toBe(1);
    });
  });

  describe('Data Persistence', () => {
    test('should persist data across page reloads', async () => {
      const testData = { id: 'persist1', value: 'test' };
      await storage.set(STORES.WORKOUTS, 'persist1', testData);

      // Simulate page reload by creating new storage instance
      const storage2 = new (storage.constructor)();
      await storage2.init();

      const retrieved = await storage2.get(STORES.WORKOUTS, 'persist1');
      expect(retrieved).toEqual(testData);
    });
  });

  describe('Error Handling', () => {
    test('should handle storage quota exceeded gracefully', async () => {
      // This test depends on environment and may need adjustment
      const largeData = { id: 'large', data: 'x'.repeat(1000000) };

      // Should either succeed or throw a descriptive error
      try {
        await storage.set(STORES.WORKOUTS, 'large', largeData);
      } catch (error) {
        expect(error.message).toBeTruthy();
      }
    });
  });
});
