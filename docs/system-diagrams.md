# Weight Suggestion System - Visual Diagrams

## Component Interaction Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           COMPONENT ARCHITECTURE                         │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────┐
│   User Input    │  HTML forms, workout tracking UI
│   (HTML/JS)     │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                       INPUT SANITIZATION LAYER                           │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ • parseFloat() / parseInt() conversion                            │  │
│  │ • Bounds checking (0 ≤ weight ≤ 1000, 0 ≤ reps ≤ 100)           │  │
│  │ • NaN/null/undefined → 0 default handling                        │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└────────┬────────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        DATA VALIDATOR                                    │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ DataValidator.validateSet(setData)                                │  │
│  │  → Schema validation                                              │  │
│  │  → Type checking (number, boolean)                               │  │
│  │  → Business rules (completed sets, positive values)              │  │
│  │  → Returns: { isValid, errors, sanitized }                       │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└────────┬────────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        STORAGE LAYER                                     │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ localStorage / IndexedDB                                          │  │
│  │ Key: sheet1_w{week}_d{day}_{exerciseId}_{setNum}                │  │
│  │ Value: {                                                          │  │
│  │   weight: number,                                                 │  │
│  │   reps: number,                                                   │  │
│  │   completed: boolean,                                             │  │
│  │   version: "2.0.0",                                              │  │
│  │   timestamp: ISO8601                                              │  │
│  │ }                                                                 │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└────────┬────────────────────────────────────────────────────────────────┘
         │
         │ [RETRIEVAL PATH FOR WEEK 2 SUGGESTIONS]
         │
         ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      DATA RETRIEVAL LAYER                                │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ getWeek1Results(exerciseId, day)                                  │  │
│  │  → Parse storage keys                                             │  │
│  │  → Load data from localStorage                                    │  │
│  │  → Check version, apply migration if needed                       │  │
│  │  → Validate retrieved data                                        │  │
│  │  → Returns: Array<{set, weight, reps}>                           │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└────────┬────────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      SUGGESTION ENGINE                                   │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ SuggestionEngine.calculateSuggestedWeight()                       │  │
│  │                                                                    │  │
│  │ Step 1: Pre-calculation validation                               │  │
│  │   └─> DataValidator.validateExerciseResults()                    │  │
│  │                                                                    │  │
│  │ Step 2: Calculate averages                                        │  │
│  │   └─> avgWeight = Σ weights / count                              │  │
│  │   └─> avgReps = Σ reps / count                                   │  │
│  │                                                                    │  │
│  │ Step 3: Analyze performance                                       │  │
│  │   └─> analyzePerformance(results, targetRange)                   │  │
│  │   └─> Returns: {level, score, summary}                           │  │
│  │                                                                    │  │
│  │ Step 4: Calculate adjustment                                      │  │
│  │   └─> calculateAdjustment(performance, exerciseType)             │  │
│  │   └─> Lookup table: COMPOUND/ISOLATION × PERFORMANCE_LEVEL       │  │
│  │                                                                    │  │
│  │ Step 5: Apply adjustment                                          │  │
│  │   └─> suggestedWeight = avgWeight + adjustment                   │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└────────┬────────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                     CONSTRAINT CHECKER                                   │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ ConstraintChecker.enforce(suggestion, week1Results)               │  │
│  │                                                                    │  │
│  │ Check 1: 20% Maximum Increase Cap                                │  │
│  │   └─> maxAllowed = avgWeight × 1.20                              │  │
│  │   └─> if (suggested > maxAllowed) → cap at maxAllowed           │  │
│  │                                                                    │  │
│  │ Check 2: Minimum Increment Rounding                               │  │
│  │   └─> Round to nearest 2.5 lbs (isolation)                       │  │
│  │   └─> Round to nearest 5 lbs (compound)                          │  │
│  │                                                                    │  │
│  │ Check 3: Safety Bounds                                            │  │
│  │   └─> MIN: avgWeight × 0.5                                        │  │
│  │   └─> MAX: avgWeight × 1.3                                        │  │
│  │                                                                    │  │
│  │ Check 4: Absolute Bounds                                          │  │
│  │   └─> MIN: 2.5 lbs (empty bar)                                   │  │
│  │   └─> MAX: 1000 lbs                                               │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└────────┬────────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                     RESULT VALIDATOR                                     │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ ResultValidator.validate(suggestion, week1Results)                │  │
│  │                                                                    │  │
│  │ Assessment 1: Data Quality                                        │  │
│  │   └─> Sufficient sets (≥ 2)                                      │  │
│  │   └─> Weight consistency                                          │  │
│  │   └─> All sets completed                                          │  │
│  │                                                                    │  │
│  │ Assessment 2: Reasonableness                                      │  │
│  │   └─> Increase within expected range (-10% to +20%)              │  │
│  │   └─> Non-zero weight                                             │  │
│  │   └─> Valid increment (multiple of 2.5 lbs)                      │  │
│  │                                                                    │  │
│  │ Calculate Confidence: HIGH / MEDIUM / LOW                         │  │
│  │ Generate Warnings: Array<string>                                  │  │
│  │                                                                    │  │
│  │ Returns: {                                                         │  │
│  │   ...suggestion,                                                  │  │
│  │   confidence: 'high',                                             │  │
│  │   warnings: [],                                                   │  │
│  │   validated: true                                                 │  │
│  │ }                                                                 │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└────────┬────────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                     PRESENTATION LAYER (UI)                              │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ Display Suggestion Card:                                          │  │
│  │                                                                    │  │
│  │ ┌────────────────────────────────────────────────────────────┐  │  │
│  │ │ 🎯 Suggested Weight: 22.5 lbs [Confidence: High]          │  │  │
│  │ │                                                             │  │  │
│  │ │ Reason: Crushed it! Time to level up.                      │  │  │
│  │ │ Increase: +2.5 lbs (+12.5%)                                │  │  │
│  │ │                                                             │  │  │
│  │ │ [✓ Use Suggestion] [✎ Modify] [⚖ Keep Same]              │  │  │
│  │ │                                                             │  │  │
│  │ │ ⚠️  Warnings: Based on 1 set only                         │  │  │
│  │ └────────────────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Data Flow Sequence Diagram

