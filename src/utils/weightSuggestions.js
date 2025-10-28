/**
 * Weight Suggestion Engine for Progressive Overload
 *
 * Provides intelligent weight recommendations for Week 2+ workouts based on
 * Week 1 performance data using progressive overload principles.
 *
 * @module weightSuggestions
 * @version 1.0.0
 */

/**
 * Main suggestion engine class for calculating progressive overload recommendations
 */
class SuggestionEngine {
  constructor() {
    this.version = '1.0.0';
    this.cache = new Map();
  }

  /**
   * Calculate suggested weight for Week 2 exercise based on Week 1 performance
   *
   * @param {string} exerciseId - Exercise identifier (e.g., "A1")
   * @param {Array<{weight: number, reps: number, completed: boolean}>} week1Results - Week 1 set results
   * @param {string} week2Target - Week 2 target rep range (e.g., "3x18-20")
   * @returns {Object|null} Suggestion object with weight, reason, and confidence, or null if insufficient data
   *
   * @example
   * const suggestion = engine.calculateSuggestedWeight(
   *   "A1",
   *   [{ weight: 145, reps: 20, completed: true }, { weight: 145, reps: 19, completed: true }],
   *   "3x18-20"
   * );
   * // Returns: { suggestedWeight: 155, increaseAmount: 10, reason: "hit_top_range_all_sets", ... }
   */
  calculateSuggestedWeight(exerciseId, week1Results, week2Target) {
    // Validate inputs
    if (!exerciseId || !week1Results || week1Results.length === 0) {
      return null;
    }

    // Validate weight values before filtering
    week1Results.forEach(set => {
      if (set.weight !== undefined && set.weight <= 0) {
        throw new Error('Invalid weight value: weight must be positive');
      }
    });

    // Filter only completed sets with valid data
    const completedSets = week1Results.filter(set => {
      // Must have valid weight
      if (!set.weight || set.weight <= 0) return false;
      // Must have valid reps (>= 0)
      if (set.reps < 0) return false;
      // Must have positive reps
      if (set.reps === 0) return false;
      // Check completion status if provided
      if (set.hasOwnProperty('completed') && !set.completed) return false;
      return true;
    });

    if (completedSets.length === 0) {
      return null;
    }

    // Parse Week 2 target to get rep range
    const targetRange = this._parseRepRange(week2Target);

    if (!targetRange || targetRange.max === 0) {
      throw new Error('Invalid target range format');
    }

    // Calculate average weight from Week 1
    const avgWeight = this._average(completedSets.map(s => s.weight));
    const avgReps = this._average(completedSets.map(s => s.reps));

    // Analyze performance level
    const performance = this.analyzePerformance(completedSets, targetRange);

    // Get exercise type for appropriate weight adjustments
    const exerciseType = this._classifyExerciseById(exerciseId);

    // Calculate weight adjustment
    const adjustment = this.calculateAdjustment(performance, exerciseType, avgWeight);

    // Apply adjustment
    const suggestedWeight = this._roundToNearestHalf(avgWeight + adjustment.amount);
    const increaseAmount = suggestedWeight - avgWeight;
    const increasePercentage = avgWeight > 0 ? (increaseAmount / avgWeight) * 100 : 0;

    // Add warning if based on limited data
    const warning = completedSets.length < 2 ?
      `Based on ${completedSets.length} of ${week1Results.length} sets` : null;

    // Add note if single set
    const note = completedSets.length === 1 ? 'Suggestion based on 1 set' : null;

    return {
      exerciseId,
      week1Results: {
        sets: completedSets,
        avgWeight: this._roundToNearestHalf(avgWeight),
        avgReps: Math.round(avgReps * 10) / 10,
        targetRange: `${targetRange.min}-${targetRange.max}`
      },
      week2Target,
      suggestedWeight,
      increaseAmount: this._roundToNearestHalf(increaseAmount),
      increasePercentage: Math.round(increasePercentage * 10) / 10,
      reason: adjustment.reason,
      confidence: adjustment.confidence,
      warning: warning,
      note: note,
      calculatedAt: new Date().toISOString(),
      version: this.version
    };
  }

