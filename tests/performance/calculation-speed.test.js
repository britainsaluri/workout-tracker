/**
 * Performance Tests for Progressive Overload Calculations
 *
 * Ensures calculations complete within acceptable time limits
 * and don't block the UI.
 */

import { calculateWeightSuggestion } from '../../src/utils/progressiveOverload';
import { performance } from 'perf_hooks';

describe('Progressive Overload Performance Tests', () => {

  const generateSampleData = (sets = 2, weight = 145, reps = 20) => ({
    sets: Array(sets).fill(null).map(() => ({ weight, reps }))
  });

  test('PERF-001: Single Exercise Calculation Speed', () => {
    const week1Data = generateSampleData();
    const targetRange = { min: 18, max: 20, sets: 2 };

    const iterations = 100;
    const timings = [];

    for (let i = 0; i < iterations; i++) {
      const start = performance.now();
      calculateWeightSuggestion(week1Data, targetRange);
      const end = performance.now();
      timings.push(end - start);
    }

    const average = timings.reduce((a, b) => a + b, 0) / iterations;
    const max = Math.max(...timings);
    const p95 = timings.sort((a, b) => a - b)[Math.floor(iterations * 0.95)];

    console.log(`Performance Metrics:
      Average: ${average.toFixed(2)}ms
      Max: ${max.toFixed(2)}ms
      P95: ${p95.toFixed(2)}ms
    `);

    expect(average).toBeLessThan(10); // <10ms average
    expect(max).toBeLessThan(50);     // <50ms max
    expect(p95).toBeLessThan(20);     // <20ms 95th percentile
  });

  test('PERF-002: Bulk Calculation (39 Exercises)', () => {
    const exercises = Array(39).fill(null).map((_, i) => ({
      data: generateSampleData(),
      target: { min: 18, max: 20, sets: 2 }
    }));

    const start = performance.now();

    exercises.forEach(exercise => {
      calculateWeightSuggestion(exercise.data, exercise.target);
    });

    const end = performance.now();
    const duration = end - start;

    console.log(`Bulk calculation time: ${duration.toFixed(2)}ms`);

    expect(duration).toBeLessThan(100); // <100ms total
  });

  test('PERF-003: Parallel Calculation', async () => {
    const exercises = Array(39).fill(null).map((_, i) => ({
      data: generateSampleData(),
      target: { min: 18, max: 20, sets: 2 }
    }));

    const start = performance.now();

    await Promise.all(
      exercises.map(exercise =>
        Promise.resolve(calculateWeightSuggestion(exercise.data, exercise.target))
      )
    );

    const end = performance.now();
    const duration = end - start;

    console.log(`Parallel calculation time: ${duration.toFixed(2)}ms`);

    expect(duration).toBeLessThan(100); // Should be even faster
  });

  test('PERF-004: localStorage Read Performance', () => {
    const largeData = {
      week1: {
        exercises: Array(39).fill(null).map((_, i) => ({
          name: `Exercise ${i}`,
          sets: generateSampleData(2).sets
        }))
      }
    };

    localStorage.setItem('workoutData', JSON.stringify(largeData));

    const iterations = 100;
    const timings = [];

    for (let i = 0; i < iterations; i++) {
      const start = performance.now();
      const data = JSON.parse(localStorage.getItem('workoutData'));
      const end = performance.now();
      timings.push(end - start);
    }

    const average = timings.reduce((a, b) => a + b, 0) / iterations;

    console.log(`localStorage read average: ${average.toFixed(2)}ms`);

    expect(average).toBeLessThan(10); // <10ms average read
  });

  test('PERF-005: localStorage Write Performance', () => {
    const data = {
      week1: {
        exercises: Array(39).fill(null).map((_, i) => ({
          name: `Exercise ${i}`,
          sets: generateSampleData(2).sets
        }))
      }
    };

    const iterations = 100;
    const timings = [];

    for (let i = 0; i < iterations; i++) {
      const start = performance.now();
      localStorage.setItem('workoutData', JSON.stringify(data));
      const end = performance.now();
      timings.push(end - start);
    }

    const average = timings.reduce((a, b) => a + b, 0) / iterations;

    console.log(`localStorage write average: ${average.toFixed(2)}ms`);

    expect(average).toBeLessThan(20); // <20ms average write
  });

  test('PERF-006: Memory Usage', () => {
    const initialMemory = process.memoryUsage().heapUsed;

    // Calculate 39 suggestions
    const exercises = Array(39).fill(null).map(() => ({
      data: generateSampleData(),
      target: { min: 18, max: 20, sets: 2 }
    }));

    exercises.forEach(exercise => {
      calculateWeightSuggestion(exercise.data, exercise.target);
    });

    if (global.gc) {
      global.gc();
    }

    const finalMemory = process.memoryUsage().heapUsed;
    const memoryIncrease = (finalMemory - initialMemory) / (1024 * 1024); // MB

    console.log(`Memory increase: ${memoryIncrease.toFixed(2)}MB`);

    expect(memoryIncrease).toBeLessThan(5); // <5MB increase
  });

  test('PERF-007: CPU-Throttled Performance', () => {
    // Simulate CPU slowdown by adding computational work
    const cpuIntensiveWork = () => {
      let result = 0;
      for (let i = 0; i < 100000; i++) {
        result += Math.sqrt(i);
      }
      return result;
    };

    const week1Data = generateSampleData();
    const targetRange = { min: 18, max: 20, sets: 2 };

    const start = performance.now();

    cpuIntensiveWork(); // Simulate slow CPU
    calculateWeightSuggestion(week1Data, targetRange);

    const end = performance.now();
    const duration = end - start;

    console.log(`Throttled calculation time: ${duration.toFixed(2)}ms`);

    // Even with CPU load, should complete reasonably fast
    expect(duration).toBeLessThan(200);
  });
});
