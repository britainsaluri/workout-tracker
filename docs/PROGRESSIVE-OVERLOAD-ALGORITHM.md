# Progressive Overload Algorithm Specification

## Overview

This document specifies the intelligent algorithm for suggesting weight increases between workout weeks, implementing progressive overload principles based on user performance data.

## Core Principles

1. **Performance-Based Progression**: Weight recommendations adapt based on actual user performance
2. **Exercise-Specific Logic**: Different progression rates for compound vs isolation exercises
3. **User Safety**: Conservative recommendations with override capability
4. **Learning System**: Tracks user patterns to refine suggestions over time

---

## 1. Weight Progression Rules

### 1.1 Performance Thresholds

```
Performance Level → Weight Adjustment

Exceeded (All sets at top of rep range) → +10 lbs (compound) / +5 lbs (isolation)
Strong (All sets in upper 75% of range) → +5 lbs (compound) / +2.5 lbs (isolation)
Maintained (All sets in middle 50% of range) → Same weight
Struggled (Any set in lower 25% of range) → Same weight
Failed (Any incomplete sets) → -5 lbs
```

### 1.2 Rep Range Analysis

For a target range (e.g., 18-20 reps):
- **Top 100%**: All sets hit maximum (20 reps)
- **Upper 75%**: All sets hit 19-20 reps
- **Middle 50%**: Sets between 18-19 reps
- **Lower 25%**: Sets at 18 reps or incomplete
- **Failed**: Any set below minimum (< 18 reps)

### 1.3 Example Scenarios

```
Target: 2 sets × 18-20 reps @ 145 lbs

Scenario A (Exceeded):
  Week 1: 145×20, 145×20
  Week 2: Suggest 155 lbs (+10) → "Crushed it! Time to level up."

Scenario B (Strong):
  Week 1: 145×20, 145×19
  Week 2: Suggest 150 lbs (+5) → "Great work! Small bump."

Scenario C (Maintained):
  Week 1: 145×19, 145×18
  Week 2: Suggest 145 lbs (same) → "Master this weight first."

Scenario D (Struggled):
  Week 1: 145×18, 145×16
  Week 2: Suggest 145 lbs (same) → "Let's nail this weight."

Scenario E (Failed):
  Week 1: 145×15, 145×13
  Week 2: Suggest 140 lbs (-5) → "Let's dial it back and build up."
```

---

## 2. Algorithm Pseudocode

### 2.1 Core Calculation Function

```javascript
function calculateSuggestedWeight(currentWeekExercises, previousWeekExercises) {
  /**
   * @param currentWeekExercises - Array of exercises for current week
   * @param previousWeekExercises - Array of completed exercises from previous week
   * @returns Map of exerciseId → { suggestedWeight, reason, confidence }
   */

  const suggestions = new Map();

  for (const currentExercise of currentWeekExercises) {
    // Find matching previous week exercise
    const previousExercise = findMatchingExercise(
      currentExercise,
      previousWeekExercises
    );

    if (!previousExercise) {
      // No history - use current prescription or baseline
      suggestions.set(currentExercise.id, {
        suggestedWeight: currentExercise.prescribedWeight || estimateStartingWeight(currentExercise),
        reason: "No previous data - starting fresh",
        confidence: "low"
      });
      continue;
    }

    // Analyze previous week performance
    const performance = analyzePerformance(
      previousExercise.sets,
      previousExercise.repRange
    );

    // Calculate weight adjustment
    const adjustment = calculateAdjustment(
      performance,
      previousExercise.exerciseType,
      previousExercise.userLevel
    );

    // Apply adjustment
    const suggestedWeight = previousExercise.actualWeight + adjustment.amount;

    suggestions.set(currentExercise.id, {
      suggestedWeight: Math.round(suggestedWeight * 2) / 2, // Round to nearest 0.5 lb
      reason: adjustment.reason,
      confidence: adjustment.confidence,
      previousWeight: previousExercise.actualWeight,
      previousPerformance: performance.summary
    });
  }

  return suggestions;
}
```

### 2.2 Performance Analysis Function