  /**
   * Analyze performance level based on rep achievement vs target range
   *
   * @param {Array<{reps: number, completed: boolean}>} week1Results - Week 1 set results
   * @param {{min: number, max: number}} targetRange - Target rep range
   * @returns {{level: string, score: number, summary: string}} Performance analysis
   *
   * Performance levels:
   * - EXCEEDED: All sets hit max reps (100%)
   * - STRONG: Average 75%+ of range
   * - MAINTAINED: Average 50-75% of range
   * - STRUGGLED: Average 25-50% of range
   * - FAILED: Average <25% or incomplete sets
   */
  analyzePerformance(week1Results, targetRange) {
    const { min, max } = targetRange;
    const repSpan = max - min;

    // Check for failed/incomplete sets
    const failedSets = week1Results.filter(s => !s.completed || s.reps < min);
    if (failedSets.length > 0) {
      return {
        level: 'FAILED',
        score: 0,
        summary: `${failedSets.length} set(s) below target range`
      };
    }

    // Calculate performance score for each set (0-100)
    const setScores = week1Results.map(set => {
      if (set.reps >= max) return 100; // Hit top of range
      if (set.reps <= min) return 25;  // Bottom of range

      // Linear interpolation between min and max
      const progress = (set.reps - min) / repSpan;
      return 25 + (progress * 75); // Scale from 25% to 100%
    });

    // Average score across all sets
    const avgScore = this._average(setScores);

    // Determine performance level based on score
    let level;
    if (avgScore >= 100) level = 'EXCEEDED';
    else if (avgScore >= 75) level = 'STRONG';
    else if (avgScore >= 50) level = 'MAINTAINED';
    else level = 'STRUGGLED';

    return {
      level,
      score: Math.round(avgScore),
      summary: `Avg ${Math.round(avgScore)}% of target range`,
      allSetScores: setScores
    };
  }

  /**
   * Calculate appropriate weight adjustment based on performance and exercise type
   *
   * @param {{level: string, score: number}} performance - Performance analysis
   * @param {string} exerciseType - "COMPOUND" or "ISOLATION"
   * @param {number} currentWeight - Current weight used
   * @returns {{amount: number, reason: string, confidence: string}} Adjustment recommendation
   *
   * Weight adjustment rules:
   * - Compound exercises: Larger increments (±10, ±5 lbs)
   * - Isolation exercises: Smaller increments (±5, ±2.5 lbs)
   */
  calculateAdjustment(performance, exerciseType, currentWeight) {
    // Base adjustments by exercise type and performance level
    const adjustments = {
      COMPOUND: {
        EXCEEDED: {
          amount: 10,
          reason: 'Crushed it! Time to level up.',
          confidence: 'high',
          message: 'Crushed it! Time to level up.'
        },
        STRONG: {
          amount: 5,
          reason: 'Great work! Small bump.',
          confidence: 'high',
          message: 'Great work! Small bump.'
        },
        MAINTAINED: {
          amount: 0,
          reason: 'Master this weight first.',
          confidence: 'medium',
          message: 'Master this weight first.'
        },
        STRUGGLED: {
          amount: 0,
          reason: "Let's nail this weight.",
          confidence: 'low',
          message: "Let's nail this weight."
        },
        FAILED: {
          amount: -5,
          reason: "Let's dial it back and reduce weight.",
          confidence: 'low',
          message: "Let's dial it back and build up."
        }
      },
      ISOLATION: {
        EXCEEDED: {
          amount: 5,
          reason: 'Perfect form! Moving up.',
          confidence: 'high',
          message: 'Perfect form! Moving up.'
        },
        STRONG: {
          amount: 2.5,
          reason: 'Solid progress! Slight increase.',
          confidence: 'high',
          message: 'Solid progress! Slight increase.'
        },
        MAINTAINED: {
          amount: 0,
          reason: 'Keep building at this weight.',
          confidence: 'medium',
          message: 'Keep building at this weight.'
        },
        STRUGGLED: {
          amount: 0,
          reason: 'Focus on control here.',
          confidence: 'low',
          message: 'Focus on control here.'
        },
        FAILED: {
          amount: -2.5,
          reason: 'Drop weight, reduce and perfect technique.',
          confidence: 'medium',
          message: 'Drop weight, perfect technique.'
        }
      }
    };

    // Get adjustment for this performance level and exercise type
    const adjustment = adjustments[exerciseType][performance.level];

    return {
      amount: adjustment.amount,
      reason: adjustment.reason,
      confidence: adjustment.confidence,
      message: adjustment.message
    };
  }

