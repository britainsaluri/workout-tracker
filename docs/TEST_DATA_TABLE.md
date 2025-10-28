# Weight Suggestion Test Data Reference Table

## Quick Reference: Expected Outputs for Common Scenarios

### Format: `Input → Expected Output`

---

## 1. Critical Bug Test Cases

| Input Weight | Input Reps | Exercise Type | Expected Suggestion | 20% Min | 20% Max | ❌ Bug Would Show |
|--------------|-----------|---------------|---------------------|---------|---------|-------------------|
| **20 lbs** | 10, 10 | Isolation | **22.5 lbs** | 16 lbs | 24 lbs | **200 lbs** |
| 15 lbs | 10, 10 | Isolation | 17.5 lbs | 12 lbs | 18 lbs | 150 lbs |
| 25 lbs | 8, 8 | Isolation | 27.5 lbs | 20 lbs | 30 lbs | 200 lbs |
| 30 lbs | 12, 12 | Compound | 40 lbs | 24 lbs | 36 lbs | 360 lbs |
| 50 lbs | 10, 10 | Compound | 60 lbs | 40 lbs | 60 lbs | 500 lbs |

**Pass Criteria:** Suggestion must NOT match "Bug Would Show" value

---

## 2. Weight Range Matrix (5-500 lbs)

### Isolation Exercises (Expected: +5 lbs or +2.5 lbs)

| Previous Weight | Performance Level | Expected Increment | Expected Suggestion | Acceptable Range |
|-----------------|-------------------|-------------------|---------------------|------------------|
| 5 lbs | EXCEEDED | +5 lbs | 10 lbs | 7.5-10 lbs |
| 10 lbs | EXCEEDED | +5 lbs | 15 lbs | 12.5-15 lbs |
| 20 lbs | EXCEEDED | +5 lbs | 25 lbs | 22.5-25 lbs |
| 20 lbs | STRONG | +2.5 lbs | 22.5 lbs | 22.5 lbs |
| 30 lbs | EXCEEDED | +5 lbs | 35 lbs | 32.5-35 lbs |
| 50 lbs | EXCEEDED | +5 lbs | 55 lbs | 52.5-55 lbs |
| 100 lbs | EXCEEDED | +5 lbs | 105 lbs | 102.5-107.5 lbs |

### Compound Exercises (Expected: +10 lbs or +5 lbs)

| Previous Weight | Performance Level | Expected Increment | Expected Suggestion | Acceptable Range |
|-----------------|-------------------|-------------------|---------------------|------------------|
| 50 lbs | EXCEEDED | +10 lbs | 60 lbs | 55-60 lbs |
| 100 lbs | EXCEEDED | +10 lbs | 110 lbs | 105-115 lbs |
| 135 lbs | EXCEEDED | +10 lbs | 145 lbs | 140-150 lbs |
| 185 lbs | EXCEEDED | +10 lbs | 195 lbs | 190-200 lbs |
| 200 lbs | EXCEEDED | +10 lbs | 210 lbs | 205-215 lbs |
| 225 lbs | EXCEEDED | +10 lbs | 235 lbs | 230-240 lbs |
| 315 lbs | EXCEEDED | +10 lbs | 325 lbs | 320-330 lbs |
| 500 lbs | EXCEEDED | +10 lbs | 510 lbs | 505-515 lbs |

---

## 3. Rep Range Test Matrix

### Strength Ranges (Low Reps)

| Target Range | Weight | Actual Reps | Performance | Expected Inc | Expected Suggestion |
|--------------|--------|-------------|-------------|--------------|---------------------|
| 2-4 reps | 500 lbs | 4, 4, 3 | EXCEEDED | +10 lbs | 510 lbs |
| 4-6 reps | 315 lbs | 6, 6, 5 | EXCEEDED | +10 lbs | 325 lbs |
| 5-8 reps | 225 lbs | 8, 8, 7 | EXCEEDED | +10 lbs | 235 lbs |

### Hypertrophy Ranges (Mid Reps)

| Target Range | Weight | Actual Reps | Performance | Expected Inc | Expected Suggestion |
|--------------|--------|-------------|-------------|--------------|---------------------|
| 8-10 reps | 185 lbs | 10, 10, 9 | EXCEEDED | +10 lbs | 195 lbs |
| 8-12 reps | 135 lbs | 12, 12, 11 | EXCEEDED | +10 lbs | 145 lbs |
| 10-12 reps | 100 lbs | 12, 12, 11 | EXCEEDED | +5 lbs (Iso) | 105 lbs |

### Endurance Ranges (High Reps)