```
User                 Input         Data          Storage      Retrieval     Suggestion    Constraint    Result      UI
                   Sanitizer    Validator                     Layer          Engine        Checker     Validator
 │                    │             │              │             │              │             │            │          │
 │ Enter 20 lbs      │             │              │             │              │             │            │          │
 │ 10 reps          │             │              │             │              │             │            │          │
 ├──────────────────>│             │              │             │              │             │            │          │
 │                    │             │              │             │              │             │            │          │
 │                    │ parseFloat  │              │             │              │             │            │          │
 │                    │ parseInt    │              │             │              │             │            │          │
 │                    │ bounds      │              │             │              │             │            │          │
 │                    ├────────────>│              │             │              │             │            │          │
 │                    │             │              │             │              │             │            │          │
 │                    │             │ validateSet  │             │              │             │            │          │
 │                    │             │ typeCheck    │             │              │             │            │          │
 │                    │             │ ✓ VALID      │             │              │             │            │          │
 │                    │             ├─────────────>│             │              │             │            │          │
 │                    │             │              │             │              │             │            │          │
 │                    │             │              │ setItem()   │              │             │            │          │
 │                    │             │              │ {w:20,r:10} │              │             │            │          │
 │                    │             │              │<────────────┤              │             │            │          │
 │                    │             │              │             │              │             │            │          │
 │ [Week 2: Load suggestions]      │              │             │              │             │            │          │
 ├──────────────────────────────────────────────────────────────>│             │             │            │          │
 │                    │             │              │             │              │             │            │          │
 │                    │             │              │             │ getWeek1     │             │            │          │
 │                    │             │              │             │ Results()    │             │            │          │
 │                    │             │              │<────────────┤              │             │            │          │
 │                    │             │              │             │              │             │            │          │
 │                    │             │              │ getItem()   │              │             │            │          │
 │                    │             │              │ {w:20,r:10} │              │             │            │          │
 │                    │             │              ├────────────>│              │             │            │          │
 │                    │             │              │             │              │             │            │          │
 │                    │             │              │             │ validate     │             │            │          │
 │                    │             │              │             │ migrate?     │             │            │          │
 │                    │             │              │             │ ✓ OK         │             │            │          │
 │                    │             │              │             ├─────────────>│             │            │          │
 │                    │             │              │             │              │             │            │          │
 │                    │             │              │             │              │ calculate   │            │          │
 │                    │             │              │             │              │ avgWeight   │            │          │
 │                    │             │              │             │              │ performance │            │          │
 │                    │             │              │             │              │ adjustment  │            │          │
 │                    │             │              │             │              │ suggest:22.5│            │          │
 │                    │             │              │             │              ├────────────>│            │          │
 │                    │             │              │             │              │             │            │          │
 │                    │             │              │             │              │             │ enforce    │          │
 │                    │             │              │             │              │             │ 20% cap    │          │
 │                    │             │              │             │              │             │ round      │          │
 │                    │             │              │             │              │             │ ✓ 22.5 OK  │          │
 │                    │             │              │             │              │             ├───────────>│          │
 │                    │             │              │             │              │             │            │          │
 │                    │             │              │             │              │             │            │ validate │
 │                    │             │              │             │              │             │            │ quality  │
 │                    │             │              │             │              │             │            │ confidence│
 │                    │             │              │             │              │             │            │ warnings │
 │                    │             │              │             │              │             │            ├─────────>│
 │                    │             │              │             │              │             │            │          │
 │                    │             │              │             │              │             │            │ Display  │
 │<───────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
 │                    │             │              │             │              │             │            │          │
 │ 🎯 22.5 lbs                      │              │             │              │             │            │          │
 │ [High Confidence]                │              │             │              │             │            │          │
 │                    │             │              │             │              │             │            │          │
```

