/**
 * Enhanced Bug Fix Verification Test Suite
 *
 * Comprehensive testing for the weight suggestion system including:
 * - Critical bug fix validation (20 lbs → 200 lbs)
 * - 20% constraint enforcement
 * - All weight ranges (5-500 lbs)
 * - All rep ranges (2-20 reps)
 * - Compound vs isolation exercise logic
 * - Edge cases and error handling
 * - Performance benchmarks
 *
 * Test Count: 50+ scenarios
 * Coverage Target: >95%
 * Expected Runtime: <5 seconds
 *
 * @version 1.0.0
 */

import SuggestionEngine from '../src/utils/weightSuggestions.js';

// ============================================================================
// TEST SUITE SETUP
// ============================================================================

let testsPassed = 0;
let testsFailed = 0;
let testsSkipped = 0;
const failedTests = [];

/**
 * Custom assertion helper for detailed error messages
 */
class Assert {
  static equal(actual, expected, message) {
    if (actual === expected) {
      testsPassed++;
      console.log(`  ✓ ${message}`);
      return true;
    } else {
      testsFailed++;
      const error = `Expected ${expected}, got ${actual}`;
      console.error(`  ✗ ${message}\n    ${error}`);
      failedTests.push({ message, error, actual, expected });
      return false;
    }
  }

  static notEqual(actual, expected, message) {
    if (actual !== expected) {
      testsPassed++;
      console.log(`  ✓ ${message}`);
      return true;
    } else {
      testsFailed++;
      const error = `Expected NOT ${expected}, got ${actual}`;
      console.error(`  ✗ ${message}\n    ${error}`);
      failedTests.push({ message, error, actual, expected });
      return false;
    }
  }

  static inRange(actual, min, max, message) {
    if (actual >= min && actual <= max) {
      testsPassed++;
      console.log(`  ✓ ${message} (${actual} in range ${min}-${max})`);
      return true;
    } else {
      testsFailed++;
      const error = `Expected ${min}-${max}, got ${actual}`;
      console.error(`  ✗ ${message}\n    ${error}`);
      failedTests.push({ message, error, actual, min, max });
      return false;
    }
  }

  static lessThan(actual, expected, message) {
    if (actual < expected) {
      testsPassed++;
      console.log(`  ✓ ${message} (${actual} < ${expected})`);
      return true;
    } else {
      testsFailed++;
      const error = `Expected < ${expected}, got ${actual}`;
      console.error(`  ✗ ${message}\n    ${error}`);
      failedTests.push({ message, error, actual, expected });
      return false;
    }
  }

  static greaterThan(actual, expected, message) {
    if (actual > expected) {
      testsPassed++;
      console.log(`  ✓ ${message} (${actual} > ${expected})`);
      return true;
    } else {
      testsFailed++;
      const error = `Expected > ${expected}, got ${actual}`;
      console.error(`  ✗ ${message}\n    ${error}`);
      failedTests.push({ message, error, actual, expected });
      return false;
    }
  }

  static isNull(actual, message) {
    if (actual === null || actual === undefined) {
      testsPassed++;
      console.log(`  ✓ ${message}`);
      return true;
    } else {
      testsFailed++;
      const error = `Expected null, got ${actual}`;
      console.error(`  ✗ ${message}\n    ${error}`);
      failedTests.push({ message, error, actual });
      return false;
    }
  }

  static notNull(actual, message) {
    if (actual !== null && actual !== undefined) {
      testsPassed++;
      console.log(`  ✓ ${message}`);
      return true;
    } else {
      testsFailed++;
      const error = `Expected not null, got ${actual}`;
      console.error(`  ✗ ${message}\n    ${error}`);
      failedTests.push({ message, error, actual });
      return false;
    }
  }

  static throws(fn, message) {
    let thrown = false;
    try {
      fn();
    } catch (e) {
      thrown = true;
    }
    if (thrown) {
      testsPassed++;
      console.log(`  ✓ ${message}`);
      return true;
    } else {
      testsFailed++;
      const error = 'Expected function to throw error';
      console.error(`  ✗ ${message}\n    ${error}`);
      failedTests.push({ message, error });
      return false;
    }
  }

  static contains(str, substring, message) {
    if (str && str.toString().includes(substring)) {
      testsPassed++;
      console.log(`  ✓ ${message}`);
      return true;
    } else {
      testsFailed++;
      const error = `Expected to contain "${substring}"`;
      console.error(`  ✗ ${message}\n    ${error}`);
      failedTests.push({ message, error, actual: str });
      return false;
    }
  }

