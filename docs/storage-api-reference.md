# Storage API Reference

## WorkoutState Class

### Initialization

#### `init()`
Initialize the state management system.

```javascript
await workoutState.init();
```

**Returns**: `Promise<void>`

---

### Workout Data Management

#### `loadWorkoutData(source)`
Load workout program data from JSON file or object.

```javascript
await workoutState.loadWorkoutData('./programs/beginner.json');
// or
await workoutState.loadWorkoutData({ programs: [...] });
```

**Parameters**:
- `source` (string | object): JSON file path/URL or workout data object

**Returns**: `Promise<void>`

**Throws**: Error if data is invalid or fetch fails

---

### Position Management

#### `setPosition(program, week, day)`
Set the current workout position.

```javascript
await workoutState.setPosition('beginner', 0, 0);
```

**Parameters**:
- `program` (string): Program ID
- `week` (number): Week index (0-based)
- `day` (number): Day index (0-based)

**Returns**: `Promise<void>`

#### `getPosition()`
Get the current workout position.

```javascript
const position = workoutState.getPosition();
// { program: 'beginner', week: 0, day: 0 }
```

**Returns**: `object` with `program`, `week`, `day` properties

#### `getCurrentWorkout()`
Get the workout data for the current position.

```javascript
const workout = workoutState.getCurrentWorkout();
// { name: 'Upper Body', exercises: [...] }
```

**Returns**: `object | null` - Current workout or null if no position set

---

### Workout Results

#### `saveWorkoutResult(result)`
Save a workout result.

```javascript
const resultId = await workoutState.saveWorkoutResult({
  exerciseId: 'squat',
  exerciseName: 'Barbell Squat',
  sets: [
    { weight: 185, reps: 10, completed: true }
  ],
  notes: 'Felt strong',
  rating: 4,
  duration: 1800
});
```

**Parameters**:
- `result` (object):
  - `exerciseId` (string): Exercise identifier
  - `exerciseName` (string): Exercise name
  - `sets` (Array): Array of set objects with `weight`, `reps`, `completed`
  - `notes` (string, optional): Workout notes
  - `rating` (number, optional): Difficulty rating 1-5
  - `duration` (number, optional): Duration in seconds
  - `program` (string, optional): Overrides current position
  - `week` (number, optional): Overrides current position
  - `day` (number, optional): Overrides current position
  - `date` (string, optional): ISO date string, defaults to now

**Returns**: `Promise<string>` - Result ID

**Throws**: Error if sets array is empty or invalid

#### `updateWorkoutResult(resultId, updates)`
Update an existing workout result.

```javascript
await workoutState.updateWorkoutResult(resultId, {
  notes: 'Updated notes',
  rating: 5
});
```

**Parameters**:
- `resultId` (string): Result ID to update
- `updates` (object): Fields to update

**Returns**: `Promise<void>`

**Throws**: Error if result not found

#### `deleteWorkoutResult(resultId)`
Delete a workout result.

```javascript
await workoutState.deleteWorkoutResult(resultId);
```

**Parameters**:
- `resultId` (string): Result ID to delete

**Returns**: `Promise<void>`

---

### Historical Data

#### `getExerciseHistory(exerciseId, options)`
Get workout history for a specific exercise.

```javascript
const history = await workoutState.getExerciseHistory('squat');
const recent = await workoutState.getExerciseHistory('squat', { limit: 5 });
```

**Parameters**:
- `exerciseId` (string): Exercise identifier
- `options` (object, optional):
  - `limit` (number): Maximum number of results

**Returns**: `Promise<Array>` - Array of result objects, sorted newest first

#### `getResultsByDateRange(startDate, endDate)`
Get all results within a date range.

```javascript
const results = await workoutState.getResultsByDateRange(
  '2025-01-01T00:00:00Z',
  '2025-01-31T23:59:59Z'
);
```

**Parameters**:
- `startDate` (string): ISO date string
- `endDate` (string): ISO date string

**Returns**: `Promise<Array>` - Array of result objects

#### `getCurrentWorkoutResults()`
Get all results for the current workout position.

```javascript
const results = await workoutState.getCurrentWorkoutResults();
```

**Returns**: `Promise<Array>` - Array of result objects

---

### Progress & Statistics

#### `getProgramProgress(programId)`
Get progress statistics for a program.

```javascript
const progress = await workoutState.getProgramProgress('beginner');
// {
//   totalWorkouts: 24,
//   completedExercises: 156,
//   totalSets: 468,
//   averageRating: 3.8
// }
```

**Parameters**:
- `programId` (string): Program identifier

**Returns**: `Promise<object>` - Statistics object

#### `getPersonalRecords(exerciseId)`
Get personal records for an exercise.

```javascript
const prs = await workoutState.getPersonalRecords('squat');
// { maxWeight: 225, maxReps: 12, maxVolume: 2340 }
```

**Parameters**:
- `exerciseId` (string): Exercise identifier

**Returns**: `Promise<object>` - Personal records object

#### `getStatistics()`
Get comprehensive statistics.

```javascript
const stats = await workoutState.getStatistics();
// {
//   storage: { ... },
//   workouts: { total, uniqueDays, totalSets, totalVolume },
//   currentPosition: { ... }
// }
```

**Returns**: `Promise<object>` - Comprehensive statistics

---

### Export/Import

#### `exportData()`
Export all data as JSON string.

```javascript
const backup = await workoutState.exportData();
```

**Returns**: `Promise<string>` - JSON string of all data

#### `importData(jsonString, merge)`
Import data from JSON string.