---

## Progressive Overload Decision Tree

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    PROGRESSIVE OVERLOAD DECISION TREE                    │
└─────────────────────────────────────────────────────────────────────────┘

                          Week 1 Results
                                │
                                ▼
                    ┌───────────────────────┐
                    │ Validate Data Quality │
                    └───────────┬───────────┘
                                │
                ┌───────────────┴───────────────┐
                ▼                               ▼
        ┌───────────────┐              ┌───────────────┐
        │ Invalid Data  │              │ Valid Data    │
        │ (corrupt/     │              │ (≥1 set)      │
        │  missing)     │              └───────┬───────┘
        └───────┬───────┘                      │
                │                              │
                ▼                              ▼
        ┌───────────────┐      ┌──────────────────────────┐
        │ Return null   │      │ Parse Target Range       │
        │ with error    │      │ (e.g., "3x8-12" → 8-12) │
        └───────────────┘      └──────────┬───────────────┘
                                          │
                                          ▼
                              ┌───────────────────────┐
                              │ Calculate Averages    │
                              │ avgWeight = Σw/n      │
                              │ avgReps = Σr/n        │
                              └───────────┬───────────┘
                                          │
                                          ▼
                              ┌───────────────────────┐
                              │ Analyze Performance   │
                              │ Compare avgReps to    │
                              │ target range          │
                              └───────────┬───────────┘
                                          │
                ┌─────────────────────────┼─────────────────────────┐
                ▼                         ▼                         ▼
        ┌───────────────┐      ┌──────────────────┐      ┌───────────────┐
        │ EXCEEDED      │      │ STRONG           │      │ MAINTAINED    │
        │ avgReps ≥ max │      │ avgReps 75%+     │      │ avgReps 50-75%│
        └───────┬───────┘      └────────┬─────────┘      └───────┬───────┘
                │                       │                        │
                ▼                       ▼                        ▼
        ┌───────────────┐      ┌──────────────────┐      ┌───────────────┐
        │ Classify:     │      │ Classify:        │      │ Classify:     │
        │ COMPOUND or   │      │ COMPOUND or      │      │ COMPOUND or   │
        │ ISOLATION     │      │ ISOLATION        │      │ ISOLATION     │
        └───────┬───────┘      └────────┬─────────┘      └───────┬───────┘
                │                       │                        │
                ▼                       ▼                        ▼
        ┌───────────────┐      ┌──────────────────┐      ┌───────────────┐
        │ COMPOUND:     │      │ COMPOUND: +5 lbs │      │ COMPOUND: 0   │
        │ +10 lbs       │      │ ISOLATION: +2.5  │      │ ISOLATION: 0  │
        │ ISOLATION:    │      │                  │      │               │
        │ +5 lbs        │      │                  │      │               │
        └───────┬───────┘      └────────┬─────────┘      └───────┬───────┘
                │                       │                        │
                └───────────────────────┼────────────────────────┘
                                        │
                                        ▼
                            ┌───────────────────────┐
                            │ Calculate Suggested   │
                            │ Weight = avgWeight +  │
                            │          adjustment   │
                            └───────────┬───────────┘
                                        │
                                        ▼
                            ┌───────────────────────┐
                            │ Apply Constraints     │
                            │ • Max 20% increase    │
                            │ • Round to 2.5/5 lbs  │
                            │ • Safety bounds check │
                            └───────────┬───────────┘
                                        │
                ┌───────────────────────┼───────────────────────┐
                ▼                       ▼                       ▼
        ┌───────────────┐      ┌──────────────────┐      ┌───────────────┐
        │ Within Limits │      │ Exceeds 20% Cap  │      │ Safety Bounds │
        │ ✓ Use as-is   │      │ ⚠ Cap at 20%    │      │ ⚠ Fallback    │
        └───────┬───────┘      └────────┬─────────┘      └───────┬───────┘
                │                       │                        │
                └───────────────────────┼────────────────────────┘
                                        │
                                        ▼
                            ┌───────────────────────┐
                            │ Validate Result       │
                            │ • Data quality        │
                            │ • Reasonableness      │
                            │ • Calculate confidence│
                            │ • Generate warnings   │
                            └───────────┬───────────┘
                                        │
                                        ▼
                            ┌───────────────────────┐
                            │ Return Suggestion     │
                            │ {                     │
                            │   suggestedWeight,    │
                            │   reason,             │
                            │   confidence,         │
                            │   warnings            │
                            │ }                     │
                            └───────────────────────┘
