/**
 * Data Retrieval Module for Progressive Overload
 *
 * Retrieves Week 1 workout results from localStorage to calculate Week 2 suggestions.
 *
 * localStorage key format: sheet1_w{week}_d{day}_{exerciseId}_{setNumber}
 * Example: sheet1_w1_d1_A1_1 = Day 1, Exercise A1, Set 1
 *
 * @module dataRetrieval
 */

/**
 * Storage key prefix for all workout data
 */
const STORAGE_PREFIX = 'sheet1';

/**
 * Parse a localStorage key to extract its components
 *
 * @param {string} key - localStorage key (e.g., "sheet1_w1_d1_A1_1")
 * @returns {Object|null} Parsed components or null if invalid
 * @returns {number} returns.week - Week number
 * @returns {number} returns.day - Day number
 * @returns {string} returns.exerciseId - Exercise ID (e.g., "A1", "B2")
 * @returns {number} returns.setNumber - Set number
 *
 * @example
 * parseStorageKey("sheet1_w1_d1_A1_1")
 * // Returns: { week: 1, day: 1, exerciseId: "A1", setNumber: 1 }
 */
export function parseStorageKey(key) {
  if (!key || typeof key !== 'string') {
    console.error('[DataRetrieval] Invalid key provided to parseStorageKey:', key);
    return null;
  }

  // Pattern: sheet1_w{week}_d{day}_{exerciseId}_{setNumber}
  const pattern = /^sheet1_w(\d+)_d(\d+)_([A-Z]\d+)_(\d+)$/;
  const match = key.match(pattern);

  if (!match) {
    console.warn('[DataRetrieval] Key does not match expected format:', key);
    return null;
  }

  return {
    week: parseInt(match[1], 10),
    day: parseInt(match[2], 10),
    exerciseId: match[3],
    setNumber: parseInt(match[4], 10)
  };
}

/**
 * Build a storage key from components
 *
 * @param {number} week - Week number
 * @param {number} day - Day number
 * @param {string} exerciseId - Exercise ID
 * @param {number} setNumber - Set number
 * @returns {string} Storage key
 *
 * @example
 * buildStorageKey(1, 1, "A1", 1)
 * // Returns: "sheet1_w1_d1_A1_1"
 */
export function buildStorageKey(week, day, exerciseId, setNumber) {
  return `${STORAGE_PREFIX}_w${week}_d${day}_${exerciseId}_${setNumber}`;
}

/**
 * Retrieve all sets for a specific exercise from Week 1
 *
 * @param {string} exerciseId - Exercise ID (e.g., "A1", "B2")
 * @param {number} day - Day number (1-5)
 * @param {number} [week=1] - Week number (defaults to 1)
 * @returns {Array|null} Array of set results or null if no data found
 * @returns {number} returns[].set - Set number
 * @returns {number} returns[].weight - Weight in pounds
 * @returns {number} returns[].reps - Number of repetitions
 *
 * @example
 * getWeek1Results("A1", 1)
 * // Returns: [
 * //   { set: 1, weight: 145, reps: 20 },
 * //   { set: 2, weight: 145, reps: 18 }
 * // ]
 */
export function getWeek1Results(exerciseId, day, week = 1) {
  if (!exerciseId || !day) {
    console.error('[DataRetrieval] Missing required parameters:', { exerciseId, day });
    return null;
  }

  // Validate inputs
  if (typeof day !== 'number' || day < 1 || day > 5) {
    console.error('[DataRetrieval] Invalid day number:', day);
    return null;
  }

  if (!exerciseId.match(/^[A-Z]\d+$/)) {
    console.error('[DataRetrieval] Invalid exercise ID format:', exerciseId);
    return null;
  }

  const results = [];
  let setNumber = 1;
  let foundAny = false;

  // Try to retrieve sets (typically 2 sets for Week 1, but we'll check up to 5)
  while (setNumber <= 5) {
    const key = buildStorageKey(week, day, exerciseId, setNumber);

    try {
      const data = localStorage.getItem(key);

      if (data === null) {
        // No more sets found
        break;
      }

      foundAny = true;
      const parsed = JSON.parse(data);

      // Validate parsed data
      if (typeof parsed.weight !== 'number' || typeof parsed.reps !== 'number') {
        console.error('[DataRetrieval] Invalid data format for key:', key, parsed);
        return null;
      }

      // Ensure weight and reps are positive
      if (parsed.weight < 0 || parsed.reps < 0) {
        console.error('[DataRetrieval] Negative values found for key:', key, parsed);
        return null;
      }

      results.push({
        set: setNumber,
        weight: parsed.weight,
        reps: parsed.reps
      });

      setNumber++;
    } catch (error) {
      console.error('[DataRetrieval] Error parsing data for key:', key, error);
      // Return null to indicate corrupted data
      return null;
    }
  }

  // Return null if no data found, otherwise return results
  return foundAny ? results : null;
}