```javascript
function analyzePerformance(sets, repRange) {
  /**
   * @param sets - Array of { weight, reps, completed }
   * @param repRange - { min, max }
   * @returns { level: string, score: number, summary: string }
   */

  const [minReps, maxReps] = [repRange.min, repRange.max];
  const repSpan = maxReps - minReps;

  // Check if any sets failed
  const failedSets = sets.filter(s => !s.completed || s.reps < minReps);
  if (failedSets.length > 0) {
    return {
      level: "FAILED",
      score: 0,
      summary: `${failedSets.length} set(s) incomplete`
    };
  }

  // Calculate performance score for each set
  const setScores = sets.map(set => {
    if (set.reps >= maxReps) return 100; // Top of range
    if (set.reps <= minReps) return 25;  // Bottom of range

    // Linear interpolation between min and max
    const progress = (set.reps - minReps) / repSpan;
    return 25 + (progress * 75); // 25% to 100%
  });

  // Average score across all sets
  const avgScore = setScores.reduce((a, b) => a + b, 0) / setScores.length;

  // Determine performance level
  let level;
  if (avgScore >= 100) level = "EXCEEDED";
  else if (avgScore >= 75) level = "STRONG";
  else if (avgScore >= 50) level = "MAINTAINED";
  else level = "STRUGGLED";

  return {
    level,
    score: avgScore,
    summary: `Avg ${Math.round(avgScore)}% of target range`,
    allSets: setScores
  };
}
```

### 2.3 Adjustment Calculation Function

```javascript
function calculateAdjustment(performance, exerciseType, userLevel) {
  /**
   * @param performance - { level, score, summary }
   * @param exerciseType - "COMPOUND" | "ISOLATION"
   * @param userLevel - "BEGINNER" | "INTERMEDIATE" | "ADVANCED"
   * @returns { amount: number, reason: string, confidence: string }
   */

  // Base adjustments by exercise type
  const adjustments = {
    COMPOUND: {
      EXCEEDED: { amount: 10, reason: "Crushed it! Time to level up." },
      STRONG: { amount: 5, reason: "Great work! Small bump." },
      MAINTAINED: { amount: 0, reason: "Master this weight first." },
      STRUGGLED: { amount: 0, reason: "Let's nail this weight." },
      FAILED: { amount: -5, reason: "Let's dial it back and build up." }
    },
    ISOLATION: {
      EXCEEDED: { amount: 5, reason: "Perfect form! Moving up." },
      STRONG: { amount: 2.5, reason: "Solid progress! Slight increase." },
      MAINTAINED: { amount: 0, reason: "Keep building at this weight." },
      STRUGGLED: { amount: 0, reason: "Focus on control here." },
      FAILED: { amount: -2.5, reason: "Drop weight, perfect technique." }
    }
  };

  // Get base adjustment
  const base = adjustments[exerciseType][performance.level];

  // Modify for user level
  const levelModifiers = {
    BEGINNER: 0.75,    // 25% smaller jumps
    INTERMEDIATE: 1.0,  // Standard jumps
    ADVANCED: 0.5       // 50% smaller jumps (more precise)
  };

  const modifier = levelModifiers[userLevel] || 1.0;
  const adjustedAmount = base.amount * modifier;

  // Determine confidence
  let confidence;
  if (performance.level === "EXCEEDED" || performance.level === "FAILED") {
    confidence = "high"; // Clear signal
  } else if (performance.level === "STRONG" || performance.level === "STRUGGLED") {
    confidence = "medium";
  } else {
    confidence = "low"; // Borderline performance
  }

  return {
    amount: adjustedAmount,
    reason: base.reason,
    confidence
  };
}
```

### 2.4 Exercise Matching Function

