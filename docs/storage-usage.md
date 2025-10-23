# Data Persistence System - Usage Guide

## Overview

The workout tracker uses a dual-layer storage system that provides robust, offline-first data persistence:

1. **Primary**: localStorage (fast, simple, ~5-10MB)
2. **Fallback**: IndexedDB (larger capacity, structured queries)

The system automatically selects the best option and handles migrations seamlessly.

## Quick Start

```javascript
import { workoutState } from './src/workout-state.js';

// Initialize the system
await workoutState.init();

// Load workout program data
await workoutState.loadWorkoutData({
  programs: [
    {
      id: 'beginner',
      name: 'Beginner Full Body',
      weeks: [/* ... */]
    }
  ]
});

// Set current position
await workoutState.setPosition('beginner', 0, 0);

// Save workout result
const resultId = await workoutState.saveWorkoutResult({
  exerciseId: 'bench-press',
  exerciseName: 'Bench Press',
  sets: [
    { weight: 135, reps: 10, completed: true },
    { weight: 135, reps: 9, completed: true },
    { weight: 135, reps: 8, completed: true }
  ],
  notes: 'Felt strong today',
  rating: 4
});
```

## Core Features

### 1. Position Tracking

Track where the user is in their program:

```javascript
// Set position
await workoutState.setPosition('beginner', 1, 2);
// Program: beginner, Week: 1, Day: 2

// Get position
const position = workoutState.getPosition();
console.log(position);
// { program: 'beginner', week: 1, day: 2 }

// Get current workout data
const workout = workoutState.getCurrentWorkout();
console.log(workout.name); // "Upper Body"
console.log(workout.exercises); // [{ id: 'ex1', name: 'Bench Press', ... }]
```

### 2. Saving Workout Results

Save detailed workout performance:

```javascript
const result = {
  exerciseId: 'squat',
  exerciseName: 'Barbell Squat',
  sets: [
    { weight: 185, reps: 10, completed: true },
    { weight: 185, reps: 10, completed: true },
    { weight: 185, reps: 9, completed: true },
    { weight: 185, reps: 8, completed: false } // Didn't complete
  ],
  notes: 'Form felt good, last set was tough',
  rating: 4, // Difficulty rating 1-5
  duration: 1800 // 30 minutes in seconds
};

const resultId = await workoutState.saveWorkoutResult(result);
```

### 3. Historical Data Retrieval

Query past performance:

```javascript
// Get all results for an exercise
const history = await workoutState.getExerciseHistory('squat');
console.log(history.length); // 12 workouts

// Limit results
const recent = await workoutState.getExerciseHistory('squat', { limit: 5 });

// Get results for date range
const results = await workoutState.getResultsByDateRange(
  '2025-01-01T00:00:00Z',
  '2025-01-31T23:59:59Z'
);

// Get results for current workout
const todayResults = await workoutState.getCurrentWorkoutResults();
```

### 4. Progress Tracking

Track progress and personal records:

```javascript
// Get program statistics
const progress = await workoutState.getProgramProgress('beginner');
console.log(progress);
// {
//   totalWorkouts: 24,
//   completedExercises: 156,
//   totalSets: 468,
//   averageRating: 3.8
// }

// Get personal records
const prs = await workoutState.getPersonalRecords('squat');
console.log(prs);
// {
//   maxWeight: 225,
//   maxReps: 12,
//   maxVolume: 2340 // weight × reps
// }
```

### 5. Export/Backup

Backup and restore data:

```javascript
// Export all data as JSON
const backup = await workoutState.exportData();
localStorage.setItem('workout_backup', backup);

// Or download as file
const blob = new Blob([backup], { type: 'application/json' });
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = `workout-backup-${new Date().toISOString()}.json`;
a.click();

// Import/restore data
const backupData = localStorage.getItem('workout_backup');
await workoutState.importData(backupData, false); // false = replace existing

// Merge with existing data
await workoutState.importData(backupData, true); // true = merge
```

### 6. Real-time Updates

Subscribe to state changes:

```javascript
// Subscribe to all state changes
const unsubscribe = workoutState.subscribe((event) => {
  console.log('State changed:', event.type);

  switch (event.type) {
    case 'workout_data_loaded':
      console.log('Workout data loaded:', event.data);
      break;
    case 'position_changed':
      console.log('Position:', event.program, event.week, event.day);
      break;
    case 'result_saved':
      console.log('Result saved:', event.result);
      break;
    case 'result_updated':
      console.log('Result updated:', event.result);
      break;
    case 'result_deleted':
      console.log('Result deleted:', event.resultId);
      break;
  }
});

// Unsubscribe when done
unsubscribe();
```

## Advanced Usage

### Direct Storage Access

For advanced use cases, access the storage layer directly:

