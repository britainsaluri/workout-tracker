# Weight Recommendation Data Model Specification

**Version:** 1.0.0
**Date:** 2025-10-28
**Purpose:** Define data model and storage strategy for progressive weight recommendations between training weeks

---

## Table of Contents

1. [Overview](#overview)
2. [Current Storage Analysis](#current-storage-analysis)
3. [Data Model Architecture](#data-model-architecture)
4. [Storage Schema](#storage-schema)
5. [JavaScript Implementation](#javascript-implementation)
6. [Performance Strategy](#performance-strategy)
7. [Migration Plan](#migration-plan)
8. [API Reference](#api-reference)

---

## Overview

### Objectives

- **Progressive Overload**: Automatically suggest weight increases based on Week 1 performance
- **Intelligent Recommendations**: Analyze rep achievement vs target ranges
- **User Control**: Allow manual overrides while preserving suggestions
- **Performance**: Minimize computation and storage overhead
- **Backwards Compatibility**: Work with existing localStorage data

### Key Requirements

1. Retrieve all Week 1 results for an exercise across all sets
2. Calculate appropriate weight increase based on performance
3. Store suggestions separately from actual user results
4. Track user overrides for learning purposes
5. Provide confidence levels for suggestions

---

## Current Storage Analysis

### Existing Structure (in `index.html`)

```javascript
// Current state object
const state = {
  currentProgram: 'sheet1',
  currentWeek: 1,
  currentDay: 1,
  workouts: {},
  completedSets: {},        // Main storage for workout results
  previousResults: {},
  workoutData: null
};

// Current storage key format
const key = `${state.currentProgram}_w${state.currentWeek}_d${state.currentDay}_${exerciseId}_${setNumber}`;

// Example: "sheet1_w1_d1_A1_1"
// Stores: { weight: 145, reps: 20, completed: true }
```

### New Storage Layer (in `storage.js`)

```javascript
// Available stores
const STORES = {
  WORKOUTS: 'workouts',    // Workout program definitions
  RESULTS: 'results',       // Workout performance results
  PROGRESS: 'progress',     // User position and progress
  METADATA: 'metadata'      // App metadata
};

// Result structure in RESULTS store
{
  id: 'result_timestamp_random',
  program: 'sheet1',
  week: 1,
  day: 1,
  exerciseId: 'A1',
  exerciseName: 'Barbell Bench Press',
  date: '2025-10-28T12:00:00.000Z',
  sets: [
    { weight: 145, reps: 20, completed: true },
    { weight: 145, reps: 19, completed: true }
  ],
  notes: '',
  duration: null,
  rating: null
}
```

### Storage Strategy Decision

**HYBRID APPROACH**: Use both storage systems during transition

1. **Legacy localStorage** (index.html): Continue for immediate backwards compatibility
2. **New StorageLayer** (storage.js): Add for structured suggestions and future features
3. **Migration Path**: Gradually move to StorageLayer as primary

---

## Data Model Architecture

### Core Entities

#### 1. Week 1 Result (Existing)

```typescript
interface Week1Set {
  weight: number;
  reps: number;
  completed: boolean;
}

interface Week1ExerciseResult {
  exerciseId: string;          // e.g., "A1"
  exerciseName: string;         // e.g., "Barbell Bench Press"
  week: 1;
  day: number;                  // 1-5
  sets: Week1Set[];             // Array of set results
  targetReps: string;           // e.g., "18-20", "10ea"
  date: string;                 // ISO timestamp
}
```

#### 2. Week 2 Suggestion (New)

```typescript
interface WeightSuggestion {
  exerciseId: string;           // e.g., "A1"
  exerciseName: string;         // e.g., "Barbell Bench Press"
  week: 2;
  day: number;                  // 1-5

  // Week 1 Performance Data
  week1Results: {
    sets: Week1Set[];           // All sets from Week 1
    avgWeight: number;          // Average weight used
    avgReps: number;            // Average reps completed
    targetRange: string;        // e.g., "18-20"
  };

  // Week 2 Target
  week2Target: string;          // e.g., "3x18-20"

  // Suggestion Details
  suggestedWeight: number;      // Recommended weight
  increaseAmount: number;       // Delta from Week 1 avg
  increasePercentage: number;   // % increase

  // Reasoning
  reason: SuggestionReason;
  confidence: 'high' | 'medium' | 'low';

  // User Interaction
  userOverride?: number;        // If user chose different weight
  overrideReason?: string;      // Optional user note

  // Metadata
  calculatedAt: string;         // ISO timestamp
  version: string;              // Algorithm version
}

type SuggestionReason =
  | 'hit_top_range_all_sets'    // Hit top of range on all sets
  | 'hit_top_range_most_sets'   // Hit top of range on most sets
  | 'mid_range_consistent'      // Consistently in middle of range
  | 'bottom_range_struggle'     // Struggled at bottom of range
  | 'exceeded_range'            // Exceeded target range
  | 'insufficient_data'         // Not enough Week 1 data
  | 'first_time_exercise';      // No previous data
```

#### 3. Progressive Overload Rules

```typescript
interface ProgressionRule {
  condition: (results: Week1ExerciseResult) => boolean;
  weightIncrease: number | ((currentWeight: number) => number);
  confidence: 'high' | 'medium' | 'low';
  reason: SuggestionReason;
}
```

---

## Storage Schema

### 1. Legacy localStorage Keys (Existing - Keep for Compatibility)

```javascript
// Week 1 results (already exists)
"sheet1_w1_d1_A1_1" => { weight: 145, reps: 20, completed: true }
"sheet1_w1_d1_A1_2" => { weight: 145, reps: 19, completed: true }

// Week 2 results (when user actually performs)
"sheet1_w2_d1_A1_1" => { weight: 155, reps: 18, completed: true }
"sheet1_w2_d1_A1_2" => { weight: 155, reps: 17, completed: true }
```

### 2. New StorageLayer Keys (Add)

```javascript
// Store suggestions in PROGRESS store
store: 'progress'
key: 'suggestions_sheet1_w2_d1_A1'
value: {
  exerciseId: 'A1',
  exerciseName: 'Barbell Bench Press',
  week: 2,
  day: 1,
  week1Results: {
    sets: [
      { weight: 145, reps: 20, completed: true },
      { weight: 145, reps: 19, completed: true }
    ],
    avgWeight: 145,
    avgReps: 19.5,
    targetRange: '18-20'
  },
  week2Target: '3x18-20',
  suggestedWeight: 155,
  increaseAmount: 10,
  increasePercentage: 6.9,
  reason: 'hit_top_range_all_sets',
  confidence: 'high',
  calculatedAt: '2025-10-28T12:00:00.000Z',
  version: '1.0.0'
}

// Store user overrides in PROGRESS store
store: 'progress'
key: 'override_sheet1_w2_d1_A1'
value: {
  exerciseId: 'A1',
  userOverride: 150,          // User chose 150 instead of 155
  overrideReason: 'felt heavy last time',
  overrideAt: '2025-10-28T13:00:00.000Z'
}
```

### 3. Suggestion Cache Strategy

```javascript
// Cache suggestions in memory for current week/day
const suggestionCache = {
  'sheet1_w2_d1': {
    'A1': { /* suggestion object */ },
    'A2': { /* suggestion object */ },
    'B1': { /* suggestion object */ }
  }
};

// Cache invalidation: Clear when switching week/day or new Week 1 data
```

---

## JavaScript Implementation

### Core Suggestion Engine

```javascript
/**
 * Suggestion Engine Module
 * Handles weight recommendation calculations
 */

class SuggestionEngine {
  constructor(storageLayer) {
    this.storage = storageLayer;
    this.cache = new Map();
    this.version = '1.0.0';
  }

  /**
   * Get or calculate suggestion for Week 2 exercise
   * @param {string} program - Program ID (e.g., 'sheet1')
   * @param {number} day - Day number (1-5)
   * @param {string} exerciseId - Exercise ID (e.g., 'A1')
   * @returns {Promise<WeightSuggestion|null>}
   */
  async getSuggestion(program, day, exerciseId) {
    const cacheKey = `${program}_w2_d${day}_${exerciseId}`;

    // Check memory cache
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    // Check storage cache
    const storageKey = `suggestions_${cacheKey}`;
    const cached = await this.storage.get(STORES.PROGRESS, storageKey);

    if (cached && this._isValidCache(cached)) {
      this.cache.set(cacheKey, cached);
      return cached;
    }

    // Calculate new suggestion
    const suggestion = await this._calculateSuggestion(program, day, exerciseId);

    if (suggestion) {
      // Cache in memory and storage
      this.cache.set(cacheKey, suggestion);
      await this.storage.set(STORES.PROGRESS, storageKey, suggestion);
    }

    return suggestion;
  }

  /**
   * Get all Week 1 results for an exercise
   * @param {string} program - Program ID
   * @param {number} day - Day number
   * @param {string} exerciseId - Exercise ID
   * @returns {Promise<Array<Week1Set>>}
   */
  async getWeek1Results(program, day, exerciseId) {
    // Try new storage layer first
    const results = await this.storage.query(STORES.RESULTS, 'exerciseId', exerciseId);
    const week1Results = results.filter(r =>
      r.program === program &&
      r.week === 1 &&
      r.day === day
    );

    if (week1Results.length > 0) {
      // Use most recent result
      week1Results.sort((a, b) => new Date(b.date) - new Date(a.date));
      return week1Results[0].sets;
    }

    // Fallback to legacy localStorage
    const legacySets = [];
    let setNum = 1;

    while (true) {
      const key = `${program}_w1_d${day}_${exerciseId}_${setNum}`;
      const setData = this._getFromLegacyStorage(key);

      if (!setData) break;

      legacySets.push(setData);
      setNum++;
    }

    return legacySets;
  }

  /**
   * Calculate suggestion based on Week 1 performance
   * @private
   */
  async _calculateSuggestion(program, day, exerciseId) {
    // Get Week 1 results
    const week1Sets = await this.getWeek1Results(program, day, exerciseId);

    if (week1Sets.length === 0) {
      return this._createDefaultSuggestion(exerciseId, day);
    }

    // Get exercise details from workout data
    const exerciseInfo = await this._getExerciseInfo(program, 2, day, exerciseId);

    if (!exerciseInfo) {
      return null;
    }

    // Calculate metrics
    const completedSets = week1Sets.filter(s => s.completed);
    if (completedSets.length === 0) {
      return this._createDefaultSuggestion(exerciseId, day);
    }

    const avgWeight = this._average(completedSets.map(s => s.weight));
    const avgReps = this._average(completedSets.map(s => s.reps));
    const week1Target = await this._getWeek1Target(program, day, exerciseId);

    // Parse target range
    const targetRange = this._parseRepRange(week1Target);

    // Apply progression rules
    const rule = this._selectProgressionRule(completedSets, targetRange);
    const suggestedWeight = rule.calculateWeight(avgWeight);
    const increaseAmount = suggestedWeight - avgWeight;
    const increasePercentage = (increaseAmount / avgWeight) * 100;

    return {
      exerciseId,
      exerciseName: exerciseInfo.name,
      week: 2,
      day,
      week1Results: {
        sets: week1Sets,
        avgWeight,
        avgReps,
        targetRange: week1Target
      },
      week2Target: exerciseInfo.setsReps,
      suggestedWeight: Math.round(suggestedWeight * 2) / 2, // Round to nearest 0.5
      increaseAmount: Math.round(increaseAmount * 2) / 2,
      increasePercentage: Math.round(increasePercentage * 10) / 10,
      reason: rule.reason,
      confidence: rule.confidence,
      calculatedAt: new Date().toISOString(),
      version: this.version
    };
  }

  /**
   * Select appropriate progression rule based on performance
   * @private
   */
  _selectProgressionRule(sets, targetRange) {
    const { min, max } = targetRange;

    // Count sets in different ranges
    let atTop = 0;
    let exceeded = 0;
    let inRange = 0;
    let below = 0;

    sets.forEach(set => {
      if (!set.completed) return;

      if (set.reps >= max) {
        if (set.reps === max) atTop++;
        else exceeded++;
      } else if (set.reps >= min) {
        inRange++;
      } else {
        below++;
      }
    });

    const total = atTop + exceeded + inRange + below;

    // Rule 1: Hit top of range on all sets - Increase significantly
    if (atTop === total && total >= 2) {
      return {
        calculateWeight: (current) => current + 10,
        reason: 'hit_top_range_all_sets',
        confidence: 'high'
      };
    }

    // Rule 2: Exceeded range - Strong increase
    if (exceeded >= total * 0.5) {
      return {
        calculateWeight: (current) => current + 15,
        reason: 'exceeded_range',
        confidence: 'high'
      };
    }

    // Rule 3: Hit top on most sets - Moderate increase
    if ((atTop + exceeded) >= total * 0.7) {
      return {
        calculateWeight: (current) => current + 7.5,
        reason: 'hit_top_range_most_sets',
        confidence: 'medium'
      };
    }

    // Rule 4: Consistently mid-range - Small increase
    if (inRange >= total * 0.6) {
      return {
        calculateWeight: (current) => current + 5,
        reason: 'mid_range_consistent',
        confidence: 'medium'
      };
    }

    // Rule 5: Below range - Maintain or slight decrease
    if (below >= total * 0.5) {
      return {
        calculateWeight: (current) => current - 2.5,
        reason: 'bottom_range_struggle',
        confidence: 'low'
      };
    }

    // Default: Small conservative increase
    return {
      calculateWeight: (current) => current + 5,
      reason: 'mid_range_consistent',
      confidence: 'medium'
    };
  }

  /**
   * Parse rep range string (e.g., "18-20" => {min: 18, max: 20})
   * @private
   */
  _parseRepRange(rangeStr) {
    if (!rangeStr) return { min: 0, max: 0 };

    const match = rangeStr.match(/(\d+)-(\d+)/);
    if (match) {
      return { min: parseInt(match[1]), max: parseInt(match[2]) };
    }

    // Single number
    const single = parseInt(rangeStr);
    return isNaN(single) ? { min: 0, max: 0 } : { min: single, max: single };
  }

  /**
   * Create default suggestion for new exercises
   * @private
   */
  _createDefaultSuggestion(exerciseId, day) {
    return {
      exerciseId,
      exerciseName: '',
      week: 2,
      day,
      week1Results: {
        sets: [],
        avgWeight: 0,
        avgReps: 0,
        targetRange: ''
      },
      week2Target: '',
      suggestedWeight: 0,
      increaseAmount: 0,
      increasePercentage: 0,
      reason: 'first_time_exercise',
      confidence: 'low',
      calculatedAt: new Date().toISOString(),
      version: this.version
    };
  }

  /**
   * Save user override
   * @param {string} program - Program ID
   * @param {number} day - Day number
   * @param {string} exerciseId - Exercise ID
   * @param {number} userWeight - Weight user chose
   * @param {string} reason - Optional reason for override
   */
  async saveOverride(program, day, exerciseId, userWeight, reason = '') {
    const key = `override_${program}_w2_d${day}_${exerciseId}`;

    await this.storage.set(STORES.PROGRESS, key, {
      exerciseId,
      userOverride: userWeight,
      overrideReason: reason,
      overrideAt: new Date().toISOString()
    });

    // Update cached suggestion
    const cacheKey = `${program}_w2_d${day}_${exerciseId}`;
    const suggestion = this.cache.get(cacheKey);

    if (suggestion) {
      suggestion.userOverride = userWeight;
      suggestion.overrideReason = reason;
      this.cache.set(cacheKey, suggestion);
    }
  }

  /**
   * Get user override if exists
   * @param {string} program - Program ID
   * @param {number} day - Day number
   * @param {string} exerciseId - Exercise ID
   * @returns {Promise<number|null>}
   */
  async getOverride(program, day, exerciseId) {
    const key = `override_${program}_w2_d${day}_${exerciseId}`;
    const override = await this.storage.get(STORES.PROGRESS, key);

    return override ? override.userOverride : null;
  }

  /**
   * Pre-calculate all suggestions for a week/day
   * @param {string} program - Program ID
   * @param {number} week - Week number
   * @param {number} day - Day number
   */
  async precalculateDay(program, week, day) {
    if (week !== 2) return; // Only for Week 2

    // Get all exercises for this day
    const exercises = await this._getDayExercises(program, week, day);

    // Calculate suggestions in parallel
    const promises = exercises.map(ex =>
      this.getSuggestion(program, day, ex.id)
    );

    await Promise.all(promises);

    console.log(`[SuggestionEngine] Pre-calculated ${exercises.length} suggestions for Week ${week} Day ${day}`);
  }

  /**
   * Clear suggestion cache
   * @param {string} program - Optional program filter
   * @param {number} day - Optional day filter
   */
  clearCache(program = null, day = null) {
    if (!program) {
      this.cache.clear();
      return;
    }

    const prefix = day ? `${program}_w2_d${day}` : `${program}_w2`;

    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        this.cache.delete(key);
      }
    }
  }

  // Helper methods
  _average(arr) {
    return arr.reduce((sum, val) => sum + val, 0) / arr.length;
  }

  _isValidCache(cached) {
    // Cache is valid if created within last 7 days and same version
    const age = Date.now() - new Date(cached.calculatedAt).getTime();
    const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days

    return age < maxAge && cached.version === this.version;
  }

  _getFromLegacyStorage(key) {
    try {
      const stateStr = localStorage.getItem('workoutTrackerState');
      if (!stateStr) return null;

      const state = JSON.parse(stateStr);
      return state.completedSets?.[key] || null;
    } catch (error) {
      console.error('[SuggestionEngine] Failed to read legacy storage:', error);
      return null;
    }
  }

  async _getExerciseInfo(program, week, day, exerciseId) {
    // This would get exercise details from workout data
    // Implementation depends on workout data structure
    return {
      id: exerciseId,
      name: 'Exercise Name',
      setsReps: '3x18-20'
    };
  }

  async _getWeek1Target(program, day, exerciseId) {
    // Get Week 1 target reps for this exercise
    return '18-20';
  }

  async _getDayExercises(program, week, day) {
    // Get all exercises for a specific day
    return [];
  }
}

// Export singleton instance
export const suggestionEngine = new SuggestionEngine(storage);
```

### Integration with UI

```javascript
/**
 * UI Integration Example
 * How to use suggestions in the workout display
 */

// When rendering Week 2 workout
async function renderWeek2Exercise(exercise, day) {
  // Get suggestion
  const suggestion = await suggestionEngine.getSuggestion(
    state.currentProgram,
    day,
    exercise.id
  );

  if (!suggestion || suggestion.confidence === 'low') {
    // No good suggestion, use default display
    return renderDefaultExercise(exercise);
  }

  // Check for user override
  const override = await suggestionEngine.getOverride(
    state.currentProgram,
    day,
    exercise.id
  );

  const displayWeight = override || suggestion.suggestedWeight;

  // Render with suggestion
  return `
    <div class="workout-card">
      <div class="exercise-header">
        <div class="exercise-name">
          <strong>[${exercise.id}]</strong> ${exercise.name}
        </div>
      </div>

      <!-- Suggestion Banner -->
      <div class="suggestion-banner ${suggestion.confidence}">
        <div class="suggestion-icon">💡</div>
        <div class="suggestion-content">
          <div class="suggestion-label">Recommended Weight</div>
          <div class="suggestion-value">${displayWeight} lbs</div>
          <div class="suggestion-reason">${formatReason(suggestion.reason)}</div>
          <div class="suggestion-details">
            +${suggestion.increaseAmount} lbs (+${suggestion.increasePercentage}%)
            from Week 1 avg of ${suggestion.week1Results.avgWeight} lbs
          </div>
        </div>
        <button class="suggestion-action" onclick="applySuggestion('${exercise.id}', ${displayWeight})">
          Use This
        </button>
      </div>

      <!-- Week 1 Performance Summary -->
      <div class="week1-summary">
        <div class="summary-label">Week 1 Performance</div>
        <div class="summary-stats">
          ${suggestion.week1Results.sets.map((set, i) => `
            <div class="set-stat">
              Set ${i + 1}: ${set.weight} lbs × ${set.reps} reps
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Sets input (normal) -->
      ${renderSetsInput(exercise, displayWeight)}
    </div>
  `;
}

// Apply suggestion to all sets
function applySuggestion(exerciseId, weight) {
  const card = document.querySelector(`[data-exercise-id="${exerciseId}"]`);
  const weightInputs = card.querySelectorAll('.weight-input');

  weightInputs.forEach(input => {
    input.value = weight;
    // Trigger input event to save to state
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });

  showToast(`Applied ${weight} lbs to all sets`);
}

// Format reason for display
function formatReason(reason) {
  const messages = {
    'hit_top_range_all_sets': 'You hit the top of the target range on all sets!',
    'hit_top_range_most_sets': 'You hit the top range on most sets',
    'mid_range_consistent': 'Consistent performance in target range',
    'exceeded_range': 'You exceeded the target range!',
    'bottom_range_struggle': 'Stay at this weight to build consistency',
    'first_time_exercise': 'Start with a manageable weight',
    'insufficient_data': 'Not enough data from Week 1'
  };

  return messages[reason] || 'Based on Week 1 performance';
}
```

---

## Performance Strategy

### Computation Timing

#### Option A: Lazy Load (RECOMMENDED)
```javascript
// Calculate when Week 2 page loads
async function loadWeek2Day(day) {
  // Show loading indicator
  showLoading();

  // Get suggestions for all exercises on this day
  const exercises = getCurrentExercises();
  const suggestions = await Promise.all(
    exercises.map(ex => suggestionEngine.getSuggestion(state.currentProgram, day, ex.id))
  );

  // Render with suggestions
  renderWorkout(exercises, suggestions);

  hideLoading();
}
```

**Pros:**
- Only calculate when needed
- Fresh calculations based on latest data
- No wasted computation for unused days

**Cons:**
- Slight delay when loading Week 2 days (1-2 seconds)
- Repeated calculations if switching between days

#### Option B: Pre-calculate on Week 1 Complete
```javascript
// When user completes Week 1 Day 5
async function onWeek1Complete() {
  showToast('Week 1 Complete! Preparing Week 2...');

  // Pre-calculate all Week 2 suggestions
  for (let day = 1; day <= 5; day++) {
    await suggestionEngine.precalculateDay('sheet1', 2, day);
  }

  showToast('Week 2 ready!');
}
```

**Pros:**
- Instant display when loading Week 2 days
- All calculations done once
- Better UX for Week 2

**Cons:**
- Upfront computation time
- Calculations may be wasted if data changes

#### Option C: Background Pre-calculation (HYBRID - BEST)
```javascript
// Start background calculation when entering Week 1 Day 5
async function onEnterWeek1Day5() {
  // Non-blocking background calculation
  setTimeout(async () => {
    for (let day = 1; day <= 5; day++) {
      await suggestionEngine.precalculateDay('sheet1', 2, day);
    }
    console.log('Week 2 suggestions ready');
  }, 1000); // Delay 1 second to not block UI
}

// When loading Week 2, use cached if available, calculate if not
async function loadWeek2Day(day) {
  const suggestion = await suggestionEngine.getSuggestion(
    state.currentProgram,
    day,
    exerciseId
  );
  // Will use cache if available from background calculation
}
```

**Pros:**
- No blocking UI
- Likely cached when user enters Week 2
- Fallback to calculation if cache miss

**Cons:**
- Slightly more complex logic

### Caching Strategy

```javascript
// Three-tier cache
1. Memory cache: Map in suggestionEngine instance (fastest)
2. Storage cache: IndexedDB/localStorage (fast)
3. Calculation: On-demand if cache miss (slower)

// Cache invalidation triggers:
- New Week 1 data for same exercise
- Manual cache clear
- Version change in algorithm
- Cache age > 7 days
```

---

## Migration Plan

### Phase 1: Add Suggestion Engine (Week 1)

1. Create `/Users/britainsaluri/workout-tracker/src/utils/suggestionEngine.js`
2. Implement core SuggestionEngine class
3. Add unit tests
4. No UI changes yet

### Phase 2: Storage Integration (Week 2)

1. Add suggestion storage to StorageLayer
2. Implement dual-read (legacy + new storage)
3. Test with existing data
4. Verify backwards compatibility

### Phase 3: UI Integration (Week 3)

1. Add suggestion banner component to workout cards
2. Implement "Use This" action
3. Add Week 1 performance summary display
4. Test on mobile devices

### Phase 4: Background Optimization (Week 4)

1. Add pre-calculation on Week 1 Day 5
2. Implement cache warming
3. Performance monitoring
4. User feedback collection

### Backwards Compatibility

```javascript
// Always support reading from legacy localStorage
function getWeek1Data(exerciseId, day) {
  // Try new storage first
  const newData = await storage.query(STORES.RESULTS, 'exerciseId', exerciseId);

  if (newData.length > 0) {
    return newData;
  }

  // Fallback to legacy
  return readLegacyLocalStorage(exerciseId, day);
}

// Gradual migration: Save to both systems during transition
async function saveWorkoutResult(result) {
  // Save to new storage
  await storage.set(STORES.RESULTS, resultId, result);

  // Also save to legacy format for backwards compatibility
  saveLegacyFormat(result);
}
```

---

## API Reference

### SuggestionEngine API

```javascript
// Get suggestion for an exercise
await suggestionEngine.getSuggestion(program, day, exerciseId);
// Returns: WeightSuggestion object

// Get Week 1 results
await suggestionEngine.getWeek1Results(program, day, exerciseId);
// Returns: Array<Week1Set>

// Save user override
await suggestionEngine.saveOverride(program, day, exerciseId, weight, reason);
// Returns: Promise<void>

// Get user override
await suggestionEngine.getOverride(program, day, exerciseId);
// Returns: number | null

// Pre-calculate suggestions for a day
await suggestionEngine.precalculateDay(program, week, day);
// Returns: Promise<void>

// Clear cache
suggestionEngine.clearCache(program, day);
// Returns: void
```

### Storage Keys Quick Reference

```javascript
// Week 1 results (legacy)
"sheet1_w1_d1_A1_1" => { weight, reps, completed }

// Week 2 results (legacy)
"sheet1_w2_d1_A1_1" => { weight, reps, completed }

// Suggestions (new storage)
store: STORES.PROGRESS
key: "suggestions_sheet1_w2_d1_A1"
value: WeightSuggestion

// Overrides (new storage)
store: STORES.PROGRESS
key: "override_sheet1_w2_d1_A1"
value: { userOverride, overrideReason, overrideAt }
```

---

## Performance Metrics

### Target Performance

- **Suggestion Calculation**: < 50ms per exercise
- **Day Pre-calculation**: < 500ms for all exercises
- **Cache Retrieval**: < 5ms
- **Storage Read**: < 20ms (localStorage), < 50ms (IndexedDB)
- **UI Render with Suggestions**: < 200ms total

### Storage Footprint

```javascript
// Per suggestion: ~500 bytes
// 5 days × 6 exercises average = 30 suggestions
// Total: ~15KB for all Week 2 suggestions

// With overrides and metadata: ~20KB total
// Well within localStorage 5MB limit
```

---

## Example Usage

### Complete Flow Example

```javascript
// User completes Week 1 Day 5, Set 2 of Exercise A1
async function handleSetComplete(exerciseId, setNum, weight, reps) {
  // Save to legacy storage
  const key = `sheet1_w1_d5_${exerciseId}_${setNum}`;
  state.completedSets[key] = { weight, reps, completed: true };
  saveState();

  // Also save to new storage layer
  await workoutState.saveWorkoutResult({
    program: 'sheet1',
    week: 1,
    day: 5,
    exerciseId,
    exerciseName: 'Barbell Bench Press',
    sets: [{ weight, reps, completed: true }]
  });

  // Background: Check if this is last exercise of Week 1
  if (isLastExerciseOfWeek1()) {
    // Trigger background pre-calculation
    setTimeout(() => {
      for (let day = 1; day <= 5; day++) {
        suggestionEngine.precalculateDay('sheet1', 2, day);
      }
    }, 1000);
  }
}

// User navigates to Week 2 Day 1
async function loadWeek2Day1() {
  showLoading();

  // Get exercises for this day
  const exercises = getCurrentExercises(); // ['A1', 'A2', 'B1', 'B2']

  // Get suggestions (will use cache if available)
  const suggestions = await Promise.all(
    exercises.map(ex => suggestionEngine.getSuggestion('sheet1', 1, ex.id))
  );

  // Render UI with suggestions
  renderWorkoutWithSuggestions(exercises, suggestions);

  hideLoading();
}

// User applies suggestion
async function applySuggestion(exerciseId, weight) {
  // Fill all weight inputs
  const inputs = document.querySelectorAll(`.weight-input[data-exercise="${exerciseId}"]`);
  inputs.forEach(input => {
    input.value = weight;
    input.dispatchEvent(new Event('input'));
  });

  showToast(`Applied ${weight} lbs to all sets`);
}

// User overrides with different weight
async function handleWeightOverride(exerciseId, userWeight) {
  const suggestion = await suggestionEngine.getSuggestion('sheet1', 1, exerciseId);

  if (suggestion && userWeight !== suggestion.suggestedWeight) {
    // Save override
    await suggestionEngine.saveOverride('sheet1', 1, exerciseId, userWeight, 'user_preference');
  }
}
```

---

## Future Enhancements

### Version 1.1 - Learning System
- Track override patterns
- Adjust suggestions based on user preferences
- Personalized progression rates

### Version 1.2 - Advanced Analytics
- Volume calculations (sets × reps × weight)
- Fatigue indicators
- Deload recommendations

### Version 1.3 - Multi-week Planning
- Suggest Week 3, 4, 5+ progressions
- Periodization support
- Plateau detection

### Version 2.0 - Machine Learning
- Neural network for personalized suggestions
- Pattern recognition across users
- Adaptive progression algorithms

---

## Conclusion

This data model provides:

1. **Robust Storage**: Dual-layer approach with backwards compatibility
2. **Intelligent Suggestions**: Rule-based progression with confidence levels
3. **User Control**: Overrides respected and tracked
4. **Performance**: Cached calculations with lazy loading
5. **Extensibility**: Clean API for future enhancements

**Recommended Implementation**: Start with Phase 1 (suggestion engine), validate with tests, then progressively add UI integration and optimization.

---

**Document Version:** 1.0.0
**Last Updated:** 2025-10-28
**Author:** Backend Development Agent
**Status:** Ready for Implementation