```javascript
function findMatchingExercise(currentExercise, previousWeekExercises) {
  /**
   * Finds matching exercise from previous week
   * Handles variations in exercise names and formats
   */

  // Direct ID match (if available)
  const directMatch = previousWeekExercises.find(
    e => e.id === currentExercise.id
  );
  if (directMatch) return directMatch;

  // Fuzzy match by name normalization
  const normalizedCurrent = normalizeExerciseName(currentExercise.name);

  return previousWeekExercises.find(e => {
    const normalizedPrev = normalizeExerciseName(e.name);
    return normalizedPrev === normalizedCurrent;
  });
}

function normalizeExerciseName(name) {
  return name
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[^\w\s]/g, "")
    .trim();
}
```

---

## 3. Edge Cases & Handling

### 3.1 No Previous Week Data

**Scenario**: First time user or new exercise introduced

**Solution**:
```javascript
function estimateStartingWeight(exercise) {
  // Use prescribed weight if available
  if (exercise.prescribedWeight) {
    return exercise.prescribedWeight;
  }

  // Estimate based on exercise type and user profile
  const baseWeights = {
    COMPOUND: {
      BEGINNER: 95,      // Empty barbell + 25 lbs
      INTERMEDIATE: 135,  // 45 lb plates
      ADVANCED: 185
    },
    ISOLATION: {
      BEGINNER: 15,
      INTERMEDIATE: 25,
      ADVANCED: 35
    }
  };

  return baseWeights[exercise.type][exercise.userLevel] || 25;
}
```

### 3.2 Incomplete Sets

**Scenario**: User logged weight but not all reps

**Solution**:
- If ≥ 50% of sets complete: Analyze based on completed sets
- If < 50% complete: Treat as "FAILED" performance
- Mark suggestion with lower confidence

```javascript
function handleIncompleteSets(sets, repRange) {
  const completedSets = sets.filter(s => s.reps > 0);
  const completionRate = completedSets.length / sets.length;

  if (completionRate < 0.5) {
    return {
      level: "FAILED",
      score: 0,
      summary: "Incomplete workout data",
      confidence: "low"
    };
  }

  // Analyze completed sets only
  const performance = analyzePerformance(completedSets, repRange);
  performance.confidence = "low"; // Reduce confidence
  return performance;
}
```

### 3.3 Different Rep Ranges Week-to-Week

**Scenario**: Week 1 was 3×8-10, Week 2 is 2×18-20

**Solution**:
- Cannot directly compare performance across different rep schemes
- Use last weight as baseline, no automatic adjustment
- Suggest same weight with note about different protocol

```javascript
function handleDifferentRepSchemes(currentExercise, previousExercise) {
  const currentRange = currentExercise.repRange;
  const previousRange = previousExercise.repRange;

  if (!areRepRangesSimilar(currentRange, previousRange)) {
    return {
      suggestedWeight: previousExercise.actualWeight,
      reason: "New rep scheme - starting with previous weight",
      confidence: "low",
      note: `Changed from ${previousRange.min}-${previousRange.max} to ${currentRange.min}-${currentRange.max} reps`
    };
  }
}

function areRepRangesSimilar(range1, range2) {
  // Consider similar if within 20% of rep count
  const avg1 = (range1.min + range1.max) / 2;
  const avg2 = (range2.min + range2.max) / 2;
  const difference = Math.abs(avg1 - avg2) / avg1;

  return difference < 0.2; // 20% tolerance
}
```

### 3.4 Exercise Not Found in Previous Week

**Scenario**: Exercise exists in Week 2 but not in Week 1

**Solution**:
- Use prescribed weight from program
- If none, estimate based on similar exercises
- Mark as "new exercise" with low confidence

```javascript
function handleNewExercise(currentExercise, allPreviousExercises) {
  // Try to find similar exercises for reference
  const similarExercises = findSimilarExercises(
    currentExercise,
    allPreviousExercises
  );

  if (similarExercises.length > 0) {
    const avgWeight = similarExercises.reduce((sum, e) => sum + e.actualWeight, 0) / similarExercises.length;

    return {
      suggestedWeight: Math.round(avgWeight),
      reason: `Based on similar exercises`,
      confidence: "medium",
      references: similarExercises.map(e => e.name)
    };
  }

  // No similar exercises - use defaults
  return {
    suggestedWeight: estimateStartingWeight(currentExercise),
    reason: "New exercise - conservative starting weight",
    confidence: "low"
  };
}
```