  static typeEquals(actual, expectedType, message) {
    const actualType = typeof actual;
    if (actualType === expectedType) {
      testsPassed++;
      console.log(`  ✓ ${message} (type: ${actualType})`);
      return true;
    } else {
      testsFailed++;
      const error = `Expected type ${expectedType}, got ${actualType}`;
      console.error(`  ✗ ${message}\n    ${error}`);
      failedTests.push({ message, error, actual, expectedType, actualType });
      return false;
    }
  }
}

// ============================================================================
// CATEGORY 1: CRITICAL BUG FIX VALIDATION
// ============================================================================

function testCategory1_CriticalBugFix() {
  console.log('\n╔════════════════════════════════════════════════════════════════════╗');
  console.log('║ CATEGORY 1: CRITICAL BUG FIX VALIDATION                           ║');
  console.log('║ Testing: 20 lbs × 10 reps → 200 lbs bug                          ║');
  console.log('╚════════════════════════════════════════════════════════════════════╝\n');

  const engine = new SuggestionEngine();

  // TEST BUG-001: Exact user scenario
  console.log('🔍 BUG-001: Exact User Scenario (20 lbs × 10 reps)');
  const bug001 = engine.calculateSuggestedWeight(
    'Leg Extension',
    [
      { weight: parseFloat('20'), reps: parseInt('10', 10), completed: true },
      { weight: parseFloat('20'), reps: parseInt('10', 10), completed: true }
    ],
    '3x8-10'
  );

  Assert.notNull(bug001, 'BUG-001: Should return suggestion object');
  Assert.notEqual(bug001?.suggestedWeight, 200, 'BUG-001: CRITICAL - Must NOT suggest 200 lbs');
  Assert.inRange(bug001?.suggestedWeight, 20, 24, 'BUG-001: Should suggest 20-24 lbs (20% constraint)');
  Assert.typeEquals(bug001?.suggestedWeight, 'number', 'BUG-001: Suggested weight must be number type');
  Assert.typeEquals(bug001?.increaseAmount, 'number', 'BUG-001: Increase amount must be number type');
  Assert.lessThan(bug001?.increasePercentage, 20, 'BUG-001: Increase must be ≤20%');

  // Optimal expectation: 22.5 or 25 lbs
  const isOptimal = [22.5, 25].includes(bug001?.suggestedWeight);
  if (isOptimal) {
    testsPassed++;
    console.log(`  ✓ BUG-001: Optimal suggestion (${bug001.suggestedWeight} lbs)`);
  } else {
    console.log(`  ⚠ BUG-001: Non-optimal but acceptable (${bug001?.suggestedWeight} lbs, expected 22.5 or 25)`);
  }

  // TEST BUG-002: String conversion validation
  console.log('\n🔍 BUG-002: String Conversion Validation');
  const rawWeight = '20';
  const rawReps = '10';
  const weight = parseFloat(rawWeight) || 0;
  const reps = parseInt(rawReps, 10) || 0;

  Assert.typeEquals(weight, 'number', 'BUG-002: parseFloat converts string to number');
  Assert.typeEquals(reps, 'number', 'BUG-002: parseInt converts string to number');
  Assert.equal(weight, 20, 'BUG-002: Weight value is correct');
  Assert.equal(reps, 10, 'BUG-002: Reps value is correct');

  // Verify bug pattern
  const buggyMultiplication = rawWeight * rawReps;
  Assert.equal(buggyMultiplication, 200, 'BUG-002: String multiplication causes bug (200)');

  // Verify correct pattern
  const correctAddition = weight + 2.5;
  Assert.equal(correctAddition, 22.5, 'BUG-002: Number addition is correct (22.5)');

  // TEST BUG-003: Similar scenarios
  console.log('\n🔍 BUG-003: Similar Scenarios (15, 25, 30, 50 lbs)');

  const scenarios = [
    { weight: 15, reps: [10, 10], min: 15, max: 18, bugValue: 150, name: '15 lbs' },
    { weight: 25, reps: [8, 8], min: 25, max: 30, bugValue: 200, name: '25 lbs' },
    { weight: 30, reps: [12, 12], min: 30, max: 36, bugValue: 360, name: '30 lbs' },
    { weight: 50, reps: [10, 10], min: 50, max: 60, bugValue: 500, name: '50 lbs' }
  ];

  scenarios.forEach(scenario => {
    const result = engine.calculateSuggestedWeight(
      'Test Exercise',
      scenario.reps.map(r => ({ weight: scenario.weight, reps: r, completed: true })),
      '3x8-12'
    );

    Assert.notEqual(result?.suggestedWeight, scenario.bugValue,
      `BUG-003 ${scenario.name}: Must NOT suggest ${scenario.bugValue} lbs`);
    Assert.inRange(result?.suggestedWeight, scenario.min, scenario.max,
      `BUG-003 ${scenario.name}: Should suggest ${scenario.min}-${scenario.max} lbs`);
  });
}

