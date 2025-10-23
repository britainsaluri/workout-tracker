# Sets Input System Design Specification

## 1. Overview

This document specifies the architecture for handling multiple sets per exercise in the workout tracker, including parsing set notation, dynamic input generation, data storage, and progress tracking.

## 2. Data Model

### 2.1 Set Notation Format

**Supported Formats:**
- `NxR` - N sets of R reps (e.g., "3x12" = 3 sets of 12 reps)
- `NxR-R` - N sets with rep range (e.g., "2x18-20" = 2 sets, 18-20 reps each)
- `NxRea` - N sets of R reps each side (e.g., "2x10ea" = 2 sets, 10 reps per side)

### 2.2 Core Data Structures

```typescript
// Set Definition (from workout template)
interface SetDefinition {
  setCount: number;           // Number of sets
  targetReps: number | [number, number]; // Single value or [min, max] range
  isUnilateral: boolean;      // true for "ea" notation
}

// Single Set Result (user input)
interface SetResult {
  setNumber: number;          // 1-indexed set number
  weight: number;             // Weight used (lbs or kg)
  reps: number;               // Actual reps completed
  side?: 'left' | 'right';    // For unilateral exercises
  timestamp: Date;            // When set was completed
  notes?: string;             // Optional set-specific notes
}

// Exercise Session (all sets for one exercise)
interface ExerciseSession {
  exerciseId: string;
  workoutId: string;
  userId: string;
  date: Date;
  sets: SetResult[];
  totalVolume: number;        // Calculated: sum(weight × reps)
  completed: boolean;         // All sets finished
}

// Historical Set Data (for progress tracking)
interface HistoricalSetData {
  exerciseId: string;
  userId: string;
  sessions: ExerciseSession[];
  personalRecords: {
    maxWeight: number;
    maxReps: number;
    maxVolume: number;
    lastUpdated: Date;
  };
}
```

### 2.3 Database Schema

**MongoDB Collections:**

```typescript
// exercises_sessions collection
{
  _id: ObjectId,
  exerciseId: string,           // Reference to exercise
  workoutId: string,            // Reference to workout
  userId: string,               // Reference to user
  date: ISODate,
  sets: [
    {
      setNumber: number,
      weight: number,
      reps: number,
      side?: string,            // Optional for unilateral
      timestamp: ISODate,
      notes?: string
    }
  ],
  totalVolume: number,
  completed: boolean,
  createdAt: ISODate,
  updatedAt: ISODate
}

// Index Strategy
db.exercise_sessions.createIndex({ userId: 1, exerciseId: 1, date: -1 })
db.exercise_sessions.createIndex({ workoutId: 1 })
```

## 3. Set Notation Parser

### 3.1 Parser Architecture

```typescript
class SetNotationParser {
  private static readonly PATTERNS = {
    standard: /^(\d+)x(\d+)$/,              // 3x12
    range: /^(\d+)x(\d+)-(\d+)$/,           // 2x18-20
    unilateral: /^(\d+)x(\d+)ea$/           // 2x10ea
  };

  static parse(notation: string): SetDefinition {
    const trimmed = notation.trim().toLowerCase();

    // Try unilateral pattern first (most specific)
    let match = trimmed.match(this.PATTERNS.unilateral);
    if (match) {
      return {
        setCount: parseInt(match[1]),
        targetReps: parseInt(match[2]),
        isUnilateral: true
      };
    }

    // Try range pattern
    match = trimmed.match(this.PATTERNS.range);
    if (match) {
      return {
        setCount: parseInt(match[1]),
        targetReps: [parseInt(match[2]), parseInt(match[3])],
        isUnilateral: false
      };
    }

    // Try standard pattern
    match = trimmed.match(this.PATTERNS.standard);
    if (match) {
      return {
        setCount: parseInt(match[1]),
        targetReps: parseInt(match[2]),
        isUnilateral: false
      };
    }

    throw new Error(`Invalid set notation: ${notation}`);
  }

  static validate(notation: string): boolean {
    try {
      this.parse(notation);
      return true;
    } catch {
      return false;
    }
  }

  static formatRepTarget(definition: SetDefinition): string {
    if (Array.isArray(definition.targetReps)) {
      return `${definition.targetReps[0]}-${definition.targetReps[1]} reps`;
    }
    return `${definition.targetReps} reps${definition.isUnilateral ? ' each side' : ''}`;
  }
}
```