| Target Range | Weight | Actual Reps | Performance | Expected Inc | Expected Suggestion |
|--------------|--------|-------------|-------------|--------------|---------------------|
| 12-15 reps | 60 lbs | 15, 15, 14 | EXCEEDED | +10 lbs | 70 lbs |
| 15-20 reps | 30 lbs | 20, 20, 19 | EXCEEDED | +5 lbs | 35 lbs |
| **18-20 reps** | **20 lbs** | **20, 20** | **EXCEEDED** | **+5 lbs** | **25 lbs** |

---

## 4. Performance Level Test Matrix

### EXCEEDED Performance (100% Score)

| Exercise | Weight | Reps (All at Max) | Target | Expected Inc | Expected Suggestion |
|----------|--------|-------------------|--------|--------------|---------------------|
| Leg Extension (Iso) | 110 lbs | 20, 20 | 2x18-20 | +5 lbs | 115 lbs |
| Goblet Squat (Comp) | 145 lbs | 20, 20 | 2x18-20 | +10 lbs | 155 lbs |
| Squat (Comp) | 225 lbs | 10, 10, 9 | 3x8-10 | +10 lbs | 235 lbs |

### STRONG Performance (75-99% Score)

| Exercise | Weight | Reps | Target | Expected Inc | Expected Suggestion |
|----------|--------|------|--------|--------------|---------------------|
| Split Squat (Comp) | 50 lbs | 21, 20 | 2x18-20 | +10 lbs | 60 lbs |
| Hip Thrust (Comp) | 185 lbs | 19, 18 | 2x18-20 | +5 lbs | 190 lbs |

### MAINTAINED Performance (50-74% Score)

| Exercise | Weight | Reps | Target | Expected Inc | Expected Suggestion |
|----------|--------|------|--------|--------------|---------------------|
| Any Exercise | 100 lbs | Mid-range | Any | 0 lbs | 100 lbs (same) |

### STRUGGLED Performance (25-49% Score)

| Exercise | Weight | Reps | Target | Expected Inc | Expected Suggestion |
|----------|--------|------|--------|--------------|---------------------|
| Leg Curl (Iso) | 95 lbs | 16, 15 | 2x18-20 | 0 lbs | 95 lbs (same) |

### FAILED Performance (<25% Score)

| Exercise | Weight | Reps | Target | Expected Inc | Expected Suggestion |
|----------|--------|------|--------|--------------|---------------------|
| Calf Raise (Iso) | 145 lbs | 12, 10 | 2x18-20 | -2.5 lbs | 142.5 lbs |
| Any Compound | 200 lbs | Far below | Any | -5 lbs | 195 lbs |

---

## 5. Edge Case Test Matrix

### Data Validation Edge Cases

| Test Case | Input | Expected Output | Error Type |
|-----------|-------|-----------------|------------|
| Zero weight | weight: 0 | `null` | Filtered |
| Negative weight | weight: -20 | `Error` | Thrown |
| Zero reps | reps: 0, 0 | `null` | Filtered |
| Negative reps | reps: -5 | `null` | Filtered |
| Empty array | `[]` | `null` | No data |
| Null input | `null` | `null` | No data |

### Set Completion Edge Cases

| Test Case | Sets | Expected Output | Warning/Note |
|-----------|------|-----------------|--------------|
| Single set | 1 complete | Suggestion | "Based on 1 set" |
| Partial complete | 2/3 complete | Suggestion | "Based on 2 of 3 sets" |
| All failed | 0 reps × 3 | `null` | No valid data |
| Inconsistent | 20, 5 reps | Low confidence | High variance |

### Special Weight Cases

| Test Case | Input | Expected Output | Notes |
|-----------|-------|-----------------|-------|
| Decimal weight | 52.5 lbs | 57.5 lbs | Preserve decimals |
| Very light | 2.5 lbs | ~5 lbs | May violate 20% |
| Very heavy | 1000 lbs | ~1010 lbs | Standard increment |

---

## 6. 20% Constraint Validation Table

### Constraint Pass/Fail Matrix

| Weight | Standard Inc | Suggested | % Change | Min (80%) | Max (120%) | Passes Constraint? |
|--------|-------------|-----------|----------|-----------|------------|-------------------|
| 5 lbs | +5 | 10 lbs | +100% | 4 lbs | 6 lbs | ❌ NO |
| 10 lbs | +5 | 15 lbs | +50% | 8 lbs | 12 lbs | ❌ NO |
| 20 lbs | +5 | 25 lbs | +25% | 16 lbs | 24 lbs | ❌ NO |
| 20 lbs | +2.5 | 22.5 lbs | +12.5% | 16 lbs | 24 lbs | ✅ YES |
| 50 lbs | +10 | 60 lbs | +20% | 40 lbs | 60 lbs | ✅ YES |
| 100 lbs | +10 | 110 lbs | +10% | 80 lbs | 120 lbs | ✅ YES |
| 200 lbs | +10 | 210 lbs | +5% | 160 lbs | 240 lbs | ✅ YES |
| 500 lbs | +10 | 510 lbs | +2% | 400 lbs | 600 lbs | ✅ YES |