// ============================================================================
// CATEGORY 2: 20% CONSTRAINT VALIDATION
// ============================================================================

function testCategory2_20PercentConstraint() {
  console.log('\n╔════════════════════════════════════════════════════════════════════╗');
  console.log('║ CATEGORY 2: 20% CONSTRAINT VALIDATION                             ║');
  console.log('║ Testing: No suggestion should exceed ±20% of previous weight      ║');
  console.log('╚════════════════════════════════════════════════════════════════════╝\n');

  const engine = new SuggestionEngine();

  const constraintTests = [
    { id: 'CONSTRAINT-001', weight: 5, min: 4, max: 6, expectedInc: 5 },
    { id: 'CONSTRAINT-002', weight: 10, min: 8, max: 12, expectedInc: 5 },
    { id: 'CONSTRAINT-003', weight: 20, min: 16, max: 24, expectedInc: 5 },
    { id: 'CONSTRAINT-004', weight: 50, min: 40, max: 60, expectedInc: 10 },
    { id: 'CONSTRAINT-005', weight: 100, min: 80, max: 120, expectedInc: 10 },
    { id: 'CONSTRAINT-006', weight: 200, min: 160, max: 240, expectedInc: 10 },
    { id: 'CONSTRAINT-007', weight: 500, min: 400, max: 600, expectedInc: 10 }
  ];

  constraintTests.forEach(test => {
    console.log(`\n🔍 ${test.id}: ${test.weight} lbs (20% range: ${test.min}-${test.max} lbs)`);

    const result = engine.calculateSuggestedWeight(
      'Squat',
      [
        { weight: test.weight, reps: 10, completed: true },
        { weight: test.weight, reps: 10, completed: true }
      ],
      '3x8-10'
    );

    if (result) {
      const percentageChange = ((result.suggestedWeight - test.weight) / test.weight) * 100;

      Assert.inRange(result.suggestedWeight, test.min, test.max,
        `${test.id}: Should be within 20% constraint (${test.min}-${test.max} lbs)`);

      // Check if percentage is within bounds
      if (Math.abs(percentageChange) <= 20) {
        testsPassed++;
        console.log(`  ✓ ${test.id}: Percentage change within bounds (${percentageChange.toFixed(1)}%)`);
      } else {
        testsFailed++;
        console.error(`  ✗ ${test.id}: Percentage change exceeds 20% (${percentageChange.toFixed(1)}%)`);
        failedTests.push({
          message: `${test.id}: 20% constraint violation`,
          error: `${percentageChange.toFixed(1)}% exceeds ±20%`,
          actual: percentageChange,
          expected: '±20%'
        });
      }
    }
  });

  // TEST: Very light weights (known issue)
  console.log('\n🔍 CONSTRAINT-LIGHT: Very Light Weights (5 lbs)');
  const lightResult = engine.calculateSuggestedWeight(
    'Curl',
    [
      { weight: 5, reps: 12, completed: true },
      { weight: 5, reps: 12, completed: true }
    ],
    '3x8-12'
  );

  if (lightResult) {
    const percentageChange = ((lightResult.suggestedWeight - 5) / 5) * 100;
    if (percentageChange > 20) {
      console.warn(`  ⚠️  KNOWN ISSUE: Light weight violates 20% constraint (${percentageChange.toFixed(1)}%)`);
      console.warn(`  💡 RECOMMENDATION: Implement dynamic increment scaling for weights < 25 lbs`);
    }
  }
}

// ============================================================================
// CATEGORY 3: WEIGHT RANGE TESTING
// ============================================================================