```

---

## Constraint Enforcement Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      CONSTRAINT ENFORCEMENT FLOW                         │
└─────────────────────────────────────────────────────────────────────────┘

                    Calculated Suggestion: 150 lbs
                    Week 1 Average: 100 lbs
                            │
                            ▼
            ┌───────────────────────────────────┐
            │ Calculate 20% Maximum Cap         │
            │ maxAllowed = 100 × 1.20 = 120 lbs│
            └───────────────┬───────────────────┘
                            │
                            ▼
            ┌───────────────────────────────────┐
            │ Compare: 150 > 120?               │
            │ YES → Apply cap                   │
            └───────────────┬───────────────────┘
                            │
                            ▼
            ┌───────────────────────────────────┐
            │ Constrained Weight: 120 lbs       │
            │ Flag: constrained = true          │
            │ Reason: "Capped at 20% increase"  │
            └───────────────┬───────────────────┘
                            │
                            ▼
            ┌───────────────────────────────────┐
            │ Round to Nearest Increment        │
            │ Exercise Type: COMPOUND           │
            │ Increment: 5 lbs                  │
            │ 120 → 120 lbs (already multiple) │
            └───────────────┬───────────────────┘
                            │
                            ▼
            ┌───────────────────────────────────┐
            │ Safety Bounds Check               │
            │ MIN: 100 × 0.5 = 50 lbs          │
            │ MAX: 100 × 1.3 = 130 lbs         │
            │ 120 within [50, 130]? ✓ YES      │
            └───────────────┬───────────────────┘
                            │
                            ▼
            ┌───────────────────────────────────┐
            │ Absolute Bounds Check             │
            │ MIN: 2.5 lbs                      │
            │ MAX: 1000 lbs                     │
            │ 120 within [2.5, 1000]? ✓ YES    │
            └───────────────┬───────────────────┘
                            │
                            ▼
            ┌───────────────────────────────────┐
            │ Final Suggestion: 120 lbs         │
            │ Confidence: MEDIUM                │
            │ Warning: "Capped at 20% increase" │
            └───────────────────────────────────┘
```

---

