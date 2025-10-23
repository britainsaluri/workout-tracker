/**
 * Workout State Management System
 *
 * Manages the application state including:
 * - Current workout position (program, week, day)
 * - Workout data loading and caching
 * - User workout results (weight, reps per set)
 * - Historical data retrieval
 * - Progress tracking
 *
 * Uses the storage abstraction layer for persistence
 */

import { storage, STORES } from './storage.js';

class WorkoutState {
  constructor() {
    this.currentProgram = null;
    this.currentWeek = null;
    this.currentDay = null;
    this.workoutData = null; // Cached workout program data
    this.listeners = new Set(); // State change listeners
    this.initialized = false;
  }

  /**
   * Initialize state management system
   * Loads current position and workout data
   */
  async init() {
    if (this.initialized) return;

    await storage.init();

    // Load current position
    const position = await storage.get(STORES.PROGRESS, 'current_position');
    if (position) {
      this.currentProgram = position.program;
      this.currentWeek = position.week;
      this.currentDay = position.day;
    }

    // Load workout data from storage
    const cachedWorkouts = await storage.get(STORES.WORKOUTS, 'program_data');
    if (cachedWorkouts) {
      this.workoutData = cachedWorkouts;
    }

    this.initialized = true;
    console.log('[WorkoutState] Initialized:', {
      program: this.currentProgram,
      week: this.currentWeek,
      day: this.currentDay
    });
  }

  /**
   * Load workout program data from JSON
   * @param {string|object} source - JSON file path or object containing workout data
   * @returns {Promise<void>}
   */
  async loadWorkoutData(source) {
    if (!this.initialized) await this.init();

    try {
      let workoutData;

      if (typeof source === 'string') {
        // Load from URL or file path
        const response = await fetch(source);
        if (!response.ok) {
          throw new Error(`Failed to load workout data: ${response.statusText}`);
        }
        workoutData = await response.json();
      } else {
        // Use provided object
        workoutData = source;
      }

      // Validate data structure
      this._validateWorkoutData(workoutData);

      // Cache in memory and storage
      this.workoutData = workoutData;
      await storage.set(STORES.WORKOUTS, 'program_data', workoutData);

      console.log('[WorkoutState] Workout data loaded successfully');
      this._notifyListeners({ type: 'workout_data_loaded', data: workoutData });
    } catch (error) {
      console.error('[WorkoutState] Failed to load workout data:', error);
      throw error;
    }
  }