---

## 4. Personalization Factors

### 4.1 User Strength Level

```javascript
const USER_LEVELS = {
  BEGINNER: {
    description: "< 6 months training experience",
    compoundIncrement: 7.5,   // 75% of standard
    isolationIncrement: 3.75,
    conservativeFactor: 0.75
  },
  INTERMEDIATE: {
    description: "6 months - 2 years experience",
    compoundIncrement: 10,    // Standard
    isolationIncrement: 5,
    conservativeFactor: 1.0
  },
  ADVANCED: {
    description: "> 2 years experience",
    compoundIncrement: 5,     // 50% of standard (more precise)
    isolationIncrement: 2.5,
    conservativeFactor: 0.5
  }
};
```

### 4.2 Injury/Recovery Mode

```javascript
function applyRecoveryMode(suggestion, isRecovering) {
  if (!isRecovering) return suggestion;

  // Halve all positive adjustments
  if (suggestion.amount > 0) {
    suggestion.amount = suggestion.amount / 2;
    suggestion.reason = `[Recovery Mode] ${suggestion.reason}`;
    suggestion.note = "Taking it easy during recovery";
  }

  // Never decrease weight in recovery mode
  if (suggestion.amount < 0) {
    suggestion.amount = 0;
    suggestion.reason = "Maintaining weight during recovery";
  }

  return suggestion;
}
```

### 4.3 Exercise Type Classification

```javascript
const EXERCISE_CLASSIFICATIONS = {
  COMPOUND: [
    "squat", "deadlift", "bench press", "overhead press",
    "row", "pull up", "dip", "lunge", "leg press"
  ],
  ISOLATION: [
    "curl", "extension", "raise", "fly", "cable",
    "machine", "lateral", "calf", "ab", "crunch"
  ]
};

function classifyExercise(exerciseName) {
  const normalized = exerciseName.toLowerCase();

  for (const [type, keywords] of Object.entries(EXERCISE_CLASSIFICATIONS)) {
    if (keywords.some(keyword => normalized.includes(keyword))) {
      return type;
    }
  }

  // Default to isolation for unknown exercises (more conservative)
  return "ISOLATION";
}
```

---

## 5. Display Logic

### 5.1 When to Show Suggestions

```javascript
function shouldShowSuggestion(exercise, weekNumber, hasHistory) {
  // Only show in Week 2+ when there's previous data
  if (weekNumber === 1) return false;
  if (!hasHistory) return false;

  // Don't show if user already entered custom weight
  if (exercise.userEnteredWeight) return false;

  // Show suggestion
  return true;
}
```

### 5.2 Suggestion Display Format

```javascript
function formatSuggestion(suggestion) {
  const { suggestedWeight, previousWeight, reason, confidence } = suggestion;
  const change = suggestedWeight - previousWeight;
  const sign = change > 0 ? "+" : "";

  return {
    primary: `Suggested: ${suggestedWeight} lbs`,
    secondary: `${sign}${change} from last week (${previousWeight} lbs)`,
    tooltip: reason,
    confidenceBadge: confidence, // "high", "medium", "low"
    color: getConfidenceColor(confidence)
  };
}

function getConfidenceColor(confidence) {
  switch (confidence) {
    case "high": return "green";
    case "medium": return "yellow";
    case "low": return "gray";
    default: return "gray";
  }
}
```

### 5.3 User Override Capability

```javascript
function handleUserOverride(exerciseId, userWeight, suggestedWeight) {
  // Track override for learning
  const override = {
    exerciseId,
    suggestedWeight,
    actualWeight: userWeight,
    difference: userWeight - suggestedWeight,
    timestamp: Date.now()
  };

  // Store for pattern analysis
  trackOverride(override);

  // If user consistently overrides by similar amount, adjust future suggestions
  const overridePattern = analyzeOverridePattern(exerciseId);
  if (overridePattern.consistent) {
    applyOverrideLearning(exerciseId, overridePattern.averageDifference);
  }
}
```

