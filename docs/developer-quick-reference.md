# Weight Suggestion System - Developer Quick Reference

## 🚀 Quick Start

### The Golden Rule
**ALWAYS validate data at system boundaries. NEVER trust input or storage.**

---

## 📦 Components at a Glance

| Component | Purpose | Key Method |
|-----------|---------|------------|
| **DataValidator** | Input validation | `validateSet(data)` |
| **ConstraintChecker** | Enforce limits | `enforce(suggestion, week1)` |
| **SuggestionEngine** | Calculate weight | `calculateSuggestedWeight()` |
| **ResultValidator** | Confidence scoring | `validate(suggestion, week1)` |

---

## 🛡️ Validation Checklist

### At Input (HTML → JavaScript)
```javascript
✅ const weight = parseFloat(inputValue) || 0;
✅ const reps = parseInt(inputValue, 10) || 0;
✅ const bounded = Math.max(0, Math.min(1000, weight));
❌ const weight = inputValue; // String!
```

### Before Storage (JavaScript → localStorage)
```javascript
✅ const validated = DataValidator.validateSet(data);
✅ if (validated.isValid) { localStorage.setItem(...) }
❌ localStorage.setItem(key, JSON.stringify(rawInput));
```

### After Retrieval (localStorage → JavaScript)
```javascript
✅ const data = JSON.parse(localStorage.getItem(key));
✅ if (data.version !== '2.0.0') { data = migrate(data); }
✅ const validated = DataValidator.validateSet(data);
❌ const data = JSON.parse(localStorage.getItem(key));
   // Use directly without validation
```

### Before Calculation (JavaScript → Engine)
```javascript
✅ const validated = DataValidator.validateExerciseResults(week1Results);
✅ const suggestion = engine.calculate(...validated.sanitized);
❌ const suggestion = engine.calculate(...week1Results);
   // Use unvalidated data
```

---

## 🔒 Constraint Rules

| Constraint | Value | When Applied |
|------------|-------|--------------|
| Max Increase | 20% | Always |
| Min Increment | 2.5 lbs (isolation), 5 lbs (compound) | Rounding |
| Safety Min | 0.5x previous | Fallback check |
| Safety Max | 1.3x previous | Fallback check |
| Absolute Min | 2.5 lbs | Always |
| Absolute Max | 1000 lbs | Always |

### Example: Enforce 20% Cap
```javascript
const prevWeight = 100;
const suggested = 150;  // +50%
const maxAllowed = prevWeight * 1.20; // 120 lbs
const capped = Math.min(suggested, maxAllowed); // 120 lbs ✅
```

---

## 📊 Performance Levels

| Level | Score | Target Range | Adjustment (Compound) | Adjustment (Isolation) |
|-------|-------|--------------|------------------------|-------------------------|
| **EXCEEDED** | 100% | Hit max reps all sets | +10 lbs | +5 lbs |
| **STRONG** | 75%+ | Near top of range | +5 lbs | +2.5 lbs |
| **MAINTAINED** | 50-75% | Mid-range | 0 lbs | 0 lbs |
| **STRUGGLED** | 25-50% | Low range | 0 lbs | 0 lbs |
| **FAILED** | <25% | Below range | -5 lbs | -2.5 lbs |

---

## 🎯 Confidence Scoring

| Confidence | Criteria |
|------------|----------|
| **HIGH** | ≥2 sets, consistent weight, all completed, increase <20% |
| **MEDIUM** | 1-2 sets, some variance, increase 10-20% |
| **LOW** | 1 set, high variance, or constrained suggestion |

### Calculate Confidence
```javascript
let score = 100;
if (sets.length < 2) score -= 30;
if (!consistentWeight) score -= 20;
if (!allCompleted) score -= 20;
if (increaseOutOfRange) score -= 30;

if (score >= 80) return 'high';
if (score >= 50) return 'medium';
return 'low';
```

---

## 🐛 Common Bugs & Fixes

### Bug 1: Type Coercion (200 lbs instead of 22.5 lbs)
```javascript
❌ const calc = stringWeight * stringReps; // "20" * "10" = 200
✅ const weight = parseFloat(stringWeight) || 0; // 20
✅ const avgWeight = weights.reduce((sum, w) => sum + w, 0) / weights.length;
```

### Bug 2: Excessive Increase (100 → 150 lbs)
```javascript
❌ return { suggestedWeight: 150 }; // No cap
✅ const maxAllowed = prevWeight * 1.20;
✅ const capped = Math.min(150, maxAllowed); // 120
```

### Bug 3: Invalid Increments (22.7 lbs)
```javascript
❌ return { suggestedWeight: 22.7 };
✅ const increment = exerciseType === 'COMPOUND' ? 5 : 2.5;
✅ const rounded = Math.round(22.7 / increment) * increment; // 22.5
```