/**
 * Get all Week 1 results for a specific day
 * Groups results by exercise ID
 *
 * @param {number} day - Day number (1-5)
 * @param {number} [week=1] - Week number (defaults to 1)
 * @returns {Object|null} Object with exercise IDs as keys, set arrays as values
 *
 * @example
 * getAllWeek1ResultsForDay(1)
 * // Returns: {
 * //   "A1": [{ set: 1, weight: 145, reps: 20 }, { set: 2, weight: 145, reps: 18 }],
 * //   "A2": [{ set: 1, weight: 50, reps: 20 }, { set: 2, weight: 50, reps: 20 }]
 * // }
 */
export function getAllWeek1ResultsForDay(day, week = 1) {
  if (typeof day !== 'number' || day < 1 || day > 5) {
    console.error('[DataRetrieval] Invalid day number:', day);
    return null;
  }

  const allResults = {};
  const exerciseIds = new Set();

  // Scan localStorage for all keys matching this day and week
  const prefix = `${STORAGE_PREFIX}_w${week}_d${day}_`;

  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);

      if (key && key.startsWith(prefix)) {
        const parsed = parseStorageKey(key);

        if (parsed && parsed.week === week && parsed.day === day) {
          exerciseIds.add(parsed.exerciseId);
        }
      }
    }

    // Retrieve results for each exercise found
    exerciseIds.forEach(exerciseId => {
      const results = getWeek1Results(exerciseId, day, week);
      if (results) {
        allResults[exerciseId] = results;
      }
    });

    return Object.keys(allResults).length > 0 ? allResults : null;
  } catch (error) {
    console.error('[DataRetrieval] Error scanning localStorage:', error);
    return null;
  }
}

/**
 * Check if Week 1 has complete data for an exercise
 *
 * @param {string} exerciseId - Exercise ID
 * @param {number} day - Day number (1-5)
 * @param {number} expectedSets - Number of sets expected (typically 2 for Week 1)
 * @param {number} [week=1] - Week number (defaults to 1)
 * @returns {Object} Validation result
 * @returns {boolean} returns.isComplete - True if all expected sets are present
 * @returns {number} returns.foundSets - Number of sets found
 * @returns {number} returns.expectedSets - Number of sets expected
 * @returns {Array|null} returns.data - The actual data if found, null otherwise
 * @returns {string} returns.message - Descriptive message
 *
 * @example
 * hasCompleteWeek1Data("A1", 1, 2)
 * // Returns: {
 * //   isComplete: true,
 * //   foundSets: 2,
 * //   expectedSets: 2,
 * //   data: [...],
 * //   message: "Complete data found"
 * // }
 */
export function hasCompleteWeek1Data(exerciseId, day, expectedSets, week = 1) {
  if (!exerciseId || !day || !expectedSets) {
    return {
      isComplete: false,
      foundSets: 0,
      expectedSets: expectedSets || 0,
      data: null,
      message: 'Invalid parameters provided'
    };
  }

  if (expectedSets < 1 || expectedSets > 10) {
    console.warn('[DataRetrieval] Unusual expectedSets value:', expectedSets);
  }

  const results = getWeek1Results(exerciseId, day, week);

  if (!results) {
    return {
      isComplete: false,
      foundSets: 0,
      expectedSets: expectedSets,
      data: null,
      message: 'No data found'
    };
  }

  const foundSets = results.length;
  const isComplete = foundSets === expectedSets;

  return {
    isComplete,
    foundSets,
    expectedSets,
    data: results,
    message: isComplete
      ? 'Complete data found'
      : foundSets < expectedSets
        ? `Incomplete: found ${foundSets}/${expectedSets} sets`
        : `Extra data: found ${foundSets}/${expectedSets} sets`
  };
}

/**
 * Get statistics about Week 1 data availability
 * Useful for debugging and validation
 *
 * @param {number} [week=1] - Week number (defaults to 1)
 * @returns {Object} Statistics about data availability
 * @returns {number} returns.totalExercises - Total number of exercises with data
 * @returns {Object} returns.byDay - Breakdown by day
 * @returns {Array} returns.exerciseIds - List of all exercise IDs found
 *
 * @example
 * getWeek1DataStats()
 * // Returns: {
 * //   totalExercises: 24,
 * //   byDay: { 1: 5, 2: 2, 3: 5, 4: 5, 5: 7 },
 * //   exerciseIds: ["A1", "A2", "B1", ...]
 * // }
 */