```javascript
import { storage, STORES } from './src/storage.js';

await storage.init();

// Store custom data
await storage.set(STORES.METADATA, 'user_preferences', {
  units: 'lbs',
  theme: 'dark',
  notifications: true
});

// Retrieve custom data
const prefs = await storage.get(STORES.METADATA, 'user_preferences');

// Query with indexes (IndexedDB only, filters for localStorage)
const results = await storage.query(STORES.RESULTS, 'date', '2025-01-15');

// Get all items from a store
const allResults = await storage.getAll(STORES.RESULTS);

// Storage statistics
const stats = await storage.getStats();
console.log(stats);
// {
//   storageType: 'localStorage',
//   version: '1.0.0',
//   stores: {
//     workouts: { count: 1, size: 2048 },
//     results: { count: 156, size: 45678 },
//     progress: { count: 1, size: 128 },
//     metadata: { count: 2, size: 256 }
//   }
// }
```

### Error Handling

```javascript
try {
  await workoutState.saveWorkoutResult(result);
} catch (error) {
  if (error.message.includes('sets must be')) {
    console.error('Invalid sets data');
  } else if (error.message.includes('quota exceeded')) {
    console.error('Storage full, consider exporting old data');
  } else {
    console.error('Unexpected error:', error);
  }
}
```

### Updating Results

```javascript
// Update existing result
await workoutState.updateWorkoutResult(resultId, {
  notes: 'Updated notes after review',
  rating: 5
});

// Delete result
await workoutState.deleteWorkoutResult(resultId);
```

### Statistics Dashboard

```javascript
// Get comprehensive statistics
const stats = await workoutState.getStatistics();
console.log(stats);
// {
//   storage: { storageType: 'localStorage', ... },
//   workouts: {
//     total: 156,
//     uniqueDays: 52,
//     totalSets: 468,
//     totalVolume: 125340 // Total weight × reps
//   },
//   currentPosition: { program: 'beginner', week: 8, day: 2 }
// }
```

## Data Structure

### Workout Result Object

```javascript
{
  id: 'result_1234567890_abc123',
  program: 'beginner',
  week: 0,
  day: 0,
  exerciseId: 'bench-press',
  exerciseName: 'Bench Press',
  date: '2025-01-15T10:30:00Z',
  sets: [
    {
      weight: 135,      // Weight in lbs or kg
      reps: 10,         // Number of reps completed
      completed: true   // Whether the set was completed
    }
  ],
  notes: 'Optional notes about the workout',
  duration: 1800,     // Duration in seconds
  rating: 4           // Difficulty rating 1-5
}
```

### Workout Program Data

```javascript
{
  programs: [
    {
      id: 'beginner',
      name: 'Beginner Full Body',
      description: 'A full body program for beginners',
      weeks: [
        {
          weekNumber: 1,
          days: [
            {
              dayNumber: 1,
              name: 'Upper Body',
              exercises: [
                {
                  id: 'bench-press',
                  name: 'Bench Press',
                  sets: 3,
                  reps: 10,
                  restSeconds: 90,
                  notes: 'Optional exercise notes'
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}
```

## Offline Support

The system is designed to work completely offline:

1. All data is stored locally on the device
2. No network connection required for normal operation
3. Data persists across app restarts and phone restarts
4. Export/import allows manual backup to cloud storage

## Storage Limits

- **localStorage**: ~5-10MB (varies by browser)
- **IndexedDB**: ~50MB+ (varies by browser and available disk space)

The system automatically switches to IndexedDB if localStorage is full.

## Best Practices

1. **Regular Backups**: Export data weekly or monthly
2. **Clean Old Data**: Delete old workout results if storage is full
3. **Test Imports**: Always test backup imports in a test environment
4. **Error Handling**: Always wrap storage operations in try-catch blocks
5. **State Subscription**: Use subscriptions for UI updates instead of polling

## Migration Notes

When updating the app version:

1. The storage system includes version metadata
2. Future updates can include migration logic
3. Always test with real user data before deploying

## Troubleshooting

### Storage Full

```javascript
const stats = await storage.getStats();
const totalSize = Object.values(stats.stores)
  .reduce((sum, store) => sum + store.size, 0);

if (totalSize > 4500000) { // ~4.5MB
  console.warn('Storage nearly full, consider cleanup');
}
```

### Data Corruption

```javascript
try {
  await workoutState.init();
} catch (error) {
  console.error('Storage initialization failed:', error);
  // Option 1: Clear and start fresh
  await workoutState.clearAllData();

  // Option 2: Try to import from backup
  const backup = localStorage.getItem('last_backup');
  if (backup) {
    await workoutState.importData(backup, false);
  }
}
```

### Testing Storage Type

```javascript
import { storage } from './src/storage.js';

await storage.init();
console.log('Using:', storage.storageType);
// 'localStorage' or 'indexedDB'
```

## React/Vue Integration

Example with React hooks:

```javascript
import { useEffect, useState } from 'react';
import { workoutState } from './workout-state';

function useWorkoutState() {
  const [position, setPosition] = useState(null);
  const [workout, setWorkout] = useState(null);

  useEffect(() => {
    workoutState.init().then(() => {
      setPosition(workoutState.getPosition());
      setWorkout(workoutState.getCurrentWorkout());
    });

    const unsubscribe = workoutState.subscribe((event) => {
      if (event.type === 'position_changed') {
        setPosition(workoutState.getPosition());
        setWorkout(workoutState.getCurrentWorkout());
      }
    });

    return unsubscribe;
  }, []);

  return { position, workout };
}
```