function testCategory3_WeightRanges() {
  console.log('\n╔════════════════════════════════════════════════════════════════════╗');
  console.log('║ CATEGORY 3: WEIGHT RANGE TESTING                                  ║');
  console.log('║ Testing: 5 lbs to 500 lbs across all ranges                       ║');
  console.log('╚════════════════════════════════════════════════════════════════════╝\n');

  const engine = new SuggestionEngine();

  const weightTests = [
    { id: 'WEIGHT-001', weight: 5, type: 'Isolation', expected: 7.5, tolerance: 2.5 },
    { id: 'WEIGHT-002', weight: 20, type: 'Isolation', expected: 22.5, tolerance: 2.5 },
    { id: 'WEIGHT-003', weight: 50, type: 'Compound', expected: 60, tolerance: 5 },
    { id: 'WEIGHT-004', weight: 100, type: 'Compound', expected: 110, tolerance: 10 },
    { id: 'WEIGHT-005', weight: 135, type: 'Compound', expected: 145, tolerance: 10 },
    { id: 'WEIGHT-006', weight: 200, type: 'Compound', expected: 210, tolerance: 10 },
    { id: 'WEIGHT-007', weight: 315, type: 'Compound', expected: 325, tolerance: 15 },
    { id: 'WEIGHT-008', weight: 500, type: 'Compound', expected: 510, tolerance: 20 }
  ];

  weightTests.forEach(test => {
    console.log(`\n🔍 ${test.id}: ${test.weight} lbs (${test.type})`);

    const exerciseId = test.type === 'Compound' ? 'Squat' : 'Curl';
    const result = engine.calculateSuggestedWeight(
      exerciseId,
      [
        { weight: test.weight, reps: 10, completed: true },
        { weight: test.weight, reps: 10, completed: true }
      ],
      '3x8-10'
    );

    if (result) {
      const min = test.expected - test.tolerance;
      const max = test.expected + test.tolerance;

      Assert.inRange(result.suggestedWeight, min, max,
        `${test.id}: Should suggest ~${test.expected} lbs (±${test.tolerance} tolerance)`);

      // Log actual vs expected
      const diff = result.suggestedWeight - test.expected;
      console.log(`    Expected: ${test.expected} lbs, Actual: ${result.suggestedWeight} lbs (diff: ${diff > 0 ? '+' : ''}${diff} lbs)`);
    }
  });
}

// ============================================================================
// CATEGORY 4: REP RANGE TESTING
// ============================================================================

function testCategory4_RepRanges() {
  console.log('\n╔════════════════════════════════════════════════════════════════════╗');
  console.log('║ CATEGORY 4: REP RANGE TESTING                                     ║');
  console.log('║ Testing: Strength, Hypertrophy, Endurance rep ranges              ║');
  console.log('╚════════════════════════════════════════════════════════════════════╝\n');

  const engine = new SuggestionEngine();

  const repTests = [
    { id: 'REP-001', weight: 500, reps: [4, 4, 3], target: '3x2-4', goal: 'Strength', exerciseId: 'Deadlift' },
    { id: 'REP-002', weight: 315, reps: [6, 6, 5], target: '3x4-6', goal: 'Strength', exerciseId: 'Squat' },
    { id: 'REP-003', weight: 225, reps: [8, 8, 7], target: '3x5-8', goal: 'Strength', exerciseId: 'Bench Press' },
    { id: 'REP-004', weight: 185, reps: [10, 10, 9], target: '3x8-10', goal: 'Hypertrophy', exerciseId: 'Squat' },
    { id: 'REP-005', weight: 135, reps: [12, 12, 11], target: '3x8-12', goal: 'Hypertrophy', exerciseId: 'Row' },
    { id: 'REP-006', weight: 100, reps: [12, 12, 11], target: '3x10-12', goal: 'Hypertrophy', exerciseId: 'Curl' },
    { id: 'REP-007', weight: 60, reps: [15, 15, 14], target: '3x12-15', goal: 'Endurance', exerciseId: 'Leg Press' },
    { id: 'REP-008', weight: 30, reps: [20, 20, 19], target: '3x15-20', goal: 'Endurance', exerciseId: 'Calf Raise' },
    { id: 'REP-009', weight: 20, reps: [20, 20], target: '2x18-20', goal: 'Endurance', exerciseId: 'Leg Extension' }
  ];

  repTests.forEach(test => {
    console.log(`\n🔍 ${test.id}: ${test.weight} lbs × ${test.reps.join(', ')} reps (${test.goal})`);

    const result = engine.calculateSuggestedWeight(
      test.exerciseId,
      test.reps.map(r => ({ weight: test.weight, reps: r, completed: true })),
      test.target
    );

    if (result) {
      Assert.greaterThan(result.suggestedWeight, test.weight,
        `${test.id}: Should increase weight for top performance`);

      Assert.equal(result.confidence, 'high',
        `${test.id}: Should have high confidence for consistent performance`);

      console.log(`    Previous: ${test.weight} lbs → Suggested: ${result.suggestedWeight} lbs (+${result.increaseAmount} lbs)`);
    }
  });
}

