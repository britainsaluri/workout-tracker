# Progressive Overload Quick Reference Guide

## 20% Constraint Definition

**Rule:** Week 2 weight must be within ±20% of Week 1 weight

```
Valid Range: [Week1 × 0.80, Week1 × 1.20]
```

### Quick Examples
- 20 lbs → 16-24 lbs range
- 50 lbs → 40-60 lbs range
- 100 lbs → 80-120 lbs range
- 145 lbs → 116-174 lbs range
- 225 lbs → 180-270 lbs range

---

## Standard Weight Progression

### Compound Exercises (Squat, Deadlift, Bench, Press, Row)

| Performance | Rep Achievement | Increment | % Change |
|-------------|----------------|-----------|----------|
| EXCEEDED | All sets hit max | +10 lbs | 3-7% |
| STRONG | 75%+ in upper range | +5 lbs | 2-5% |
| MAINTAINED | 50-75% in range | 0 lbs | 0% |
| STRUGGLED | 25-50% in range | 0 lbs | 0% |
| FAILED | <25% in range | -5 lbs | -3 to -7% |

### Isolation Exercises (Curl, Extension, Raise, Fly)

| Performance | Rep Achievement | Increment | % Change |
|-------------|----------------|-----------|----------|
| EXCEEDED | All sets hit max | +5 lbs | 5-10% |
| STRONG | 75%+ in upper range | +2.5 lbs | 2-5% |
| MAINTAINED | 50-75% in range | 0 lbs | 0% |
| STRUGGLED | 25-50% in range | 0 lbs | 0% |
| FAILED | <25% in range | -2.5 lbs | -2 to -5% |

---

## Current Algorithm Issues

### ❌ CRITICAL: Missing 20% Safety Cap

**Problem:**
```javascript
// Light weight example
Weight: 10 lbs (isolation)
Performance: EXCEEDED
Current increment: +5 lbs (fixed)
Result: 15 lbs = 50% increase ❌ VIOLATES 20% LIMIT
```

**Solution:**
```javascript
Weight: 10 lbs
Max allowed: 10 × 1.20 = 12 lbs
Capped increment: +2 lbs (20%)
Result: 12 lbs ✓
```

---

## Recommended Code Fix

```javascript
calculateAdjustment(performance, exerciseType, currentWeight) {
  // Get base increment
  const base = {
    COMPOUND: {EXCEEDED: 10, STRONG: 5, MAINTAINED: 0, STRUGGLED: 0, FAILED: -5},
    ISOLATION: {EXCEEDED: 5, STRONG: 2.5, MAINTAINED: 0, STRUGGLED: 0, FAILED: -2.5}
  };

  let amount = base[exerciseType][performance.level];

  // ⚠️ ADD THIS: 20% safety cap
  const maxChange = currentWeight * 0.20;

  if (amount > maxChange) {
    amount = Math.round(maxChange * 2) / 2; // Round to 0.5
    // Add capping flag
  } else if (amount < -maxChange) {
    amount = -Math.round(maxChange * 2) / 2;
    // Add capping flag
  }

  // Light weight protection
  if (currentWeight < 15 && Math.abs(amount) > 2.5) {
    amount = amount >= 0 ? 2.5 : -2.5;
  }

  return { amount, /* ... */ };
}
```

---

## Test Cases to Add

```javascript
// Edge case: 5 lbs
Input: 5 lbs, EXCEEDED (isolation)
Base: +5 lbs
Expected: +1 lb (20% capped)
Output: 6 lbs

// Edge case: 10 lbs
Input: 10 lbs, EXCEEDED (isolation)
Base: +5 lbs
Expected: +2 lbs (20% capped)
Output: 12 lbs

// Normal case: 145 lbs
Input: 145 lbs, EXCEEDED (compound)
Base: +10 lbs
Expected: +10 lbs (no cap needed)
Output: 155 lbs (6.9% increase)
```

---

## Implementation Priority

### Week 1 (CRITICAL)
1. Add 20% safety cap to `calculateAdjustment`
2. Add light weight protection (<15 lbs)
3. Add `capped` flag to output
4. Write test cases

### Week 2-3
5. Heavy weight scaling (>300 lbs)
6. Safety metadata in output
7. Update documentation

### Future
8. Percentage-based option
9. Deload week detection
10. Multi-week trend analysis

---

## Key Formulas

```javascript
// 20% boundaries
maxIncrease = currentWeight × 0.20
maxDecrease = currentWeight × 0.20

// Percentage change
percentChange = ((newWeight - oldWeight) / oldWeight) × 100

// Rounding to nearest 0.5
rounded = Math.round(value × 2) / 2

// Capping logic
if (increment > maxIncrease) {
  increment = maxIncrease
  capped = true
}
```

---

## Evidence-Based Guidelines (ACSM/NSCA)

- **Novice:** 2-10% per week
- **Intermediate:** 1-5% per week
- **Advanced:** 0.5-2% per week
- **Maximum safe increase:** 20% per week
- **Minimum practical increment:** 2.5 lbs (smallest plate)

---

**Full Report:** `/Users/britainsaluri/workout-tracker/docs/progressive-overload-research-report.md`