  /**
   * Parse rep range string into min/max object
   *
   * @param {string} rangeStr - Rep range string (e.g., "18-20", "3x18-20", "10ea")
   * @returns {{min: number, max: number}|null} Parsed range or null if invalid
   *
   * @example
   * parseRepRange("18-20") // { min: 18, max: 20 }
   * parseRepRange("3x18-20") // { min: 18, max: 20 }
   * parseRepRange("10ea") // { min: 10, max: 10 }
   */
  _parseRepRange(rangeStr) {
    if (!rangeStr || typeof rangeStr !== 'string') {
      return null;
    }

    // Remove set notation (e.g., "3x18-20" -> "18-20")
    const cleaned = rangeStr.replace(/^\d+x/i, '');

    // Match range pattern (e.g., "18-20")
    const rangeMatch = cleaned.match(/(\d+)-(\d+)/);
    if (rangeMatch) {
      return {
        min: parseInt(rangeMatch[1], 10),
        max: parseInt(rangeMatch[2], 10)
      };
    }

    // Match single number or "ea" notation (e.g., "10ea", "20")
    const singleMatch = cleaned.match(/(\d+)/);
    if (singleMatch) {
      const value = parseInt(singleMatch[1], 10);
      return { min: value, max: value };
    }

    // Match max reps notation
    if (cleaned.toLowerCase().includes('max')) {
      return { min: 1, max: 100 }; // Arbitrary high number for max reps
    }

    return null;
  }

  /**
   * Classify exercise type based on exercise ID patterns
   *
   * @param {string} exerciseId - Exercise identifier
   * @returns {string} "COMPOUND" or "ISOLATION"
   *
   * Classification heuristics:
   * - Compound: Squat, Deadlift, Bench, Press, Row, Pull-up, Lunge, Dip
   * - Isolation: Curl, Extension, Raise, Fly, Shrug, Cable (most), Machine
   */
  _classifyExerciseById(exerciseId) {
    if (!exerciseId) return 'ISOLATION';

    const normalized = exerciseId.toLowerCase();

    // Compound exercise keywords
    const compoundKeywords = [
      'squat', 'deadlift', 'bench', 'press', 'overhead',
      'row', 'pull', 'chin', 'dip', 'lunge',
      'leg press', 'thrust', 'rdl', 'clean', 'snatch', 'jerk'
    ];

    // Check if exercise name contains compound keywords
    const isCompound = compoundKeywords.some(keyword =>
      normalized.includes(keyword)
    );

    return isCompound ? 'COMPOUND' : 'ISOLATION';
  }

  /**
   * Classify exercise type based on exercise name
   *
   * @param {string} exerciseName - Full exercise name
   * @returns {string} "COMPOUND" or "ISOLATION"
   */
  classifyExerciseByName(exerciseName) {
    if (!exerciseName) return 'ISOLATION';

    const normalized = exerciseName.toLowerCase();

    // Compound exercise keywords
    const compoundKeywords = [
      'squat', 'deadlift', 'bench press', 'press', 'overhead',
      'row', 'pull-up', 'pullup', 'chin-up', 'dip', 'lunge',
      'leg press', 'goodmorning', 'rdl', 'clean', 'snatch', 'jerk'
    ];

    // Check if exercise name contains compound keywords
    const isCompound = compoundKeywords.some(keyword =>
      normalized.includes(keyword)
    );

    return isCompound ? 'COMPOUND' : 'ISOLATION';
  }

  /**
   * Get confidence score (0-1) based on data quality
   *
   * @param {Array} sets - Set data
   * @param {number} completionRate - Percentage of sets completed
   * @returns {number} Confidence score 0-1
   */
  _calculateConfidenceScore(sets, completionRate) {
    // Base confidence on completion rate
    let confidence = completionRate;

    // Reduce confidence if few sets
    if (sets.length < 2) {
      confidence *= 0.5;
    }

    // Reduce confidence if high rep variance
    const reps = sets.map(s => s.reps);
    const repVariance = this._calculateVariance(reps);
    if (repVariance > 4) { // More than 4 rep variance
      confidence *= 0.8;
    }

    return Math.max(0, Math.min(1, confidence));
  }

  /**
   * Calculate statistical variance
   *
   * @param {Array<number>} values - Numeric values
   * @returns {number} Variance
   */
  _calculateVariance(values) {
    if (values.length === 0) return 0;

    const mean = this._average(values);
    const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
    return this._average(squaredDiffs);
  }

  /**
   * Calculate average of numeric array
   *
   * @param {Array<number>} arr - Array of numbers
   * @returns {number} Average value
   */
  _average(arr) {
    if (!arr || arr.length === 0) return 0;
    return arr.reduce((sum, val) => sum + val, 0) / arr.length;
  }

  /**
   * Round number to nearest 0.5
   *
   * @param {number} num - Number to round
   * @returns {number} Rounded value
   *
   * @example
   * _roundToNearestHalf(145.3) // 145.5
   * _roundToNearestHalf(145.7) // 146.0
   */
  _roundToNearestHalf(num) {
    return Math.round(num * 2) / 2;
  }