### 3.2 Parsing Examples

```typescript
// Input: "3x12"
{
  setCount: 3,
  targetReps: 12,
  isUnilateral: false
}

// Input: "2x18-20"
{
  setCount: 2,
  targetReps: [18, 20],
  isUnilateral: false
}

// Input: "2x10ea"
{
  setCount: 2,
  targetReps: 10,
  isUnilateral: true
}
```

## 4. Dynamic Input Field Generation

### 4.1 Component Architecture

```typescript
interface SetInputFieldsProps {
  exerciseId: string;
  setDefinition: SetDefinition;
  previousResults?: SetResult[];
  onSetComplete: (setResult: SetResult) => void;
}

class SetInputFields extends React.Component<SetInputFieldsProps> {
  generateFields(): JSX.Element[] {
    const { setDefinition, previousResults } = this.props;
    const fields: JSX.Element[] = [];

    for (let i = 1; i <= setDefinition.setCount; i++) {
      if (setDefinition.isUnilateral) {
        // Generate fields for both sides
        fields.push(
          this.renderSetInput(i, 'left', previousResults),
          this.renderSetInput(i, 'right', previousResults)
        );
      } else {
        // Generate single field for bilateral exercise
        fields.push(
          this.renderSetInput(i, undefined, previousResults)
        );
      }
    }

    return fields;
  }

  renderSetInput(
    setNumber: number,
    side?: 'left' | 'right',
    previousResults?: SetResult[]
  ): JSX.Element {
    const previousSet = this.findPreviousSet(setNumber, side, previousResults);
    const targetReps = this.getTargetRepsDisplay();

    return (
      <SetInputRow
        key={`set-${setNumber}${side ? `-${side}` : ''}`}
        setNumber={setNumber}
        side={side}
        targetReps={targetReps}
        previousWeight={previousSet?.weight}
        previousReps={previousSet?.reps}
        onComplete={(weight, reps) =>
          this.handleSetComplete(setNumber, weight, reps, side)
        }
      />
    );
  }

  private findPreviousSet(
    setNumber: number,
    side?: 'left' | 'right',
    previousResults?: SetResult[]
  ): SetResult | undefined {
    if (!previousResults) return undefined;

    return previousResults.find(result =>
      result.setNumber === setNumber && result.side === side
    );
  }

  private getTargetRepsDisplay(): string {
    const { targetReps } = this.props.setDefinition;
    if (Array.isArray(targetReps)) {
      return `${targetReps[0]}-${targetReps[1]}`;
    }
    return targetReps.toString();
  }

  private handleSetComplete(
    setNumber: number,
    weight: number,
    reps: number,
    side?: 'left' | 'right'
  ): void {
    const setResult: SetResult = {
      setNumber,
      weight,
      reps,
      side,
      timestamp: new Date()
    };

    this.props.onSetComplete(setResult);
  }
}
```

### 4.2 UI Layout Patterns

**Bilateral Exercise (3x12):**
```
Set 1: [Weight: ___] [Reps: ___] (Previous: 100lbs × 12 reps)
Set 2: [Weight: ___] [Reps: ___] (Previous: 100lbs × 11 reps)
Set 3: [Weight: ___] [Reps: ___] (Previous: 100lbs × 10 reps)
```

**Unilateral Exercise (2x10ea):**
```
Set 1 Left:  [Weight: ___] [Reps: ___] (Previous: 35lbs × 10 reps)
Set 1 Right: [Weight: ___] [Reps: ___] (Previous: 35lbs × 10 reps)
Set 2 Left:  [Weight: ___] [Reps: ___] (Previous: 35lbs × 9 reps)
Set 2 Right: [Weight: ___] [Reps: ___] (Previous: 35lbs × 9 reps)
```

**Range Exercise (2x18-20):**
```
Set 1: [Weight: ___] [Reps: ___] (Target: 18-20 reps) (Previous: 20lbs × 19 reps)
Set 2: [Weight: ___] [Reps: ___] (Target: 18-20 reps) (Previous: 20lbs × 18 reps)
```

## 5. Storage Strategy

### 5.1 Data Flow Architecture

```
User Input → Form Validation → SetResult Creation →
Session Update → Database Persistence → Cache Update
```

### 5.2 Storage Service

