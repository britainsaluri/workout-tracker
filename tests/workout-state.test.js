/**
 * Comprehensive tests for Workout State Management
 */

import { workoutState } from '../src/workout-state.js';
import { storage, STORES } from '../src/storage.js';

describe('Workout State Management', () => {
  const mockWorkoutData = {
    programs: [
      {
        id: 'beginner',
        name: 'Beginner Program',
        weeks: [
          {
            weekNumber: 1,
            days: [
              {
                dayNumber: 1,
                name: 'Upper Body',
                exercises: [
                  { id: 'ex1', name: 'Bench Press', sets: 3, reps: 10 },
                  { id: 'ex2', name: 'Rows', sets: 3, reps: 10 }
                ]
              }
            ]
          }
        ]
      }
    ]
  };

  beforeEach(async () => {
    await workoutState.init();
    // Clear all data
    await storage.clear(STORES.WORKOUTS);
    await storage.clear(STORES.RESULTS);
    await storage.clear(STORES.PROGRESS);

    // Reset state
    workoutState.currentProgram = null;
    workoutState.currentWeek = null;
    workoutState.currentDay = null;
    workoutState.workoutData = null;
  });

  describe('Initialization', () => {
    test('should initialize successfully', async () => {
      expect(workoutState.initialized).toBe(true);
    });

    test('should load saved position on init', async () => {
      await storage.set(STORES.PROGRESS, 'current_position', {
        program: 'beginner',
        week: 0,
        day: 0
      });

      const state = new (workoutState.constructor)();
      await state.init();

      expect(state.currentProgram).toBe('beginner');
      expect(state.currentWeek).toBe(0);
      expect(state.currentDay).toBe(0);
    });
  });

  describe('Workout Data Loading', () => {
    test('should load workout data from object', async () => {
      await workoutState.loadWorkoutData(mockWorkoutData);

      expect(workoutState.workoutData).toEqual(mockWorkoutData);

      const cached = await storage.get(STORES.WORKOUTS, 'program_data');
      expect(cached).toEqual(mockWorkoutData);
    });

    test('should validate workout data structure', async () => {
      await expect(workoutState.loadWorkoutData(null))
        .rejects.toThrow('Invalid workout data');

      await expect(workoutState.loadWorkoutData({}))
        .rejects.toThrow('missing programs array');
    });

    test('should notify listeners on data load', async () => {
      const listener = jest.fn();
      workoutState.subscribe(listener);

      await workoutState.loadWorkoutData(mockWorkoutData);

      expect(listener).toHaveBeenCalledWith({
        type: 'workout_data_loaded',
        data: mockWorkoutData
      });
    });
  });

  describe('Position Management', () => {
    test('should set and get current position', async () => {
      await workoutState.setPosition('beginner', 0, 0);

      const position = workoutState.getPosition();
      expect(position).toEqual({
        program: 'beginner',
        week: 0,
        day: 0
      });
    });

    test('should persist position to storage', async () => {
      await workoutState.setPosition('beginner', 1, 2);

      const stored = await storage.get(STORES.PROGRESS, 'current_position');
      expect(stored.program).toBe('beginner');
      expect(stored.week).toBe(1);
      expect(stored.day).toBe(2);
      expect(stored.updatedAt).toBeDefined();
    });

    test('should notify listeners on position change', async () => {
      const listener = jest.fn();
      workoutState.subscribe(listener);

      await workoutState.setPosition('beginner', 0, 0);

      expect(listener).toHaveBeenCalledWith({
        type: 'position_changed',
        program: 'beginner',
        week: 0,
        day: 0
      });
    });

    test('should get current workout data', async () => {
      await workoutState.loadWorkoutData(mockWorkoutData);
      await workoutState.setPosition('beginner', 0, 0);

      const workout = workoutState.getCurrentWorkout();
      expect(workout).toBeDefined();
      expect(workout.name).toBe('Upper Body');
      expect(workout.exercises).toHaveLength(2);
    });

    test('should return null for invalid position', async () => {
      await workoutState.loadWorkoutData(mockWorkoutData);
      await workoutState.setPosition('invalid', 99, 99);

      const workout = workoutState.getCurrentWorkout();
      expect(workout).toBeNull();
    });
  });

  describe('Workout Results', () => {
    test('should save workout result', async () => {
      const result = {
        exerciseId: 'ex1',
        exerciseName: 'Bench Press',
        sets: [
          { weight: 135, reps: 10, completed: true },
          { weight: 135, reps: 9, completed: true },
          { weight: 135, reps: 8, completed: true }
        ],
        notes: 'Felt strong today'
      };

      const resultId = await workoutState.saveWorkoutResult(result);

      expect(resultId).toBeDefined();
      expect(resultId).toMatch(/^result_/);

      const saved = await storage.get(STORES.RESULTS, resultId);
      expect(saved.exerciseId).toBe('ex1');
      expect(saved.sets).toHaveLength(3);
      expect(saved.date).toBeDefined();
    });

    test('should include current position in result', async () => {
      await workoutState.setPosition('beginner', 0, 0);

      const resultId = await workoutState.saveWorkoutResult({
        exerciseId: 'ex1',
        exerciseName: 'Bench Press',
        sets: [{ weight: 100, reps: 10, completed: true }]
      });

      const saved = await storage.get(STORES.RESULTS, resultId);
      expect(saved.program).toBe('beginner');
      expect(saved.week).toBe(0);
      expect(saved.day).toBe(0);
    });

    test('should validate sets data', async () => {
      await expect(workoutState.saveWorkoutResult({
        exerciseId: 'ex1',
        sets: []
      })).rejects.toThrow('sets must be a non-empty array');

      await expect(workoutState.saveWorkoutResult({
        exerciseId: 'ex1',
        sets: null
      })).rejects.toThrow('sets must be a non-empty array');
    });

    test('should update existing result', async () => {
      const resultId = await workoutState.saveWorkoutResult({
        exerciseId: 'ex1',
        exerciseName: 'Bench Press',
        sets: [{ weight: 100, reps: 10, completed: true }]
      });

      await workoutState.updateWorkoutResult(resultId, {
        notes: 'Updated notes',
        rating: 4
      });

      const updated = await storage.get(STORES.RESULTS, resultId);
      expect(updated.notes).toBe('Updated notes');
      expect(updated.rating).toBe(4);
      expect(updated.updatedAt).toBeDefined();
    });

    test('should delete workout result', async () => {
      const resultId = await workoutState.saveWorkoutResult({
        exerciseId: 'ex1',
        exerciseName: 'Bench Press',
        sets: [{ weight: 100, reps: 10, completed: true }]
      });

      await workoutState.deleteWorkoutResult(resultId);

      const deleted = await storage.get(STORES.RESULTS, resultId);
      expect(deleted).toBeNull();
    });
  });

  describe('Historical Data', () => {
    beforeEach(async () => {
      // Add sample results
      await workoutState.saveWorkoutResult({
        exerciseId: 'ex1',
        exerciseName: 'Bench Press',
        date: '2025-01-01T10:00:00Z',
        sets: [{ weight: 100, reps: 10, completed: true }]
      });
      await workoutState.saveWorkoutResult({
        exerciseId: 'ex1',
        exerciseName: 'Bench Press',
        date: '2025-01-03T10:00:00Z',
        sets: [{ weight: 105, reps: 10, completed: true }]
      });
      await workoutState.saveWorkoutResult({
        exerciseId: 'ex2',
        exerciseName: 'Rows',
        date: '2025-01-01T10:00:00Z',
        sets: [{ weight: 80, reps: 10, completed: true }]
      });
    });

    test('should get exercise history', async () => {
      const history = await workoutState.getExerciseHistory('ex1');

      expect(history).toHaveLength(2);
      expect(history[0].exerciseId).toBe('ex1');
      // Should be sorted by date (newest first)
      expect(new Date(history[0].date) >= new Date(history[1].date)).toBe(true);
    });

    test('should limit exercise history', async () => {
      const history = await workoutState.getExerciseHistory('ex1', { limit: 1 });

      expect(history).toHaveLength(1);
    });

    test('should get results by date range', async () => {
      const results = await workoutState.getResultsByDateRange(
        '2025-01-01T00:00:00Z',
        '2025-01-02T00:00:00Z'
      );

      expect(results).toHaveLength(2);
      expect(results.every(r => r.date.startsWith('2025-01-01'))).toBe(true);
    });

    test('should get current workout results', async () => {
      await workoutState.setPosition('beginner', 0, 0);

      await workoutState.saveWorkoutResult({
        program: 'beginner',
        week: 0,
        day: 0,
        exerciseId: 'ex1',
        exerciseName: 'Bench Press',
        sets: [{ weight: 100, reps: 10, completed: true }]
      });

      const results = await workoutState.getCurrentWorkoutResults();
      expect(results).toHaveLength(1);
      expect(results[0].program).toBe('beginner');
    });
  });

  describe('Progress Tracking', () => {
    beforeEach(async () => {
      await workoutState.saveWorkoutResult({
        program: 'beginner',
        exerciseId: 'ex1',
        exerciseName: 'Bench Press',
        sets: [{ weight: 100, reps: 10, completed: true }],
        rating: 4
      });
      await workoutState.saveWorkoutResult({
        program: 'beginner',
        exerciseId: 'ex2',
        exerciseName: 'Rows',
        sets: [
          { weight: 80, reps: 10, completed: true },
          { weight: 80, reps: 10, completed: true }
        ],
        rating: 5
      });
    });

    test('should get program progress statistics', async () => {
      const progress = await workoutState.getProgramProgress('beginner');

      expect(progress.totalWorkouts).toBeGreaterThan(0);
      expect(progress.completedExercises).toBe(2);
      expect(progress.totalSets).toBe(3);
      expect(progress.averageRating).toBe(4.5);
    });

    test('should return empty stats for non-existent program', async () => {
      const progress = await workoutState.getProgramProgress('nonexistent');

      expect(progress.totalWorkouts).toBe(0);
      expect(progress.completedExercises).toBe(0);
    });

    test('should get personal records', async () => {
      await workoutState.saveWorkoutResult({
        exerciseId: 'ex1',
        exerciseName: 'Bench Press',
        sets: [
          { weight: 150, reps: 5, completed: true },
          { weight: 140, reps: 8, completed: true }
        ]
      });

      const prs = await workoutState.getPersonalRecords('ex1');

      expect(prs.maxWeight).toBe(150);
      expect(prs.maxReps).toBe(10); // From earlier test data
      expect(prs.maxVolume).toBe(150 * 5); // 750
    });
  });

  describe('Export/Import', () => {
    test('should export workout data', async () => {
      await workoutState.loadWorkoutData(mockWorkoutData);
      await workoutState.setPosition('beginner', 0, 0);
      await workoutState.saveWorkoutResult({
        exerciseId: 'ex1',
        exerciseName: 'Bench Press',
        sets: [{ weight: 100, reps: 10, completed: true }]
      });

      const exported = await workoutState.exportData();

      expect(exported).toBeDefined();
      const data = JSON.parse(exported);
      expect(data.data[STORES.WORKOUTS]).toBeDefined();
      expect(data.data[STORES.RESULTS]).toBeDefined();
      expect(data.data[STORES.PROGRESS]).toBeDefined();
    });

    test('should import workout data', async () => {
      await workoutState.loadWorkoutData(mockWorkoutData);
      const exported = await workoutState.exportData();

      await workoutState.clearAllData();
      await workoutState.importData(exported);

      const workoutData = await storage.get(STORES.WORKOUTS, 'program_data');
      expect(workoutData).toEqual(mockWorkoutData);
    });
  });

  describe('Statistics', () => {
    test('should get comprehensive statistics', async () => {
      await workoutState.loadWorkoutData(mockWorkoutData);
      await workoutState.setPosition('beginner', 0, 0);
      await workoutState.saveWorkoutResult({
        exerciseId: 'ex1',
        exerciseName: 'Bench Press',
        sets: [{ weight: 100, reps: 10, completed: true }]
      });

      const stats = await workoutState.getStatistics();

      expect(stats.storage).toBeDefined();
      expect(stats.workouts).toBeDefined();
      expect(stats.workouts.total).toBe(1);
      expect(stats.currentPosition).toBeDefined();
    });
  });

  describe('Event Listeners', () => {
    test('should subscribe to state changes', async () => {
      const listener = jest.fn();
      const unsubscribe = workoutState.subscribe(listener);

      await workoutState.setPosition('beginner', 0, 0);

      expect(listener).toHaveBeenCalled();

      unsubscribe();
      listener.mockClear();

      await workoutState.setPosition('beginner', 1, 0);
      expect(listener).not.toHaveBeenCalled();
    });

    test('should handle listener errors gracefully', async () => {
      const badListener = jest.fn(() => {
        throw new Error('Listener error');
      });
      workoutState.subscribe(badListener);

      // Should not throw
      await expect(workoutState.setPosition('beginner', 0, 0))
        .resolves.not.toThrow();
    });
  });

  describe('Data Clearing', () => {
    test('should clear all data', async () => {
      await workoutState.loadWorkoutData(mockWorkoutData);
      await workoutState.setPosition('beginner', 0, 0);
      await workoutState.saveWorkoutResult({
        exerciseId: 'ex1',
        exerciseName: 'Bench Press',
        sets: [{ weight: 100, reps: 10, completed: true }]
      });

      await workoutState.clearAllData();

      expect(workoutState.currentProgram).toBeNull();
      expect(workoutState.currentWeek).toBeNull();
      expect(workoutState.currentDay).toBeNull();

      const results = await storage.getAll(STORES.RESULTS);
      expect(results).toHaveLength(0);
    });
  });
});