## Error Handling Decision Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                       ERROR HANDLING FLOW                                │
└─────────────────────────────────────────────────────────────────────────┘

                        Data Retrieval
                              │
                              ▼
            ┌─────────────────────────────────┐
            │ Try: localStorage.getItem()     │
            └─────────────┬───────────────────┘
                          │
          ┌───────────────┼───────────────────┐
          ▼               ▼                   ▼
    ┌──────────┐    ┌──────────┐      ┌──────────┐
    │ Success  │    │ null     │      │ Error    │
    └────┬─────┘    └────┬─────┘      └────┬─────┘
         │               │                   │
         ▼               ▼                   ▼
    ┌──────────┐    ┌──────────┐      ┌──────────┐
    │ Parse    │    │ Return   │      │ Log      │
    │ JSON     │    │ null     │      │ Return   │
    └────┬─────┘    │ "No data"│      │ null     │
         │          └──────────┘      └──────────┘
         ▼
    ┌──────────────────────────────┐
    │ Check data.version           │
    └─────────────┬────────────────┘
                  │
      ┌───────────┼───────────┐
      ▼           ▼           ▼
  ┌────────┐  ┌────────┐  ┌────────┐
  │ v2.0.0 │  │ v1.0.0 │  │ null   │
  └───┬────┘  └───┬────┘  └───┬────┘
      │           │           │
      │           ▼           ▼
      │      ┌─────────────────────┐
      │      │ Migrate:            │
      │      │ • Convert strings   │
      │      │   to numbers        │
      │      │ • Add version       │
      │      │ • Add timestamp     │
      │      └─────────┬───────────┘
      │                │
      └────────────────┼───────────┐
                       │           │
                       ▼           │
            ┌──────────────────┐   │
            │ Validate Data    │   │
            │ • Type check     │   │
            │ • Range check    │   │
            │ • Schema check   │   │
            └────────┬─────────┘   │
                     │             │
         ┌───────────┼───────────┐ │
         ▼           ▼           ▼ ▼
    ┌────────┐  ┌────────┐  ┌────────┐
    │ Valid  │  │ Invalid│  │ Partial│
    └───┬────┘  └───┬────┘  └───┬────┘
        │           │           │
        │           ▼           ▼
        │      ┌─────────────────────┐
        │      │ Sanitize:           │
        │      │ • Fix negative →0   │
        │      │ • Fix NaN → 0       │
        │      │ • Fix out of bounds │
        │      └─────────┬───────────┘
        │                │
        └────────────────┼───────────┐
                         │           │
                         ▼           │
              ┌──────────────────┐   │
              │ Return Data      │   │
              │ + warnings[]     │   │
              └──────────────────┘   │
                                     │
                ┌────────────────────┘
                │
                ▼
    ┌──────────────────────────┐
    │ Calculation can proceed  │
    │ with validated/sanitized │
    │ data + warnings          │
    └──────────────────────────┘
```

---

## Performance Monitoring Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    PERFORMANCE MONITORING FLOW                           │
└─────────────────────────────────────────────────────────────────────────┘

    User requests suggestion
            │
            ▼
    ┌───────────────────┐
    │ Start Timer       │  const startTime = performance.now()
    └─────────┬─────────┘
              │
              ▼
    ┌───────────────────┐
    │ RETRIEVAL PHASE   │
    │ • localStorage    │  ← Measure: ~0.5ms
    │ • Parse JSON      │  ← Measure: ~0.2ms
    │ • Validate        │  ← Measure: ~0.5ms
    └─────────┬─────────┘
              │
              ▼  Checkpoint: Retrieval Time = t1 - t0
              │
    ┌───────────────────┐
    │ CALCULATION PHASE │
    │ • Averages        │  ← Measure: ~0.1ms
    │ • Performance     │  ← Measure: ~0.3ms
    │ • Adjustment      │  ← Measure: ~0.1ms
    └─────────┬─────────┘
              │
              ▼  Checkpoint: Calculation Time = t2 - t1
              │
    ┌───────────────────┐
    │ CONSTRAINT PHASE  │
    │ • 20% cap         │  ← Measure: ~0.2ms
    │ • Rounding        │  ← Measure: ~0.1ms
    │ • Safety checks   │  ← Measure: ~0.2ms
    └─────────┬─────────┘
              │
              ▼  Checkpoint: Constraint Time = t3 - t2
              │
    ┌───────────────────┐
    │ VALIDATION PHASE  │
    │ • Quality check   │  ← Measure: ~0.3ms
    │ • Confidence      │  ← Measure: ~0.2ms
    │ • Warnings        │  ← Measure: ~0.1ms
    └─────────┬─────────┘
              │
              ▼  Checkpoint: Validation Time = t4 - t3
              │
    ┌───────────────────┐
    │ End Timer         │  const endTime = performance.now()
    │ Total: ~3ms       │  totalTime = endTime - startTime
    └─────────┬─────────┘
              │
              ▼
    ┌───────────────────────────────┐
    │ Log Performance Metrics       │
    │ {                             │
    │   total: 3.2ms,               │
    │   retrieval: 1.2ms,           │
    │   calculation: 0.5ms,         │
    │   constraints: 0.5ms,         │
    │   validation: 0.6ms           │
    │ }                             │
    └───────────────┬───────────────┘
                    │
                    ▼
    ┌───────────────────────────────┐
    │ Check against targets:        │
    │ • Total < 10ms? ✓             │
    │ • No blocking? ✓              │
    └───────────────────────────────┘
```