```typescript
class ExerciseSessionService {
  async createSession(
    exerciseId: string,
    workoutId: string,
    userId: string
  ): Promise<ExerciseSession> {
    const session: ExerciseSession = {
      exerciseId,
      workoutId,
      userId,
      date: new Date(),
      sets: [],
      totalVolume: 0,
      completed: false
    };

    return await db.exercise_sessions.insertOne(session);
  }

  async addSetResult(
    sessionId: string,
    setResult: SetResult
  ): Promise<ExerciseSession> {
    const session = await db.exercise_sessions.findOne({ _id: sessionId });

    // Add set result
    session.sets.push(setResult);

    // Recalculate total volume
    session.totalVolume = this.calculateTotalVolume(session.sets);

    // Check if all sets completed
    session.completed = this.checkAllSetsCompleted(session);

    session.updatedAt = new Date();

    await db.exercise_sessions.updateOne(
      { _id: sessionId },
      { $set: session }
    );

    return session;
  }

  async updateSetResult(
    sessionId: string,
    setNumber: number,
    side: 'left' | 'right' | undefined,
    updates: Partial<SetResult>
  ): Promise<ExerciseSession> {
    const session = await db.exercise_sessions.findOne({ _id: sessionId });

    const setIndex = session.sets.findIndex(
      s => s.setNumber === setNumber && s.side === side
    );

    if (setIndex === -1) {
      throw new Error('Set not found');
    }

    session.sets[setIndex] = {
      ...session.sets[setIndex],
      ...updates,
      timestamp: new Date()
    };

    session.totalVolume = this.calculateTotalVolume(session.sets);
    session.updatedAt = new Date();

    await db.exercise_sessions.updateOne(
      { _id: sessionId },
      { $set: session }
    );

    return session;
  }

  async getPreviousSession(
    exerciseId: string,
    userId: string,
    beforeDate?: Date
  ): Promise<ExerciseSession | null> {
    const query: any = {
      exerciseId,
      userId,
      completed: true
    };

    if (beforeDate) {
      query.date = { $lt: beforeDate };
    }

    return await db.exercise_sessions
      .findOne(query)
      .sort({ date: -1 });
  }

  private calculateTotalVolume(sets: SetResult[]): number {
    return sets.reduce((total, set) => {
      return total + (set.weight * set.reps);
    }, 0);
  }

  private checkAllSetsCompleted(session: ExerciseSession): boolean {
    // Implementation depends on set definition
    // This is a placeholder
    return session.sets.length > 0;
  }
}
```

### 5.3 Caching Strategy

```typescript
class SessionCache {
  private cache: Map<string, ExerciseSession> = new Map();

  async getOrFetch(
    sessionId: string,
    fetcher: () => Promise<ExerciseSession>
  ): Promise<ExerciseSession> {
    if (this.cache.has(sessionId)) {
      return this.cache.get(sessionId)!;
    }

    const session = await fetcher();
    this.cache.set(sessionId, session);
    return session;
  }

  update(sessionId: string, session: ExerciseSession): void {
    this.cache.set(sessionId, session);
  }

  invalidate(sessionId: string): void {
    this.cache.delete(sessionId);
  }

  clear(): void {
    this.cache.clear();
  }
}
```

## 6. Progress Tracking Algorithm

### 6.1 Progress Metrics

```typescript
interface ProgressMetrics {
  // Weight progression
  weightProgression: {
    current: number;
    previous: number;
    change: number;
    changePercent: number;
  };

  // Rep progression
  repProgression: {
    current: number;
    previous: number;
    change: number;
    changePercent: number;
  };

  // Volume progression
  volumeProgression: {
    current: number;
    previous: number;
    change: number;
    changePercent: number;
  };

  // Set-by-set comparison
  setComparison: SetComparison[];

  // Overall trend
  trend: 'improving' | 'maintaining' | 'declining' | 'no_data';
}

interface SetComparison {
  setNumber: number;
  side?: 'left' | 'right';
  current: SetResult;
  previous?: SetResult;
  weightDelta: number;
  repDelta: number;
  volumeDelta: number;
}
```

### 6.2 Progress Calculation Engine