### Bug 4: NaN in Calculations
```javascript
❌ const avg = values.reduce((sum, v) => sum + v, 0) / values.length;
   // If values has strings, sum will be NaN
✅ const validated = values.map(v => parseFloat(v) || 0);
✅ const avg = validated.reduce((sum, v) => sum + v, 0) / validated.length;
```

---

## 📝 Code Templates

### Template 1: Sanitize Input
```javascript
function sanitizeInput(value, type = 'weight') {
  const num = type === 'weight'
    ? parseFloat(value)
    : parseInt(value, 10);

  if (isNaN(num) || num === null || num === undefined) {
    return 0;
  }

  if (type === 'weight') {
    return Math.max(0, Math.min(1000, num));
  } else if (type === 'reps') {
    return Math.max(0, Math.min(100, num));
  }

  return num;
}
```

### Template 2: Validate and Store
```javascript
function storeWorkoutSet(week, day, exerciseId, setNum, data) {
  // 1. Sanitize
  const weight = sanitizeInput(data.weight, 'weight');
  const reps = sanitizeInput(data.reps, 'reps');

  // 2. Validate
  const validated = DataValidator.validateSet({
    weight,
    reps,
    completed: data.completed !== false
  });

  if (!validated.isValid) {
    console.error('Validation failed:', validated.errors);
    return { success: false, errors: validated.errors };
  }

  // 3. Add metadata
  const setData = {
    ...validated.sanitized,
    version: '2.0.0',
    timestamp: new Date().toISOString()
  };

  // 4. Store
  const key = `sheet1_w${week}_d${day}_${exerciseId}_${setNum}`;
  localStorage.setItem(key, JSON.stringify(setData));

  return { success: true, data: setData };
}
```

### Template 3: Calculate Suggestion
```javascript
function getWeightSuggestion(exerciseId, day, week2Target) {
  // 1. Retrieve Week 1 data
  const week1Results = getWeek1Results(exerciseId, day);

  if (!week1Results || week1Results.length === 0) {
    return {
      error: 'No Week 1 data available',
      suggestion: null
    };
  }

  // 2. Validate
  const validated = DataValidator.validateExerciseResults(week1Results);
  if (!validated.isValid) {
    return {
      error: 'Invalid Week 1 data',
      details: validated.errors,
      suggestion: null
    };
  }

  // 3. Calculate
  const suggestion = suggestionEngine.calculateSuggestedWeight(
    exerciseId,
    validated.sanitized,
    week2Target
  );

  if (!suggestion) {
    return {
      error: 'Calculation failed',
      suggestion: null
    };
  }

  // 4. Apply constraints
  const constrained = ConstraintChecker.enforce(
    suggestion,
    validated.sanitized
  );

  // 5. Validate result
  const final = ResultValidator.validate(
    constrained,
    validated.sanitized
  );

  return {
    success: true,
    suggestion: final
  };
}
```

---

## 🧪 Testing Checklist

### Unit Tests
- [ ] DataValidator.validateSet() with valid data
- [ ] DataValidator.validateSet() with invalid data (strings, negatives, NaN)
- [ ] ConstraintChecker.enforce() with normal suggestions
- [ ] ConstraintChecker.enforce() with excessive increase (>20%)
- [ ] SuggestionEngine.calculateSuggestedWeight() with 2 sets
- [ ] SuggestionEngine.calculateSuggestedWeight() with 1 set
- [ ] ResultValidator.validate() confidence calculation

### Integration Tests
- [ ] End-to-end: Input → Storage → Calculation → Display
- [ ] Data migration: V1 → V2 conversion
- [ ] Error recovery: Corrupted data handling
- [ ] Constraint enforcement: 20% cap in real scenario

### Manual Tests
- [ ] Enter "20" and "10" → Should store as numbers, suggest ~22.5 lbs
- [ ] Enter 100 lbs, suggest 150 → Should cap at 120 lbs
- [ ] Corrupt localStorage data → Should recover or show error
- [ ] Complete 1 set only → Should show low confidence warning

---

## 🔧 Debugging Tips

### Enable Verbose Logging
```javascript
import { SUGGESTION_CONFIG } from './config/suggestionConfig.js';
SUGGESTION_CONFIG.LOGGING.VERBOSE = true;
```

### Check Data Types
```javascript
console.log('Type:', typeof value, 'Value:', value);
// Should show: Type: number Value: 20
// NOT: Type: string Value: "20"
```

### Validate localStorage Format
```javascript
const data = JSON.parse(localStorage.getItem('sheet1_w1_d1_A1_1'));
console.log('Weight type:', typeof data.weight); // Should be 'number'
console.log('Reps type:', typeof data.reps);     // Should be 'number'
console.log('Version:', data.version);            // Should be '2.0.0'
```

### Test Constraint Enforcement
```javascript
const prevWeight = 100;
const suggested = 150;
const maxAllowed = prevWeight * 1.20;
console.log('Max allowed:', maxAllowed); // Should be 120
console.log('Capped:', Math.min(suggested, maxAllowed)); // Should be 120
```