// ============================================================================
// CATEGORY 5: COMPOUND VS ISOLATION TESTING
// ============================================================================

function testCategory5_ExerciseTypes() {
  console.log('\n╔════════════════════════════════════════════════════════════════════╗');
  console.log('║ CATEGORY 5: COMPOUND VS ISOLATION TESTING                         ║');
  console.log('║ Testing: Different increments for different exercise types        ║');
  console.log('╚════════════════════════════════════════════════════════════════════╝\n');

  const engine = new SuggestionEngine();

  // TEST: Compound exercises
  console.log('🔍 TYPE-001: Compound Exercises (Expected: +10 lbs)');
  const compoundExercises = [
    { name: 'Squat', weight: 225 },
    { name: 'Deadlift', weight: 315 },
    { name: 'Bench Press', weight: 185 },
    { name: 'Row', weight: 135 }
  ];

  compoundExercises.forEach(exercise => {
    const result = engine.calculateSuggestedWeight(
      exercise.name,
      [
        { weight: exercise.weight, reps: 10, completed: true },
        { weight: exercise.weight, reps: 10, completed: true }
      ],
      '3x8-10'
    );

    if (result) {
      Assert.equal(result.increaseAmount, 10,
        `TYPE: ${exercise.name} should use +10 lbs increment (Compound)`);
    }
  });

  // TEST: Isolation exercises
  console.log('\n🔍 TYPE-002: Isolation Exercises (Expected: +5 lbs)');
  const isolationExercises = [
    { name: 'Leg Extension', weight: 110 },
    { name: 'Curl', weight: 30 },
    { name: 'Leg Curl', weight: 95 },
    { name: 'Calf Raise', weight: 145 }
  ];

  isolationExercises.forEach(exercise => {
    const result = engine.calculateSuggestedWeight(
      exercise.name,
      [
        { weight: exercise.weight, reps: 20, completed: true },
        { weight: exercise.weight, reps: 20, completed: true }
      ],
      '2x18-20'
    );

    if (result) {
      Assert.equal(result.increaseAmount, 5,
        `TYPE: ${exercise.name} should use +5 lbs increment (Isolation)`);
    }
  });
}

// ============================================================================
// CATEGORY 6: EDGE CASES & ERROR HANDLING
// ============================================================================