```javascript
await workoutState.importData(backup, false); // Replace
await workoutState.importData(backup, true);  // Merge
```

**Parameters**:
- `jsonString` (string): JSON string to import
- `merge` (boolean): If true, merge; if false, replace

**Returns**: `Promise<void>`

**Throws**: Error if JSON is invalid

---

### Event Handling

#### `subscribe(callback)`
Subscribe to state changes.

```javascript
const unsubscribe = workoutState.subscribe((event) => {
  console.log(event.type, event);
});

// Later...
unsubscribe();
```

**Parameters**:
- `callback` (function): Callback function receiving event object

**Returns**: `function` - Unsubscribe function

**Event Types**:
- `workout_data_loaded`: Workout data loaded
- `position_changed`: Position updated
- `result_saved`: Result saved
- `result_updated`: Result updated
- `result_deleted`: Result deleted
- `data_imported`: Data imported
- `data_cleared`: All data cleared

---

### Data Management

#### `clearAllData()`
Clear all workout data. **Use with caution!**

```javascript
await workoutState.clearAllData();
```

**Returns**: `Promise<void>`

---

## Storage Class

### Initialization

#### `init()`
Initialize storage system with automatic fallback.

```javascript
await storage.init();
```

**Returns**: `Promise<void>`

---

### Basic Operations

#### `get(store, key)`
Retrieve data from storage.

```javascript
const data = await storage.get(STORES.WORKOUTS, 'program_data');
```

**Parameters**:
- `store` (string): Store name (use `STORES` constants)
- `key` (string): Key to retrieve

**Returns**: `Promise<any>` - Data or null if not found

#### `set(store, key, value)`
Store data in storage.

```javascript
await storage.set(STORES.WORKOUTS, 'program_data', programData);
```

**Parameters**:
- `store` (string): Store name
- `key` (string): Key to store
- `value` (any): Value to store (must be JSON-serializable)

**Returns**: `Promise<void>`

#### `delete(store, key)`
Delete data from storage.

```javascript
await storage.delete(STORES.WORKOUTS, 'program_data');
```

**Parameters**:
- `store` (string): Store name
- `key` (string): Key to delete

**Returns**: `Promise<void>`

---

### Bulk Operations

#### `getAll(store)`
Get all items from a store.

```javascript
const allResults = await storage.getAll(STORES.RESULTS);
```

**Parameters**:
- `store` (string): Store name

**Returns**: `Promise<Array>` - Array of all items

#### `query(store, indexName, value)`
Query items by index value.

```javascript
const results = await storage.query(STORES.RESULTS, 'exerciseId', 'squat');
```

**Parameters**:
- `store` (string): Store name
- `indexName` (string): Index name ('date' or 'exerciseId' for RESULTS)
- `value` (any): Value to match

**Returns**: `Promise<Array>` - Matching items

#### `clear(store)`
Clear entire store.

```javascript
await storage.clear(STORES.RESULTS);
```

**Parameters**:
- `store` (string): Store name

**Returns**: `Promise<void>`

---

### Export/Import

#### `export()`
Export all storage data.

```javascript
const backup = await storage.export();
```

**Returns**: `Promise<string>` - JSON string

#### `import(jsonString, merge)`
Import storage data.

```javascript
await storage.import(backup, false);
```

**Parameters**:
- `jsonString` (string): JSON to import
- `merge` (boolean): Merge or replace

**Returns**: `Promise<void>`

---

### Statistics

#### `getStats()`
Get storage statistics.

```javascript
const stats = await storage.getStats();
// {
//   storageType: 'localStorage',
//   version: '1.0.0',
//   stores: {
//     workouts: { count: 1, size: 2048 },
//     results: { count: 156, size: 45678 }
//   }
// }
```

**Returns**: `Promise<object>` - Statistics object

---

## Constants

### STORES
Available store names:

```javascript
import { STORES } from './storage.js';

STORES.WORKOUTS   // 'workouts' - Workout program data
STORES.RESULTS    // 'results' - Workout results
STORES.PROGRESS   // 'progress' - Current position
STORES.METADATA   // 'metadata' - App metadata
```

---

## Data Structures

### Result Object
```typescript
{
  id: string,
  program: string,
  week: number,
  day: number,
  exerciseId: string,
  exerciseName: string,
  date: string, // ISO 8601
  sets: Array<{
    weight: number,
    reps: number,
    completed: boolean
  }>,
  notes?: string,
  duration?: number, // seconds
  rating?: number, // 1-5
  updatedAt?: string // ISO 8601
}
```

### Position Object
```typescript
{
  program: string,
  week: number,
  day: number,
  updatedAt: string // ISO 8601
}
```

### Statistics Object
```typescript
{
  storage: {
    storageType: 'localStorage' | 'indexedDB',
    version: string,
    stores: {
      [storeName]: {
        count: number,
        size: number
      }
    }
  },
  workouts: {
    total: number,
    uniqueDays: number,
    totalSets: number,
    totalVolume: number
  },
  currentPosition: {
    program: string | null,
    week: number | null,
    day: number | null
  }
}
```

---

## Error Handling

All async methods may throw errors. Always use try-catch:

```javascript
try {
  await workoutState.saveWorkoutResult(result);
} catch (error) {
  console.error('Failed to save result:', error);
  // Handle error appropriately
}
```

Common errors:
- `Invalid workout data`: Data validation failed
- `sets must be a non-empty array`: Invalid sets data
- `Result not found`: Attempted to update non-existent result
- `Failed to load workout data`: Network or file error
- `Insufficient localStorage space`: Storage quota exceeded