---

## 6. Data Persistence & Learning

### 6.1 Storage Schema

```javascript
// LocalStorage structure
const STORAGE_KEYS = {
  SUGGESTIONS: "workout_weight_suggestions",
  OVERRIDES: "workout_user_overrides",
  PERFORMANCE_HISTORY: "workout_performance_history",
  USER_PROFILE: "workout_user_profile"
};

// Suggestion object structure
interface WeightSuggestion {
  exerciseId: string;
  weekNumber: number;
  suggestedWeight: number;
  previousWeight: number;
  adjustment: number;
  reason: string;
  confidence: "high" | "medium" | "low";
  performanceData: {
    level: string;
    score: number;
    summary: string;
  };
  timestamp: number;
  accepted: boolean | null; // null = not yet decided
}
```

### 6.2 Learning from User Patterns

```javascript
function analyzeOverridePattern(exerciseId) {
  const overrides = getOverridesForExercise(exerciseId);

  if (overrides.length < 3) {
    return { consistent: false }; // Need more data
  }

  // Calculate average difference
  const differences = overrides.map(o => o.difference);
  const avgDifference = differences.reduce((a, b) => a + b, 0) / differences.length;

  // Check consistency (standard deviation)
  const variance = differences.reduce((sum, diff) => {
    return sum + Math.pow(diff - avgDifference, 2);
  }, 0) / differences.length;
  const stdDev = Math.sqrt(variance);

  // Consider consistent if stdDev < 5 lbs
  const consistent = stdDev < 5;

  return {
    consistent,
    averageDifference: Math.round(avgDifference),
    confidence: consistent ? "high" : "low",
    sampleSize: overrides.length
  };
}

function applyOverrideLearning(exerciseId, adjustment) {
  // Store user preference for this exercise
  const preferences = getUserPreferences();
  preferences.exerciseAdjustments = preferences.exerciseAdjustments || {};
  preferences.exerciseAdjustments[exerciseId] = adjustment;

  saveUserPreferences(preferences);
}
```

### 6.3 Performance History Tracking

```javascript
function trackPerformanceHistory(exerciseId, weekNumber, performance) {
  const history = getPerformanceHistory();

  history.push({
    exerciseId,
    weekNumber,
    date: new Date().toISOString(),
    performance: {
      level: performance.level,
      score: performance.score,
      sets: performance.allSets
    },
    weight: performance.weight,
    volume: performance.totalVolume
  });

  // Keep last 12 weeks of history per exercise
  const filtered = history
    .filter(h => h.exerciseId === exerciseId)
    .slice(-12);

  savePerformanceHistory(filtered);
}
```

---

## 7. Implementation Flowchart

```
START (User navigates to Week 2 workout)
  |
  v
Fetch Week 1 completion data
  |
  v
For each Week 2 exercise:
  |
  +-- Find matching Week 1 exercise
  |     |
  |     +-- Match found?
  |     |     |
  |     |     YES --> Analyze Week 1 performance
  |     |     |         |
  |     |     |         +-- Calculate performance score (0-100)
  |     |     |         |
  |     |     |         +-- Determine performance level
  |     |     |         |     (EXCEEDED, STRONG, MAINTAINED, STRUGGLED, FAILED)
  |     |     |         |
  |     |     |         +-- Get exercise type (COMPOUND/ISOLATION)
  |     |     |         |
  |     |     |         +-- Calculate weight adjustment
  |     |     |         |     |
  |     |     |         |     +-- Apply user level modifier
  |     |     |         |     +-- Apply recovery mode (if active)
  |     |     |         |     +-- Apply learned preferences
  |     |     |         |
  |     |     |         +-- Generate suggestion object
  |     |     |         |     {weight, reason, confidence}
  |     |     |         |
  |     |     |         +-- Store suggestion
  |     |     |
  |     |     NO --> Use prescribed weight or estimate
  |     |           |
  |     |           +-- Store baseline suggestion
  |
  v
Display suggestions in UI
  |
  +-- Show suggested weight
  +-- Show change from last week
  +-- Show confidence indicator
  +-- Allow user to accept/override
  |
  v
User enters weight (accept or override)
  |
  v
Track acceptance/override
  |
  +-- If override: Store for learning
  +-- Analyze patterns (after 3+ overrides)
  +-- Adjust future suggestions
  |
  v
Store performance data for next week
  |
  v
END
```