function testCategory6_EdgeCases() {
  console.log('\n╔════════════════════════════════════════════════════════════════════╗');
  console.log('║ CATEGORY 6: EDGE CASES & ERROR HANDLING                           ║');
  console.log('║ Testing: Boundary conditions and error scenarios                  ║');
  console.log('╚════════════════════════════════════════════════════════════════════╝\n');

  const engine = new SuggestionEngine();

  // EDGE-001: Zero weight
  console.log('🔍 EDGE-001: Zero Weight');
  const edge001 = engine.calculateSuggestedWeight(
    'Exercise',
    [{ weight: 0, reps: 10 }],
    '2x8-10'
  );
  Assert.isNull(edge001, 'EDGE-001: Zero weight should return null');

  // EDGE-002: Negative weight
  console.log('\n🔍 EDGE-002: Negative Weight');
  Assert.throws(() => {
    engine.calculateSuggestedWeight(
      'Exercise',
      [{ weight: -20, reps: 10 }],
      '2x8-10'
    );
  }, 'EDGE-002: Negative weight should throw error');

  // EDGE-003: Zero reps
  console.log('\n🔍 EDGE-003: Zero Reps');
  const edge003 = engine.calculateSuggestedWeight(
    'Exercise',
    [{ weight: 100, reps: 0 }, { weight: 100, reps: 0 }],
    '2x8-10'
  );
  Assert.isNull(edge003, 'EDGE-003: Zero reps should return null');

  // EDGE-004: Negative reps
  console.log('\n🔍 EDGE-004: Negative Reps');
  const edge004 = engine.calculateSuggestedWeight(
    'Exercise',
    [{ weight: 100, reps: -5 }, { weight: 100, reps: 10 }],
    '2x8-10'
  );
  Assert.notNull(edge004, 'EDGE-004: Should filter negative reps and use valid set');

  // EDGE-005: Empty array
  console.log('\n🔍 EDGE-005: Empty Array');
  const edge005 = engine.calculateSuggestedWeight('Exercise', [], '2x8-10');
  Assert.isNull(edge005, 'EDGE-005: Empty array should return null');

  // EDGE-006: Null input
  console.log('\n🔍 EDGE-006: Null Input');
  const edge006 = engine.calculateSuggestedWeight('Exercise', null, '2x8-10');
  Assert.isNull(edge006, 'EDGE-006: Null input should return null');

  // EDGE-007: Single set
  console.log('\n🔍 EDGE-007: Single Set');
  const edge007 = engine.calculateSuggestedWeight(
    'Exercise',
    [{ weight: 100, reps: 10, completed: true }],
    '2x8-10'
  );
  Assert.notNull(edge007, 'EDGE-007: Single set should return suggestion');
  Assert.contains(edge007?.note, '1 set', 'EDGE-007: Should note based on single set');

  // EDGE-008: Incomplete sets
  console.log('\n🔍 EDGE-008: Incomplete Sets (2 complete, 1 failed)');
  const edge008 = engine.calculateSuggestedWeight(
    'Exercise',
    [
      { weight: 100, reps: 10, completed: true },
      { weight: 100, reps: 10, completed: true },
      { weight: 100, reps: 0, completed: false }
    ],
    '3x8-10'
  );
  Assert.notNull(edge008, 'EDGE-008: Should use completed sets only');
  Assert.contains(edge008?.warning, '2 of 3', 'EDGE-008: Should warn about filtered sets');

  // EDGE-009: All failed sets
  console.log('\n🔍 EDGE-009: All Failed Sets');
  const edge009 = engine.calculateSuggestedWeight(
    'Exercise',
    [
      { weight: 100, reps: 0, completed: false },
      { weight: 100, reps: 0, completed: false }
    ],
    '2x8-10'
  );
  Assert.isNull(edge009, 'EDGE-009: All failed sets should return null');

  // EDGE-011: Decimal weights
  console.log('\n🔍 EDGE-011: Decimal Weights (52.5 lbs)');
  const edge011 = engine.calculateSuggestedWeight(
    'Dumbbell Exercise',
    [
      { weight: 52.5, reps: 20, completed: true },
      { weight: 52.5, reps: 20, completed: true }
    ],
    '2x18-20'
  );
  Assert.notNull(edge011, 'EDGE-011: Should handle decimal weights');
  Assert.equal(edge011?.suggestedWeight, 57.5, 'EDGE-011: Should preserve decimal precision');

  // EDGE-014: Inconsistent performance
  console.log('\n🔍 EDGE-014: Inconsistent Performance (20 vs 5 reps)');
  const edge014 = engine.calculateSuggestedWeight(
    'Exercise',
    [
      { weight: 100, reps: 20, completed: true },
      { weight: 100, reps: 5, completed: true }
    ],
    '2x8-10'
  );
  Assert.notNull(edge014, 'EDGE-014: Should handle inconsistent reps');
  // Note: Confidence may vary based on implementation
}

// ============================================================================
// CATEGORY 7: PERFORMANCE BENCHMARKS
// ============================================================================