export function getWeek1DataStats(week = 1) {
  const stats = {
    totalExercises: 0,
    byDay: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    exerciseIds: []
  };

  const seenExercises = new Set();

  try {
    for (let day = 1; day <= 5; day++) {
      const dayResults = getAllWeek1ResultsForDay(day, week);

      if (dayResults) {
        const exerciseCount = Object.keys(dayResults).length;
        stats.byDay[day] = exerciseCount;

        Object.keys(dayResults).forEach(exerciseId => {
          if (!seenExercises.has(exerciseId)) {
            seenExercises.add(exerciseId);
            stats.exerciseIds.push(exerciseId);
          }
        });
      }
    }

    stats.totalExercises = seenExercises.size;
    stats.exerciseIds.sort(); // Sort alphabetically for consistency

    return stats;
  } catch (error) {
    console.error('[DataRetrieval] Error calculating stats:', error);
    return stats;
  }
}

/**
 * Validate localStorage data integrity for a specific week
 * Checks for corrupted or invalid data
 *
 * @param {number} [week=1] - Week number (defaults to 1)
 * @returns {Object} Validation report
 * @returns {boolean} returns.isValid - Overall validity
 * @returns {Array} returns.errors - List of errors found
 * @returns {Array} returns.warnings - List of warnings
 *
 * @example
 * validateWeekData(1)
 * // Returns: {
 * //   isValid: true,
 * //   errors: [],
 * //   warnings: ["Exercise A1 on Day 1 has only 1 set"]
 * // }
 */
export function validateWeekData(week = 1) {
  const report = {
    isValid: true,
    errors: [],
    warnings: []
  };

  try {
    const prefix = `${STORAGE_PREFIX}_w${week}_`;

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);

      if (key && key.startsWith(prefix)) {
        // Validate key format
        const parsed = parseStorageKey(key);
        if (!parsed) {
          report.errors.push(`Invalid key format: ${key}`);
          report.isValid = false;
          continue;
        }

        // Validate data
        try {
          const data = localStorage.getItem(key);
          const obj = JSON.parse(data);

          if (typeof obj.weight !== 'number' || typeof obj.reps !== 'number') {
            report.errors.push(`Invalid data structure in ${key}`);
            report.isValid = false;
          }

          if (obj.weight < 0 || obj.reps < 0) {
            report.errors.push(`Negative values in ${key}`);
            report.isValid = false;
          }

          if (obj.weight === 0 || obj.reps === 0) {
            report.warnings.push(`Zero values in ${key}`);
          }

          if (obj.weight > 1000) {
            report.warnings.push(`Unusually high weight (${obj.weight} lbs) in ${key}`);
          }

          if (obj.reps > 100) {
            report.warnings.push(`Unusually high reps (${obj.reps}) in ${key}`);
          }
        } catch (error) {
          report.errors.push(`Corrupted data in ${key}: ${error.message}`);
          report.isValid = false;
        }
      }
    }

    return report;
  } catch (error) {
    report.errors.push(`Validation error: ${error.message}`);
    report.isValid = false;
    return report;
  }
}

/**
 * Clear all data for a specific week (use with caution)
 *
 * @param {number} week - Week number to clear
 * @returns {Object} Result of operation
 * @returns {boolean} returns.success - Whether operation succeeded
 * @returns {number} returns.itemsDeleted - Number of items deleted
 * @returns {string} returns.message - Descriptive message
 */
export function clearWeekData(week) {
  if (typeof week !== 'number' || week < 1) {
    return {
      success: false,
      itemsDeleted: 0,
      message: 'Invalid week number'
    };
  }

  try {
    const prefix = `${STORAGE_PREFIX}_w${week}_`;
    const keysToDelete = [];

    // Collect keys to delete
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(prefix)) {
        keysToDelete.push(key);
      }
    }

    // Delete collected keys
    keysToDelete.forEach(key => localStorage.removeItem(key));

    return {
      success: true,
      itemsDeleted: keysToDelete.length,
      message: `Deleted ${keysToDelete.length} items from week ${week}`
    };
  } catch (error) {
    console.error('[DataRetrieval] Error clearing week data:', error);
    return {
      success: false,
      itemsDeleted: 0,
      message: `Error: ${error.message}`
    };
  }
}

// Export all functions
export default {
  parseStorageKey,
  buildStorageKey,
  getWeek1Results,
  getAllWeek1ResultsForDay,
  hasCompleteWeek1Data,
  getWeek1DataStats,
  validateWeekData,
  clearWeekData
};