---

## 8. Algorithm Validation & Testing

### 8.1 Test Scenarios

```javascript
// Test Case 1: Perfect progression
const testCase1 = {
  input: {
    week1: { sets: [{ reps: 20 }, { reps: 20 }], weight: 145, repRange: { min: 18, max: 20 } },
    exerciseType: "COMPOUND",
    userLevel: "INTERMEDIATE"
  },
  expected: {
    suggestedWeight: 155,
    adjustment: 10,
    level: "EXCEEDED"
  }
};

// Test Case 2: Partial success
const testCase2 = {
  input: {
    week1: { sets: [{ reps: 20 }, { reps: 19 }], weight: 145, repRange: { min: 18, max: 20 } },
    exerciseType: "COMPOUND",
    userLevel: "INTERMEDIATE"
  },
  expected: {
    suggestedWeight: 150,
    adjustment: 5,
    level: "STRONG"
  }
};

// Test Case 3: Struggled
const testCase3 = {
  input: {
    week1: { sets: [{ reps: 18 }, { reps: 16 }], weight: 145, repRange: { min: 18, max: 20 } },
    exerciseType: "COMPOUND",
    userLevel: "INTERMEDIATE"
  },
  expected: {
    suggestedWeight: 145,
    adjustment: 0,
    level: "STRUGGLED"
  }
};

// Test Case 4: Failed
const testCase4 = {
  input: {
    week1: { sets: [{ reps: 15 }, { reps: 13 }], weight: 145, repRange: { min: 18, max: 20 } },
    exerciseType: "COMPOUND",
    userLevel: "INTERMEDIATE"
  },
  expected: {
    suggestedWeight: 140,
    adjustment: -5,
    level: "FAILED"
  }
};

// Test Case 5: Beginner with isolation exercise
const testCase5 = {
  input: {
    week1: { sets: [{ reps: 20 }, { reps: 20 }], weight: 25, repRange: { min: 18, max: 20 } },
    exerciseType: "ISOLATION",
    userLevel: "BEGINNER"
  },
  expected: {
    suggestedWeight: 28.75, // 25 + (5 * 0.75)
    adjustment: 3.75,
    level: "EXCEEDED"
  }
};
```

### 8.2 Edge Case Tests

```javascript
// Edge Case 1: No previous data
testNoHistoryFallback();

// Edge Case 2: Incomplete sets
testIncompleteSetHandling();

// Edge Case 3: Different rep schemes
testRepSchemeChange();

// Edge Case 4: Recovery mode active
testRecoveryModeAdjustments();

// Edge Case 5: Exercise name variations
testFuzzyExerciseMatching();

// Edge Case 6: User consistently overrides
testOverrideLearning();
```

---

## 9. Performance Considerations

### 9.1 Calculation Timing

- **Target**: < 50ms total calculation time for full workout
- **Optimization**: Pre-calculate suggestions on Week 1 completion
- **Caching**: Store suggestions in localStorage, recalculate only if Week 1 data changes

### 9.2 Storage Limits

- **LocalStorage**: ~5-10MB limit
- **Data retention**: Keep last 12 weeks per exercise
- **Cleanup**: Purge data older than 3 months

### 9.3 Offline Support

- Algorithm runs entirely client-side
- No API calls required for basic functionality
- Sync to cloud (optional) for multi-device support

---

## 10. Future Enhancements

### 10.1 Phase 2 Features

1. **Volume-Based Analysis**: Consider total volume (sets × reps × weight)
2. **Velocity-Based Training**: Use bar speed if available (phone accelerometer)
3. **RPE Integration**: Factor in Rate of Perceived Exertion
4. **Periodization**: Auto-adjust based on mesocycle phase
5. **Deload Detection**: Suggest deload weeks based on accumulated fatigue