```typescript
class ProgressCalculator {
  calculateProgress(
    currentSession: ExerciseSession,
    previousSession: ExerciseSession | null
  ): ProgressMetrics {
    if (!previousSession) {
      return this.createBaselineMetrics(currentSession);
    }

    const setComparisons = this.compareSetsBySets(
      currentSession.sets,
      previousSession.sets
    );

    return {
      weightProgression: this.calculateWeightProgression(
        currentSession.sets,
        previousSession.sets
      ),
      repProgression: this.calculateRepProgression(
        currentSession.sets,
        previousSession.sets
      ),
      volumeProgression: this.calculateVolumeProgression(
        currentSession.totalVolume,
        previousSession.totalVolume
      ),
      setComparison: setComparisons,
      trend: this.determineTrend(setComparisons)
    };
  }

  private compareSetsBySets(
    currentSets: SetResult[],
    previousSets: SetResult[]
  ): SetComparison[] {
    return currentSets.map(currentSet => {
      const previousSet = previousSets.find(
        prev =>
          prev.setNumber === currentSet.setNumber &&
          prev.side === currentSet.side
      );

      const weightDelta = previousSet
        ? currentSet.weight - previousSet.weight
        : 0;

      const repDelta = previousSet
        ? currentSet.reps - previousSet.reps
        : 0;

      const volumeDelta = previousSet
        ? (currentSet.weight * currentSet.reps) -
          (previousSet.weight * previousSet.reps)
        : 0;

      return {
        setNumber: currentSet.setNumber,
        side: currentSet.side,
        current: currentSet,
        previous: previousSet,
        weightDelta,
        repDelta,
        volumeDelta
      };
    });
  }

  private calculateWeightProgression(
    currentSets: SetResult[],
    previousSets: SetResult[]
  ) {
    const currentAvg = this.averageWeight(currentSets);
    const previousAvg = this.averageWeight(previousSets);
    const change = currentAvg - previousAvg;
    const changePercent = previousAvg > 0
      ? (change / previousAvg) * 100
      : 0;

    return {
      current: currentAvg,
      previous: previousAvg,
      change,
      changePercent
    };
  }

  private calculateRepProgression(
    currentSets: SetResult[],
    previousSets: SetResult[]
  ) {
    const currentTotal = currentSets.reduce((sum, s) => sum + s.reps, 0);
    const previousTotal = previousSets.reduce((sum, s) => sum + s.reps, 0);
    const change = currentTotal - previousTotal;
    const changePercent = previousTotal > 0
      ? (change / previousTotal) * 100
      : 0;

    return {
      current: currentTotal,
      previous: previousTotal,
      change,
      changePercent
    };
  }

  private calculateVolumeProgression(
    currentVolume: number,
    previousVolume: number
  ) {
    const change = currentVolume - previousVolume;
    const changePercent = previousVolume > 0
      ? (change / previousVolume) * 100
      : 0;

    return {
      current: currentVolume,
      previous: previousVolume,
      change,
      changePercent
    };
  }

  private determineTrend(comparisons: SetComparison[]): ProgressMetrics['trend'] {
    if (comparisons.length === 0 || !comparisons[0].previous) {
      return 'no_data';
    }

    const improvingCount = comparisons.filter(c => c.volumeDelta > 0).length;
    const decliningCount = comparisons.filter(c => c.volumeDelta < 0).length;
    const maintainingCount = comparisons.filter(c => c.volumeDelta === 0).length;

    const totalSets = comparisons.length;
    const improvingRatio = improvingCount / totalSets;
    const decliningRatio = decliningCount / totalSets;

    if (improvingRatio >= 0.6) return 'improving';
    if (decliningRatio >= 0.6) return 'declining';
    return 'maintaining';
  }

  private averageWeight(sets: SetResult[]): number {
    if (sets.length === 0) return 0;
    const sum = sets.reduce((total, set) => total + set.weight, 0);
    return sum / sets.length;
  }

  private createBaselineMetrics(session: ExerciseSession): ProgressMetrics {
    return {
      weightProgression: {
        current: this.averageWeight(session.sets),
        previous: 0,
        change: 0,
        changePercent: 0
      },
      repProgression: {
        current: session.sets.reduce((sum, s) => sum + s.reps, 0),
        previous: 0,
        change: 0,
        changePercent: 0
      },
      volumeProgression: {
        current: session.totalVolume,
        previous: 0,
        change: 0,
        changePercent: 0
      },
      setComparison: session.sets.map(set => ({
        setNumber: set.setNumber,
        side: set.side,
        current: set,
        previous: undefined,
        weightDelta: 0,
        repDelta: 0,
        volumeDelta: 0
      })),
      trend: 'no_data'
    };
  }
}
```