---

## 📚 API Reference

### DataValidator API
```javascript
// Validate single set
const result = DataValidator.validateSet({
  weight: 20,
  reps: 10,
  completed: true
});
// Returns: { isValid: boolean, errors: string[], sanitized: object }

// Validate multiple sets
const results = DataValidator.validateExerciseResults([
  { weight: 20, reps: 10, completed: true },
  { weight: 20, reps: 10, completed: true }
]);
// Returns: { isValid: boolean, errors: string[], sanitized: object[] }
```

### ConstraintChecker API
```javascript
const constrained = ConstraintChecker.enforce(
  { suggestedWeight: 150, ...otherProps },
  [{ weight: 100, reps: 10 }]
);
// Returns: {
//   ...suggestion,
//   constrained: boolean,
//   constraintReason?: string,
//   originalSuggestion?: number
// }
```

### SuggestionEngine API
```javascript
const suggestion = suggestionEngine.calculateSuggestedWeight(
  'A1',                    // exerciseId
  week1Results,            // Array of sets
  '3x8-12'                 // week2Target
);
// Returns: {
//   suggestedWeight: number,
//   increaseAmount: number,
//   increasePercentage: number,
//   reason: string,
//   confidence: 'high' | 'medium' | 'low',
//   warnings: string[]
// }
```

---

## 🎯 Performance Targets

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Calculation Time | < 10ms | `performance.now()` |
| Validation Time | < 2ms | `performance.now()` |
| UI Blocking | 0ms | Use async/Promise |
| Error Rate | < 1% | Monitor logs |
| Constraint Compliance | 100% | Test enforcement |

### Measure Performance
```javascript
const start = performance.now();
const suggestion = getWeightSuggestion('A1', 1, '3x8-12');
const end = performance.now();
console.log(`Calculation took ${end - start}ms`); // Should be < 10ms
```

---

## 🚨 Error Handling

### Error Response Format
```javascript
{
  success: boolean,
  data: object | null,
  error: {
    code: string,           // 'VALIDATION_ERROR', 'DATA_ERROR'
    message: string,        // Human-readable
    details: object,        // Technical details
    recoverable: boolean    // Can user fix?
  },
  fallback: object | null   // Safe fallback if available
}
```

### Example Error Handling
```javascript
const result = getWeightSuggestion('A1', 1, '3x8-12');

if (!result.success) {
  console.error('Error:', result.error.message);

  if (result.error.recoverable) {
    // Show user how to fix
    showUserMessage(result.error.message);
  } else if (result.fallback) {
    // Use fallback
    displaySuggestion(result.fallback);
  } else {
    // Critical error
    showError('Unable to calculate suggestion. Please try again.');
  }
  return;
}

displaySuggestion(result.suggestion);
```

---

## 📦 Configuration

### Location
`/src/config/suggestionConfig.js`

### Key Settings
```javascript
export const SUGGESTION_CONFIG = {
  VERSION: '2.0.0',

  VALIDATION: {
    WEIGHT: { MIN: 0, MAX: 1000, PRECISION: 0.5 },
    REPS: { MIN: 0, MAX: 100, INTEGER_ONLY: true }
  },

  CONSTRAINTS: {
    MAX_INCREASE_PERCENT: 0.20, // 20%
    MIN_MULTIPLIER: 0.5,
    MAX_MULTIPLIER: 1.3,
    ABSOLUTE_MIN: 2.5,
    ABSOLUTE_MAX: 1000
  },

  INCREMENTS: {
    COMPOUND: { EXCEEDED: 10, STRONG: 5, MAINTAINED: 0, STRUGGLED: 0, FAILED: -5 },
    ISOLATION: { EXCEEDED: 5, STRONG: 2.5, MAINTAINED: 0, STRUGGLED: 0, FAILED: -2.5 }
  },

  LOGGING: {
    ENABLED: true,
    VERBOSE: false  // Set to true for debugging
  }
};
```

---

## 🔗 Related Documents

- **Full Architecture**: `/docs/weight-suggestion-architecture.md`
- **System Diagrams**: `/docs/system-diagrams.md`
- **Architecture Summary**: `/docs/architecture-summary.md`

---

## 💡 Pro Tips

1. **Always validate at boundaries** - Input, storage, retrieval, calculation
2. **Use explicit type conversion** - `parseFloat()`, `parseInt()`, never rely on coercion
3. **Enforce constraints early** - Don't let invalid data propagate
4. **Fail gracefully** - Always return valid suggestions or clear errors
5. **Log everything** - Validation failures, constraints applied, errors
6. **Test with edge cases** - NaN, null, undefined, negative, extreme values
7. **Version your data** - Makes migrations easier later
8. **Monitor performance** - Keep calculations under 10ms

---

**Last Updated**: 2025-10-28
**Version**: 2.0.0
**Maintained by**: Architecture Team