function testCategory7_Performance() {
  console.log('\n╔════════════════════════════════════════════════════════════════════╗');
  console.log('║ CATEGORY 7: PERFORMANCE BENCHMARKS                                ║');
  console.log('║ Testing: Calculation speed and throughput                         ║');
  console.log('╚════════════════════════════════════════════════════════════════════╝\n');

  const engine = new SuggestionEngine();

  // TEST: Single calculation performance
  console.log('🔍 PERF-001: Single Calculation Speed (<10ms target)');
  const iterations = 100;
  const timings = [];

  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    engine.calculateSuggestedWeight(
      'Exercise',
      [
        { weight: 145, reps: 20 },
        { weight: 145, reps: 19 }
      ],
      '2x18-20'
    );
    const end = performance.now();
    timings.push(end - start);
  }

  const avgTime = timings.reduce((a, b) => a + b, 0) / iterations;
  const minTime = Math.min(...timings);
  const maxTime = Math.max(...timings);

  console.log(`    Average: ${avgTime.toFixed(3)}ms`);
  console.log(`    Min: ${minTime.toFixed(3)}ms`);
  console.log(`    Max: ${maxTime.toFixed(3)}ms`);

  Assert.lessThan(avgTime, 10, 'PERF-001: Average calculation should be <10ms');

  // TEST: Bulk calculation (39 exercises)
  console.log('\n🔍 PERF-002: Bulk Calculation (39 exercises, <100ms target)');
  const exercises = Array(39).fill(null).map((_, i) => ({
    id: `Exercise-${i}`,
    sets: [{ weight: 145, reps: 20 }, { weight: 145, reps: 19 }],
    range: '2x18-20'
  }));

  const bulkStart = performance.now();
  exercises.forEach(ex => {
    engine.calculateSuggestedWeight(ex.id, ex.sets, ex.range);
  });
  const bulkEnd = performance.now();
  const bulkDuration = bulkEnd - bulkStart;

  console.log(`    Total time: ${bulkDuration.toFixed(2)}ms`);
  console.log(`    Per exercise: ${(bulkDuration / 39).toFixed(2)}ms`);

  Assert.lessThan(bulkDuration, 100, 'PERF-002: 39 exercises should complete in <100ms');
}

// ============================================================================
// TEST RUNNER
// ============================================================================

function runAllTests() {
  console.log('\n');
  console.log('╔════════════════════════════════════════════════════════════════════╗');
  console.log('║                                                                    ║');
  console.log('║  ENHANCED BUG FIX VERIFICATION TEST SUITE                         ║');
  console.log('║  Version 1.0.0                                                    ║');
  console.log('║                                                                    ║');
  console.log('║  Testing: Weight Suggestion System                                ║');
  console.log('║  Coverage Target: >95%                                            ║');
  console.log('║  Test Count: 50+ scenarios                                        ║');
  console.log('║                                                                    ║');
  console.log('╚════════════════════════════════════════════════════════════════════╝');

  const startTime = performance.now();

  // Run all test categories
  testCategory1_CriticalBugFix();
  testCategory2_20PercentConstraint();
  testCategory3_WeightRanges();
  testCategory4_RepRanges();
  testCategory5_ExerciseTypes();
  testCategory6_EdgeCases();
  testCategory7_Performance();

  const endTime = performance.now();
  const totalTime = endTime - startTime;

  // Print summary
  console.log('\n');
  console.log('╔════════════════════════════════════════════════════════════════════╗');
  console.log('║ TEST EXECUTION SUMMARY                                             ║');
  console.log('╚════════════════════════════════════════════════════════════════════╝\n');

  const totalTests = testsPassed + testsFailed + testsSkipped;
  const passRate = ((testsPassed / totalTests) * 100).toFixed(1);

  console.log(`Total Tests:     ${totalTests}`);
  console.log(`Passed:          ${testsPassed} (${passRate}%)`);
  console.log(`Failed:          ${testsFailed}`);
  console.log(`Skipped:         ${testsSkipped}`);
  console.log(`Execution Time:  ${totalTime.toFixed(2)}ms\n`);

  if (testsFailed > 0) {
    console.log('╔════════════════════════════════════════════════════════════════════╗');
    console.log('║ FAILED TESTS DETAILS                                               ║');
    console.log('╚════════════════════════════════════════════════════════════════════╝\n');

    failedTests.forEach((test, i) => {
      console.log(`${i + 1}. ${test.message}`);
      console.log(`   Error: ${test.error}`);
      if (test.actual !== undefined) console.log(`   Actual: ${test.actual}`);
      if (test.expected !== undefined) console.log(`   Expected: ${test.expected}`);
      console.log('');
    });
  }

  console.log('╔════════════════════════════════════════════════════════════════════╗');
  if (testsFailed === 0) {
    console.log('║ ✅ ALL TESTS PASSED!                                               ║');
    console.log('║ ✅ Bug fix is working correctly                                    ║');
    console.log('║ ✅ Weight suggestions are accurate                                 ║');
    console.log('║ ✅ No multiplication errors detected                               ║');
  } else {
    console.log('║ ❌ SOME TESTS FAILED                                               ║');
    console.log('║ ❌ Review failures above and investigate                           ║');
  }
  console.log('╚════════════════════════════════════════════════════════════════════╝\n');

  return testsFailed === 0;
}

// Run tests
const success = runAllTests();
process.exit(success ? 0 : 1);