### 10.2 Machine Learning Integration

```javascript
// Future: ML model for personalized predictions
function trainPersonalizedModel(userHistoryData) {
  // Features:
  // - Historical performance scores
  // - Exercise types
  // - User demographics
  // - Time of day, sleep, nutrition (optional)

  // Target:
  // - Optimal weight adjustment
  // - Predicted success rate
}
```

### 10.3 Social Features

- Compare progression rates with similar users
- Crowdsourced exercise difficulty ratings
- Community-validated starting weights

---

## 11. Implementation Checklist

- [ ] Core algorithm functions (analyzePerformance, calculateAdjustment)
- [ ] Exercise matching logic with fuzzy matching
- [ ] User profile management (level, recovery mode)
- [ ] Exercise classification (compound vs isolation)
- [ ] Display components (suggestion UI)
- [ ] Override tracking and learning
- [ ] LocalStorage persistence
- [ ] Unit tests (all test cases)
- [ ] Integration tests (full workout flow)
- [ ] Performance benchmarks
- [ ] Documentation for developers
- [ ] User guide for understanding suggestions

---

## 12. Success Metrics

### 12.1 Algorithm Accuracy

- **Target**: 80%+ suggestion acceptance rate
- **Measurement**: Track accepted vs rejected suggestions
- **Feedback loop**: Adjust thresholds based on user behavior

### 12.2 User Outcomes

- **Progressive Overload**: Users should see consistent weight increases over 8-12 weeks
- **Injury Prevention**: Low incidence of reported injuries from over-progression
- **Adherence**: Users complete more workouts when suggestions feel appropriate

### 12.3 System Performance

- **Calculation Speed**: < 50ms for full workout
- **Storage Efficiency**: < 1MB per user for 6 months of data
- **Crash Rate**: < 0.1% due to suggestion algorithm

---

## Appendix A: Exercise Type Reference

### Compound Exercises (10 lb increments)

**Lower Body:**
- Back Squat, Front Squat, Goblet Squat
- Deadlift (Conventional, Sumo, Romanian)
- Leg Press, Hack Squat
- Bulgarian Split Squat, Walking Lunges
- Step-ups, Box Jumps

**Upper Body:**
- Bench Press (Flat, Incline, Decline)
- Overhead Press (Barbell, Dumbbell)
- Bent-Over Row, Pendlay Row
- Pull-ups, Chin-ups
- Dips (Chest, Tricep)
- Push Press, Push Jerk

### Isolation Exercises (5 lb increments)

**Arms:**
- Bicep Curl (Barbell, Dumbbell, Cable)
- Hammer Curl, Preacher Curl
- Tricep Extension (Overhead, Lying)
- Tricep Pushdown, Kickback

**Shoulders:**
- Lateral Raise (Dumbbell, Cable)
- Front Raise
- Rear Delt Fly
- Face Pull

**Legs:**
- Leg Extension, Leg Curl
- Calf Raise (Standing, Seated)
- Hip Thrust, Glute Bridge

**Back:**
- Lat Pulldown (Wide, Close)
- Cable Row (Seated, Standing)
- Pullover

**Chest:**
- Cable Fly, Dumbbell Fly
- Pec Deck

---

## Appendix B: Confidence Scoring Matrix

| Performance Level | All Sets Complete | Some Sets Incomplete | Different Rep Scheme | No History |
|-------------------|-------------------|----------------------|----------------------|------------|
| EXCEEDED          | High              | Medium               | Low                  | N/A        |
| STRONG            | High              | Medium               | Low                  | N/A        |
| MAINTAINED        | Medium            | Low                  | Low                  | N/A        |
| STRUGGLED         | Medium            | Low                  | Low                  | N/A        |
| FAILED            | High              | Medium               | Low                  | N/A        |
| New Exercise      | N/A               | N/A                  | N/A                  | Low        |

---

## Document Version

- **Version**: 1.0.0
- **Last Updated**: 2025-10-28
- **Author**: System Architecture Designer
- **Status**: Draft for Implementation