  /**
   * Validate workout data structure
   */
  _validateWorkoutData(data) {
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid workout data: must be an object');
    }
    if (!data.programs || !Array.isArray(data.programs)) {
      throw new Error('Invalid workout data: missing programs array');
    }
    // Additional validation can be added here
  }

  /**
   * Set current workout position
   * @param {string} program - Program ID
   * @param {number} week - Week number
   * @param {number} day - Day number
   * @returns {Promise<void>}
   */
  async setPosition(program, week, day) {
    if (!this.initialized) await this.init();

    this.currentProgram = program;
    this.currentWeek = week;
    this.currentDay = day;

    await storage.set(STORES.PROGRESS, 'current_position', {
      program,
      week,
      day,
      updatedAt: new Date().toISOString()
    });

    console.log('[WorkoutState] Position updated:', { program, week, day });
    this._notifyListeners({ type: 'position_changed', program, week, day });
  }

  /**
   * Get current workout position
   * @returns {object} Current position
   */
  getPosition() {
    return {
      program: this.currentProgram,
      week: this.currentWeek,
      day: this.currentDay
    };
  }

  /**
   * Get current workout data for active position
   * @returns {object|null} Current workout or null
   */
  getCurrentWorkout() {
    if (!this.workoutData || !this.currentProgram ||
        this.currentWeek === null || this.currentDay === null) {
      return null;
    }

    const program = this.workoutData.programs.find(p => p.id === this.currentProgram);
    if (!program) return null;

    const week = program.weeks?.[this.currentWeek];
    if (!week) return null;

    const day = week.days?.[this.currentDay];
    return day || null;
  }

  /**
   * Save workout result
   * @param {object} result - Workout result data
   * @returns {Promise<string>} Result ID
   */
  async saveWorkoutResult(result) {
    if (!this.initialized) await this.init();

    const resultData = {
      id: `result_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      program: result.program || this.currentProgram,
      week: result.week ?? this.currentWeek,
      day: result.day ?? this.currentDay,
      exerciseId: result.exerciseId,
      exerciseName: result.exerciseName,
      date: result.date || new Date().toISOString(),
      sets: result.sets, // Array of { weight, reps, completed }
      notes: result.notes || '',
      duration: result.duration || null, // Workout duration in seconds
      rating: result.rating || null // User's difficulty rating (1-5)
    };

    // Validate sets data
    if (!Array.isArray(resultData.sets) || resultData.sets.length === 0) {
      throw new Error('Invalid result: sets must be a non-empty array');
    }

    await storage.set(STORES.RESULTS, resultData.id, resultData);

    console.log('[WorkoutState] Result saved:', resultData.id);
    this._notifyListeners({ type: 'result_saved', result: resultData });

    return resultData.id;
  }

  /**
   * Update an existing workout result
   * @param {string} resultId - Result ID to update
   * @param {object} updates - Fields to update
   * @returns {Promise<void>}
   */
  async updateWorkoutResult(resultId, updates) {
    if (!this.initialized) await this.init();

    const existing = await storage.get(STORES.RESULTS, resultId);
    if (!existing) {
      throw new Error(`Result not found: ${resultId}`);
    }

    const updated = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    await storage.set(STORES.RESULTS, resultId, updated);

    console.log('[WorkoutState] Result updated:', resultId);
    this._notifyListeners({ type: 'result_updated', result: updated });
  }

  /**
   * Get workout results for a specific exercise
   * @param {string} exerciseId - Exercise ID
   * @param {object} options - Query options
   * @returns {Promise<Array>} Array of results
   */
  async getExerciseHistory(exerciseId, options = {}) {
    if (!this.initialized) await this.init();

    const results = await storage.query(STORES.RESULTS, 'exerciseId', exerciseId);

    // Sort by date (newest first)
    results.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Apply limit if specified
    if (options.limit) {
      return results.slice(0, options.limit);
    }

    return results;
  }

  /**
   * Get all workout results for a date range
   * @param {string} startDate - ISO date string
   * @param {string} endDate - ISO date string
   * @returns {Promise<Array>} Array of results
   */
  async getResultsByDateRange(startDate, endDate) {
    if (!this.initialized) await this.init();

    const allResults = await storage.getAll(STORES.RESULTS);

    const start = new Date(startDate);
    const end = new Date(endDate);

    return allResults.filter(result => {
      const resultDate = new Date(result.date);
      return resultDate >= start && resultDate <= end;
    }).sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  /**
   * Get results for current workout position
   * @returns {Promise<Array>} Array of results
   */
  async getCurrentWorkoutResults() {
    if (!this.initialized) await this.init();

    const allResults = await storage.getAll(STORES.RESULTS);

    return allResults.filter(result =>
      result.program === this.currentProgram &&
      result.week === this.currentWeek &&
      result.day === this.currentDay
    ).sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  /**
   * Get progress statistics for a program
   * @param {string} programId - Program ID
   * @returns {Promise<object>} Progress statistics
   */
  async getProgramProgress(programId) {
    if (!this.initialized) await this.init();

    const allResults = await storage.getAll(STORES.RESULTS);
    const programResults = allResults.filter(r => r.program === programId);

    if (programResults.length === 0) {
      return {
        totalWorkouts: 0,
        completedExercises: 0,
        totalSets: 0,
        averageRating: 0
      };
    }

    const stats = {
      totalWorkouts: new Set(programResults.map(r => `${r.week}_${r.day}`)).size,
      completedExercises: programResults.length,
      totalSets: programResults.reduce((sum, r) => sum + r.sets.length, 0),
      averageRating: programResults
        .filter(r => r.rating)
        .reduce((sum, r, _, arr) => sum + r.rating / arr.length, 0)
    };

    return stats;
  }

  /**
   * Get personal records for an exercise
   * @param {string} exerciseId - Exercise ID
   * @returns {Promise<object>} Personal records
   */
  async getPersonalRecords(exerciseId) {
    if (!this.initialized) await this.init();

    const history = await this.getExerciseHistory(exerciseId);

    if (history.length === 0) {
      return { maxWeight: 0, maxReps: 0, maxVolume: 0 };
    }

    let maxWeight = 0;
    let maxReps = 0;
    let maxVolume = 0;

    history.forEach(result => {
      result.sets.forEach(set => {
        if (set.completed) {
          maxWeight = Math.max(maxWeight, set.weight || 0);
          maxReps = Math.max(maxReps, set.reps || 0);
          const volume = (set.weight || 0) * (set.reps || 0);
          maxVolume = Math.max(maxVolume, volume);
        }
      });
    });

    return { maxWeight, maxReps, maxVolume };
  }

  /**
   * Delete a workout result
   * @param {string} resultId - Result ID to delete
   * @returns {Promise<void>}
   */
  async deleteWorkoutResult(resultId) {
    if (!this.initialized) await this.init();

    await storage.delete(STORES.RESULTS, resultId);

    console.log('[WorkoutState] Result deleted:', resultId);
    this._notifyListeners({ type: 'result_deleted', resultId });
  }

  /**
   * Export all workout data and results
   * @returns {Promise<string>} JSON string of all data
   */
  async exportData() {
    if (!this.initialized) await this.init();

    return storage.export();
  }

  /**
   * Import workout data from JSON
   * @param {string} jsonString - JSON string to import
   * @param {boolean} merge - Merge with existing data
   * @returns {Promise<void>}
   */
  async importData(jsonString, merge = false) {
    if (!this.initialized) await this.init();

    await storage.import(jsonString, merge);

    // Reload state after import
    const position = await storage.get(STORES.PROGRESS, 'current_position');
    if (position) {
      this.currentProgram = position.program;
      this.currentWeek = position.week;
      this.currentDay = position.day;
    }

    const cachedWorkouts = await storage.get(STORES.WORKOUTS, 'program_data');
    if (cachedWorkouts) {
      this.workoutData = cachedWorkouts;
    }

    console.log('[WorkoutState] Data imported successfully');
    this._notifyListeners({ type: 'data_imported' });
  }

  /**
   * Get comprehensive statistics
   * @returns {Promise<object>} Statistics object
   */
  async getStatistics() {
    if (!this.initialized) await this.init();

    const allResults = await storage.getAll(STORES.RESULTS);
    const storageStats = await storage.getStats();

    const stats = {
      storage: storageStats,
      workouts: {
        total: allResults.length,
        uniqueDays: new Set(allResults.map(r => r.date.split('T')[0])).size,
        totalSets: allResults.reduce((sum, r) => sum + r.sets.length, 0),
        totalVolume: allResults.reduce((sum, r) =>
          sum + r.sets.reduce((setSum, set) =>
            setSum + (set.weight || 0) * (set.reps || 0), 0
          ), 0
        )
      },
      currentPosition: this.getPosition()
    };

    return stats;
  }

  /**
   * Subscribe to state changes
   * @param {Function} callback - Callback function
   * @returns {Function} Unsubscribe function
   */
  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  /**
   * Notify all listeners of state change
   * @private
   */
  _notifyListeners(event) {
    this.listeners.forEach(callback => {
      try {
        callback(event);
      } catch (error) {
        console.error('[WorkoutState] Listener error:', error);
      }
    });
  }

  /**
   * Clear all data (use with caution!)
   * @returns {Promise<void>}
   */
  async clearAllData() {
    if (!this.initialized) await this.init();

    await storage.clear(STORES.RESULTS);
    await storage.clear(STORES.PROGRESS);

    this.currentProgram = null;
    this.currentWeek = null;
    this.currentDay = null;

    console.log('[WorkoutState] All data cleared');
    this._notifyListeners({ type: 'data_cleared' });
  }
}

// Export singleton instance
export const workoutState = new WorkoutState();