  /**
   * Clear suggestion cache
   * Used when workout data changes or new calculations needed
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * Get formatted display text for suggestion reason
   *
   * @param {string} reason - Reason code
   * @returns {string} Human-readable message
   */
  getReasonMessage(reason) {
    const messages = {
      'hit_top_range_all_sets': 'You hit the top of the target range on all sets!',
      'hit_top_range_most_sets': 'You hit the top range on most sets',
      'mid_range_consistent': 'Consistent performance in target range',
      'exceeded_range': 'You exceeded the target range!',
      'bottom_range_struggle': 'Stay at this weight to build consistency',
      'failed_sets': 'Let\'s reduce weight and perfect form',
      'first_time_exercise': 'Start with a manageable weight',
      'insufficient_data': 'Not enough data from Week 1'
    };

    return messages[reason] || 'Based on Week 1 performance';
  }

  /**
   * Get confidence badge class for UI styling
   *
   * @param {string} confidence - Confidence level ('high', 'medium', 'low')
   * @returns {string} CSS class name
   */
  getConfidenceBadgeClass(confidence) {
    const classes = {
      'high': 'confidence-high',
      'medium': 'confidence-medium',
      'low': 'confidence-low'
    };

    return classes[confidence] || 'confidence-low';
  }
}

/**
 * Helper function to retrieve Week 1 results from localStorage
 *
 * @param {string} program - Program identifier (e.g., "sheet1")
 * @param {number} week - Week number (1)
 * @param {number} day - Day number (1-5)
 * @param {string} exerciseId - Exercise identifier (e.g., "A1")
 * @returns {Array<{weight: number, reps: number, completed: boolean}>} Week 1 results
 */
export function getWeek1Results(program, week, day, exerciseId) {
  const results = [];

  try {
    // Retrieve state from localStorage
    const stateStr = localStorage.getItem('workoutTrackerState');
    if (!stateStr) {
      return results;
    }

    const state = JSON.parse(stateStr);
    const completedSets = state.completedSets || {};

    // Iterate through possible set numbers (typically 1-3)
    for (let setNum = 1; setNum <= 5; setNum++) {
      const key = `${program}_w${week}_d${day}_${exerciseId}_${setNum}`;
      const setData = completedSets[key];

      if (!setData) {
        break; // No more sets for this exercise
      }

      results.push({
        weight: setData.weight || 0,
        reps: setData.reps || 0,
        completed: setData.completed !== false // Default to true if not specified
      });
    }
  } catch (error) {
    console.error('[SuggestionEngine] Failed to retrieve Week 1 results:', error);
  }

  return results;
}

/**
 * Get suggestion for a specific Week 2 exercise
 *
 * @param {string} program - Program identifier
 * @param {number} day - Day number
 * @param {string} exerciseId - Exercise identifier
 * @param {string} week2Target - Week 2 target rep range
 * @returns {Object|null} Suggestion object or null
 *
 * @example
 * const suggestion = getSuggestionForExercise("sheet1", 1, "A1", "3x18-20");
 */
export function getSuggestionForExercise(program, day, exerciseId, week2Target) {
  // Get Week 1 results
  const week1Results = getWeek1Results(program, 1, day, exerciseId);

  if (!week1Results || week1Results.length === 0) {
    return null; // No data to base suggestion on
  }

  // Create engine instance and calculate suggestion
  const engine = new SuggestionEngine();
  return engine.calculateSuggestedWeight(exerciseId, week1Results, week2Target);
}

/**
 * Batch calculate suggestions for all exercises in a workout day
 *
 * @param {string} program - Program identifier
 * @param {number} day - Day number
 * @param {Array<{id: string, setsReps: string}>} exercises - Exercise list
 * @returns {Map<string, Object>} Map of exerciseId -> suggestion
 *
 * Performance: <100ms for typical 5-10 exercises
 */
export function calculateDaySuggestions(program, day, exercises) {
  const suggestions = new Map();
  const engine = new SuggestionEngine();

  exercises.forEach(exercise => {
    const week1Results = getWeek1Results(program, 1, day, exercise.id);

    if (week1Results && week1Results.length > 0) {
      const suggestion = engine.calculateSuggestedWeight(
        exercise.id,
        week1Results,
        exercise.setsReps
      );

      if (suggestion) {
        suggestions.set(exercise.id, suggestion);
      }
    }
  });

  return suggestions;
}

// Export singleton instance for convenience
export const suggestionEngine = new SuggestionEngine();

// Export class for custom instantiation
export default SuggestionEngine;