---

## State Machine: Suggestion Lifecycle

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    SUGGESTION STATE MACHINE                              │
└─────────────────────────────────────────────────────────────────────────┘

                            ┌────────────┐
                            │   IDLE     │
                            │ (No data)  │
                            └─────┬──────┘
                                  │
                                  │ User completes Week 1
                                  │
                                  ▼
                        ┌──────────────────┐
                        │ WEEK1_COMPLETE   │
                        │ (Data available) │
                        └────────┬─────────┘
                                 │
                                 │ User navigates to Week 2
                                 │
                                 ▼
                        ┌──────────────────┐
                        │   CALCULATING    │
                        │ (Processing...)  │
                        └────────┬─────────┘
                                 │
                    ┌────────────┼────────────┐
                    ▼            ▼            ▼
            ┌───────────┐  ┌───────────┐  ┌───────────┐
            │  SUCCESS  │  │  WARNING  │  │   ERROR   │
            │ (Valid)   │  │ (Low conf)│  │ (Failed)  │
            └─────┬─────┘  └─────┬─────┘  └─────┬─────┘
                  │              │              │
                  ▼              ▼              ▼
            ┌───────────────────────────────────────┐
            │        AWAITING_USER_DECISION         │
            │ [Accept] [Modify] [Reject] [Request]  │
            └───────────┬───────────────────────────┘
                        │
        ┌───────────────┼───────────────┬─────────────┐
        ▼               ▼               ▼             ▼
  ┌──────────┐  ┌──────────────┐  ┌──────────┐  ┌────────────┐
  │ ACCEPTED │  │   MODIFIED   │  │ REJECTED │  │  REQUESTED │
  │ (Used)   │  │ (Override)   │  │ (Ignored)│  │  (Help)    │
  └────┬─────┘  └──────┬───────┘  └────┬─────┘  └──────┬─────┘
       │               │               │               │
       │               │               │               │
       ▼               ▼               ▼               │
  ┌────────────────────────────────────────┐          │
  │         IN_USE (Week 2)                │          │
  │  Track performance with this weight    │          │
  └────────────┬───────────────────────────┘          │
               │                                       │
               │ Week 2 complete                      │
               │                                       │
               ▼                                       │
  ┌────────────────────────────────────────┐          │
  │        WEEK2_COMPLETE                  │          │
  │  New baseline for Week 3 suggestions   │          │
  └────────────┬───────────────────────────┘          │
               │                                       │
               │ Cycle repeats                        │
               │                                       │
               ▼                                       │
  ┌────────────────────────────────────────┐          │
  │            ARCHIVED                    │          │
  │  Historical data for progress tracking │          │
  └────────────────────────────────────────┘          │
                                                       │
                                                       ▼
                                        ┌────────────────────────┐
                                        │     MANUAL_ASSIST      │
                                        │ Show educational info, │
                                        │ suggest consult with   │
                                        │ trainer, etc.          │
                                        └────────────────────────┘