**Note:** Weights < 25 lbs may require dynamic increment scaling to respect 20% constraint.

---

## 7. Exercise Classification Reference

### Compound Keywords (Use +10 lbs increment)
- squat
- deadlift
- bench
- press (overhead, shoulder, etc.)
- row
- pull (pull-up, pulldown)
- chin (chin-up)
- dip
- lunge
- leg press
- thrust (hip thrust)
- rdl

### Isolation (Default, use +5 lbs increment)
- curl
- extension
- raise
- fly
- shrug
- cable (most exercises)
- machine (most exercises)
- calf

---

## 8. Quick Validation Formulas

### Average Weight Calculation
```javascript
avgWeight = sum(all weights) / count(sets)
// Example: (20 + 20) / 2 = 20 lbs
```

### Performance Score
```javascript
if (reps >= targetMax) → 100% (EXCEEDED)
if (reps >= targetMin + 75% of range) → 75-99% (STRONG)
if (reps >= targetMin + 50% of range) → 50-74% (MAINTAINED)
if (reps >= targetMin) → 25-49% (STRUGGLED)
if (reps < targetMin) → <25% (FAILED)
```

### Weight Adjustment
```javascript
COMPOUND:
  EXCEEDED → +10 lbs
  STRONG → +5 lbs
  MAINTAINED → 0 lbs
  STRUGGLED → 0 lbs
  FAILED → -5 lbs

ISOLATION:
  EXCEEDED → +5 lbs
  STRONG → +2.5 lbs
  MAINTAINED → 0 lbs
  STRUGGLED → 0 lbs
  FAILED → -2.5 lbs
```

### 20% Constraint
```javascript
minAllowed = previousWeight × 0.80
maxAllowed = previousWeight × 1.20
constrainedWeight = clamp(suggestedWeight, minAllowed, maxAllowed)
```

### Rounding to Nearest 0.5
```javascript
rounded = Math.round(weight × 2) / 2
// Examples:
// 22.3 → 22.5
// 22.7 → 23.0
// 23.25 → 23.5
```

---

## 9. Manual Testing Quick Checklist

### Critical Path Tests (Must All Pass)

- [ ] 20 lbs × 10 reps → 22.5 or 25 lbs (NOT 200 lbs) ✅
- [ ] String inputs converted to numbers (typeof === 'number') ✅
- [ ] No multiplication of weight × reps ✅
- [ ] All suggestions within ±20% of previous weight ✅
- [ ] Compound exercises use +10 lbs increment ✅
- [ ] Isolation exercises use +5 lbs increment ✅
- [ ] Zero weights filtered out ✅
- [ ] Negative weights throw error ✅
- [ ] Failed sets (0 reps) filtered out ✅
- [ ] Single set shows warning ✅

### Performance Tests

- [ ] Single calculation completes in <10ms ✅
- [ ] 39 exercises complete in <100ms ✅
- [ ] No console errors during execution ✅

---

## 10. Common Test Scenarios (Copy-Paste Ready)

### Test 1: Original Bug
```javascript
Input: { weight: 20, reps: 10 }, { weight: 20, reps: 10 }
Target: '3x8-10'
Exercise: 'Leg Extension'
Expected: 22.5 or 25 lbs
Must NOT be: 200 lbs
```

### Test 2: Light Weight
```javascript
Input: { weight: 5, reps: 12 }, { weight: 5, reps: 12 }
Target: '3x8-12'
Exercise: 'Curl'
Expected: 7.5-10 lbs
Constraint: 4-6 lbs (may violate)
```

### Test 3: Heavy Weight
```javascript
Input: { weight: 315, reps: 6 }, { weight: 315, reps: 6 }
Target: '3x4-6'
Exercise: 'Deadlift'
Expected: 325 lbs
Constraint: 252-378 lbs (pass)
```

### Test 4: Edge Case - Single Set
```javascript
Input: { weight: 100, reps: 10 }
Target: '2x8-10'
Exercise: 'Bench Press'
Expected: 110 lbs with note "Based on 1 set"
```

### Test 5: Edge Case - Inconsistent
```javascript
Input: { weight: 100, reps: 20 }, { weight: 100, reps: 5 }
Target: '2x8-10'
Exercise: 'Exercise'
Expected: Low confidence, warning about variance
```

---

## Usage Instructions

1. **For Automated Tests:** Copy test data from tables into test scripts
2. **For Manual Tests:** Use scenarios as UI test cases
3. **For Validation:** Compare actual results against "Expected" columns
4. **For Debugging:** If test fails, check constraint and acceptable range columns

---

**Document Version:** 1.0.0
**Last Updated:** 2025-10-28
**Companion Document:** COMPREHENSIVE_TEST_PLAN.md