## 7. Architecture Decision Records (ADRs)

### ADR-001: Set-Level Granularity Storage

**Context:** Need to track individual set results for progress analysis.

**Decision:** Store each set result as a separate object within the session document rather than aggregating at exercise level.

**Rationale:**
- Enables set-by-set comparison
- Supports detailed progress tracking
- Allows for set-specific notes and timestamps
- Minimal storage overhead with indexed queries

**Consequences:**
- More complex queries for aggregated metrics
- Requires careful indexing for performance
- Increases document size slightly

### ADR-002: Embedded vs Referenced Set Data

**Context:** Should set results be embedded in session documents or stored in separate collection?

**Decision:** Embed set results within exercise session documents.

**Rationale:**
- Sets always accessed with parent session (no orphaned data)
- Atomic updates for entire session
- Better query performance (single document read)
- Typical sessions have 3-6 sets (reasonable document size)

**Consequences:**
- Cannot query sets across sessions directly
- Must denormalize for analytics queries
- Document size limited to 16MB (not a practical concern)

### ADR-003: Real-time vs Batch Progress Calculation

**Context:** When should progress metrics be calculated?

**Decision:** Calculate on-demand when viewing progress, cache for session duration.

**Rationale:**
- Progress viewed less frequently than data entry
- Calculation logic may evolve (no stored stale data)
- Reduced write operations
- Session-level caching provides adequate performance

**Consequences:**
- Small delay when first viewing progress
- Requires efficient historical data retrieval
- Need robust caching strategy

### ADR-004: Unilateral Exercise Representation

**Context:** How to represent exercises performed per side (e.g., single-leg exercises)?

**Decision:** Use optional `side` field on SetResult with 'left' | 'right' enum.

**Rationale:**
- Flexible for both bilateral and unilateral exercises
- Enables side-specific progress tracking
- Minimal schema complexity
- Clear semantic meaning

**Consequences:**
- Must handle side parameter in all set-related operations
- UI must render twice as many fields for unilateral exercises
- Query complexity increases for side-specific analytics

## 8. Component Integration

### 8.1 Component Hierarchy

```
WorkoutExecutionPage
  └─ ExerciseList
      └─ ExerciseCard
          ├─ ExerciseHeader (name, sets notation)
          ├─ SetInputFields (dynamic generation)
          │   └─ SetInputRow (single set input)
          │       ├─ WeightInput
          │       ├─ RepsInput
          │       └─ PreviousResultBadge
          ├─ ProgressIndicator
          └─ NotesInput
```

### 8.2 State Management

```typescript
interface WorkoutExecutionState {
  workoutId: string;
  exercises: ExerciseExecutionState[];
  currentExerciseIndex: number;
}

interface ExerciseExecutionState {
  exerciseId: string;
  sessionId: string;
  setDefinition: SetDefinition;
  completedSets: SetResult[];
  previousSession?: ExerciseSession;
  progress?: ProgressMetrics;
}

// Redux actions
const actions = {
  startExercise: (exerciseId: string, setDefinition: SetDefinition),
  completeSet: (sessionId: string, setResult: SetResult),
  updateSet: (sessionId: string, setNumber: number, updates: Partial<SetResult>),
  loadPreviousSession: (exerciseId: string, userId: string),
  calculateProgress: (sessionId: string)
};
```

## 9. Validation Rules

### 9.1 Input Validation