```

---

## Component Dependency Graph

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    COMPONENT DEPENDENCIES                                │
└─────────────────────────────────────────────────────────────────────────┘

                        ┌──────────────────┐
                        │ suggestionConfig │  (Constants)
                        └────────┬─────────┘
                                 │
                    ┌────────────┴────────────┐
                    │                         │
                    ▼                         ▼
        ┌──────────────────┐      ┌──────────────────┐
        │  DataValidator   │      │ ConstraintChecker│
        │  (Validation)    │      │  (Constraints)   │
        └────────┬─────────┘      └────────┬─────────┘
                 │                         │
                 │          ┌──────────────┘
                 │          │
                 │          │     ┌──────────────────┐
                 │          │     │ ResultValidator  │
                 │          │     │ (Post-validation)│
                 │          │     └────────┬─────────┘
                 │          │              │
                 └──────────┼──────────────┘
                            │
                            ▼
                ┌──────────────────────┐
                │  SuggestionEngine    │
                │  (Core calculation)  │
                └───────────┬──────────┘
                            │
                ┌───────────┴───────────┐
                ▼                       ▼
    ┌──────────────────┐    ┌──────────────────┐
    │  DataRetrieval   │    │  WorkoutState    │
    │  (localStorage)  │    │  (State mgmt)    │
    └────────┬─────────┘    └────────┬─────────┘
             │                       │
             └───────────┬───────────┘
                         │
                         ▼
                 ┌──────────────┐
                 │   Storage    │
                 │ (Persistence)│
                 └──────────────┘
```

---

## Validation Chain Visualization

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        VALIDATION CHAIN                                  │
└─────────────────────────────────────────────────────────────────────────┘

Input: "20" (string), "10" (string)
   │
   ├─ [Layer 1: Input Sanitization] ─────────────────────────┐
   │  • parseFloat("20") → 20 (number)                       │
   │  • parseInt("10", 10) → 10 (number)                     │
   │  • Bounds check: 0 ≤ 20 ≤ 1000 ✓                       │
   │  • Bounds check: 0 ≤ 10 ≤ 100 ✓                        │
   │  ✓ PASS                                                  │
   └──────────────────────────────────────────────────────────┘
   │
   ├─ [Layer 2: Schema Validation] ──────────────────────────┐
   │  • Type check: typeof 20 === 'number' ✓                │
   │  • Type check: typeof 10 === 'number' ✓                │
   │  • Required fields: weight ✓ reps ✓ completed ✓        │
   │  • Value validation: weight > 0 ✓ reps > 0 ✓           │
   │  ✓ PASS                                                  │
   └──────────────────────────────────────────────────────────┘
   │
   ├─ [Layer 3: Storage Validation] ─────────────────────────┐
   │  • JSON serialization test ✓                            │
   │  • Version tagging: v2.0.0 ✓                            │
   │  • Timestamp added ✓                                     │
   │  ✓ PASS → Store in localStorage                        │
   └──────────────────────────────────────────────────────────┘
   │
   │ [STORAGE]
   │
   ├─ [Layer 4: Retrieval Validation] ───────────────────────┐
   │  • JSON parse test ✓                                     │
   │  • Version check: v2.0.0 (current) ✓                    │
   │  • Type validation post-parse ✓                          │
   │  • Data integrity check ✓                                │
   │  ✓ PASS                                                  │
   └──────────────────────────────────────────────────────────┘
   │
   ├─ [Layer 5: Pre-Calculation Validation] ─────────────────┐
   │  • Sufficient data: 2 sets ✓                            │
   │  • All numeric: weight, reps ✓                          │
   │  • Completed sets: 2/2 ✓                                │
   │  ✓ PASS → Proceed with calculation                     │
   └──────────────────────────────────────────────────────────┘
   │
   │ [CALCULATION: avgWeight = 20, avgReps = 10]
   │ [SUGGESTION: 22.5 lbs (+2.5)]
   │
   ├─ [Layer 6: Constraint Enforcement] ─────────────────────┐
   │  • 20% cap: 22.5 ≤ (20 × 1.2 = 24) ✓                   │
   │  • Increment: 22.5 % 2.5 === 0 ✓                        │
   │  • Safety bounds: 22.5 within [10, 26] ✓                │
   │  ✓ PASS                                                  │
   └──────────────────────────────────────────────────────────┘
   │
   ├─ [Layer 7: Result Validation] ──────────────────────────┐
   │  • Data quality: HIGH (2 sets, consistent) ✓            │
   │  • Reasonableness: +12.5% increase ✓                     │
   │  • Confidence: HIGH ✓                                    │
   │  • Warnings: None ✓                                      │
   │  ✓ PASS → Return to user                               │
   └──────────────────────────────────────────────────────────┘
   │
   ▼
Output: { suggestedWeight: 22.5, confidence: 'high', ... }
```

---

This comprehensive diagram set illustrates all critical flows, decision points, and validation layers in the weight suggestion system architecture.