```typescript
class SetInputValidator {
  static validateWeight(weight: number, unit: 'lbs' | 'kg'): ValidationResult {
    if (weight < 0) {
      return { valid: false, error: 'Weight must be positive' };
    }

    if (unit === 'lbs' && weight > 1000) {
      return { valid: false, error: 'Weight exceeds maximum (1000 lbs)' };
    }

    if (unit === 'kg' && weight > 500) {
      return { valid: false, error: 'Weight exceeds maximum (500 kg)' };
    }

    // Check for reasonable increment (2.5 lbs / 1.25 kg minimum)
    const minIncrement = unit === 'lbs' ? 2.5 : 1.25;
    if (weight % minIncrement !== 0) {
      return {
        valid: false,
        error: `Weight must be in ${minIncrement} ${unit} increments`
      };
    }

    return { valid: true };
  }

  static validateReps(reps: number, targetReps: number | [number, number]): ValidationResult {
    if (reps < 0) {
      return { valid: false, error: 'Reps must be positive' };
    }

    if (!Number.isInteger(reps)) {
      return { valid: false, error: 'Reps must be a whole number' };
    }

    if (reps > 100) {
      return { valid: false, error: 'Reps exceeds maximum (100)' };
    }

    // Warn if significantly below target (not an error, just warning)
    if (Array.isArray(targetReps)) {
      if (reps < targetReps[0] * 0.5) {
        return {
          valid: true,
          warning: `Reps significantly below target (${targetReps[0]}-${targetReps[1]})`
        };
      }
    } else {
      if (reps < targetReps * 0.5) {
        return {
          valid: true,
          warning: `Reps significantly below target (${targetReps})`
        };
      }
    }

    return { valid: true };
  }
}

interface ValidationResult {
  valid: boolean;
  error?: string;
  warning?: string;
}
```

## 10. Performance Considerations

### 10.1 Optimization Strategies

1. **Index Strategy:**
   - Compound index on (userId, exerciseId, date) for quick previous session lookup
   - Index on workoutId for workout-level queries
   - TTL index on completed sessions for auto-archival (optional)

2. **Query Optimization:**
   - Limit historical lookups to last N sessions (default 10)
   - Use projection to fetch only required fields
   - Implement cursor-based pagination for history views

3. **Caching:**
   - Cache previous session during workout execution
   - Cache progress calculations for session duration
   - Invalidate cache on set updates

4. **Lazy Loading:**
   - Load progress metrics on-demand (not with initial session)
   - Defer historical data loading until user views progress
   - Progressive rendering of set input fields

### 10.2 Scalability Considerations

- **Document Size:** Typical session with 6 sets = ~2KB (well under 16MB limit)
- **Write Operations:** 3-6 writes per exercise (acceptable for MongoDB)
- **Read Operations:** 1-2 reads per exercise (cached after initial load)
- **Sharding Strategy:** Shard by userId for horizontal scaling

## 11. Testing Strategy

### 11.1 Unit Tests

- SetNotationParser: All notation formats
- ProgressCalculator: All progression scenarios
- SetInputValidator: Boundary conditions
- ExerciseSessionService: CRUD operations

### 11.2 Integration Tests

- End-to-end workout flow
- Previous session retrieval
- Progress calculation with real data
- Cache invalidation scenarios

### 11.3 Test Data

```typescript
const testScenarios = {
  standardSets: {
    notation: '3x12',
    expected: { setCount: 3, targetReps: 12, isUnilateral: false }
  },
  rangeSets: {
    notation: '2x18-20',
    expected: { setCount: 2, targetReps: [18, 20], isUnilateral: false }
  },
  unilateralSets: {
    notation: '2x10ea',
    expected: { setCount: 2, targetReps: 10, isUnilateral: true }
  }
};
```

## 12. Future Enhancements

### 12.1 Potential Features

1. **Rest Timer Integration:** Auto-start timer after set completion
2. **Auto-fill Suggestions:** ML-based weight/rep suggestions
3. **Fatigue Detection:** Analyze rep decline patterns
4. **1RM Calculation:** Estimate one-rep max from set data
5. **Deload Detection:** Recommend deload weeks based on performance
6. **Volume Landmarks:** Track weekly/monthly volume trends
7. **Unilateral Imbalance Alerts:** Flag side-to-side strength differences

### 12.2 Analytics Opportunities

- Trend analysis across exercises
- Periodization effectiveness
- Recovery patterns
- Exercise correlation (compound vs isolation)

## 13. Summary

This architecture provides:

✅ **Flexible Parsing:** Handles all set notation formats
✅ **Dynamic UI:** Generates appropriate input fields automatically
✅ **Granular Storage:** Tracks individual set results
✅ **Comprehensive Progress:** Calculates multiple progression metrics
✅ **Scalable Design:** Optimized for performance and growth
✅ **Extensible:** Ready for future enhancements

**Key Design Principles:**
- Separation of concerns (parsing, storage, calculation)
- Component reusability
- Performance-first approach
- Clear data flow
- Testable architecture

---

**Document Version:** 1.0
**Last Updated:** 2025-10-23
**Author:** System Architecture Designer
**Status:** Ready for Implementation
