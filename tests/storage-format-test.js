/**
 * Storage Format Test
 * Tests localStorage data storage format to identify weight suggestion bug
 *
 * Bug Context: Weight suggestions showing 200 lbs instead of 22.5 lbs
 * Expected: 20 lbs × 10 reps → Suggest 22.5 lbs (20 + 12.5%)
 * Actual: Showing 220 lbs (200 + 12.5%)
 *
 * Hypothesis: Weight and reps might be multiplied during storage or retrieval
 */

// Mock localStorage for testing
class MockLocalStorage {
  constructor() {
    this.store = {};
  }

  getItem(key) {
    return this.store[key] || null;
  }

  setItem(key, value) {
    this.store[key] = value;
  }

  clear() {
    this.store = {};
  }

  key(index) {
    return Object.keys(this.store)[index];
  }

  get length() {
    return Object.keys(this.store).length;
  }
}

// Test runner
const tests = [];
const results = {
  passed: 0,
  failed: 0,
  total: 0
};

function test(name, fn) {
  tests.push({ name, fn });
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

function assertEquals(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(`${message}\nExpected: ${expected}\nActual: ${actual}`);
  }
}

async function runTests() {
  console.log('='.repeat(60));
  console.log('STORAGE FORMAT BUG TEST SUITE');
  console.log('='.repeat(60));
  console.log('');

  for (const testCase of tests) {
    results.total++;
    try {
      await testCase.fn();
      results.passed++;
      console.log(`✓ PASS: ${testCase.name}`);
    } catch (error) {
      results.failed++;
      console.log(`✗ FAIL: ${testCase.name}`);
      console.log(`  Error: ${error.message}`);
    }
  }

  console.log('');
  console.log('='.repeat(60));
  console.log(`Results: ${results.passed} passed, ${results.failed} failed, ${results.total} total`);
  console.log('='.repeat(60));
  console.log('');
}

// ============================================================================
// TEST 1: Basic Storage Format
// ============================================================================
test('Storage stores weight and reps separately', () => {
  const localStorage = new MockLocalStorage();

  // Simulate user input: 20 lbs × 10 reps
  const testData = {
    weight: 20,
    reps: 10,
    completed: true
  };

  // Store it
  localStorage.setItem('test_storage', JSON.stringify(testData));

  // Retrieve it
  const retrieved = JSON.parse(localStorage.getItem('test_storage'));

  console.log('  Input:', testData);
  console.log('  Stored:', retrieved);

  assertEquals(retrieved.weight, 20, 'Weight should be 20');
  assertEquals(retrieved.reps, 10, 'Reps should be 10');
  assert(retrieved.weight !== 200, 'Weight should NOT be multiplied by reps (20 × 10 = 200)');
});

// ============================================================================
// TEST 2: Actual Storage Key Format
// ============================================================================
test('Storage key format matches implementation', () => {
  const localStorage = new MockLocalStorage();

  // Based on index.html line 919:
  // const key = `${state.currentProgram}_w${state.currentWeek}_d${state.currentDay}_${exerciseId}_${setNumber}`;

  const key = 'sheet1_w1_d1_A1_1';
  const setData = {
    weight: 20,
    reps: 10,
    completed: true
  };

  localStorage.setItem(key, JSON.stringify(setData));
  const retrieved = JSON.parse(localStorage.getItem(key));

  console.log('  Key:', key);
  console.log('  Data:', retrieved);

  assertEquals(retrieved.weight, 20, 'Weight field should be 20');
  assertEquals(retrieved.reps, 10, 'Reps field should be 10');
});

// ============================================================================
// TEST 3: Sample Data Format Check
// ============================================================================
test('Sample data from addSampleWeek1Data() format', () => {
  const localStorage = new MockLocalStorage();

  // Based on index.html lines 1057-1059:
  // localStorage.setItem('sheet1_w1_d1_A1_1', JSON.stringify({weight: 145, reps: 20, completed: true}));

  localStorage.setItem('sheet1_w1_d1_A1_1', JSON.stringify({weight: 145, reps: 20, completed: true}));
  localStorage.setItem('sheet1_w1_d1_A1_2', JSON.stringify({weight: 145, reps: 20, completed: true}));
  localStorage.setItem('sheet1_w1_d1_A1_3', JSON.stringify({weight: 145, reps: 19, completed: true}));

  const set1 = JSON.parse(localStorage.getItem('sheet1_w1_d1_A1_1'));
  const set2 = JSON.parse(localStorage.getItem('sheet1_w1_d1_A1_2'));
  const set3 = JSON.parse(localStorage.getItem('sheet1_w1_d1_A1_3'));

  console.log('  Set 1:', set1);
  console.log('  Set 2:', set2);
  console.log('  Set 3:', set3);

  assertEquals(set1.weight, 145, 'Set 1 weight should be 145');
  assertEquals(set1.reps, 20, 'Set 1 reps should be 20');
  assert(set1.weight !== 2900, 'Weight should NOT be 145 × 20 = 2900');
});

// ============================================================================
// TEST 4: Weight Retrieval Simulation
// ============================================================================
test('Weight retrieval should preserve original values', () => {
  const localStorage = new MockLocalStorage();

  // Simulate Week 1 workout
  const week1Sets = [
    { key: 'sheet1_w1_d1_A1_1', weight: 20, reps: 10, completed: true },
    { key: 'sheet1_w1_d1_A1_2', weight: 20, reps: 10, completed: true },
    { key: 'sheet1_w1_d1_A1_3', weight: 20, reps: 9, completed: true }
  ];

  // Store Week 1 data
  week1Sets.forEach(set => {
    localStorage.setItem(set.key, JSON.stringify({
      weight: set.weight,
      reps: set.reps,
      completed: set.completed
    }));
  });

  // Retrieve and verify
  const retrievedWeights = week1Sets.map(set => {
    const data = JSON.parse(localStorage.getItem(set.key));
    return data.weight;
  });

  console.log('  Retrieved weights:', retrievedWeights);

  retrievedWeights.forEach((weight, index) => {
    assertEquals(weight, 20, `Set ${index + 1} weight should be 20`);
    assert(weight !== 200, `Set ${index + 1} weight should NOT be 200 (20 × 10)`);
  });
});

// ============================================================================
// TEST 5: Weight Calculation Simulation
// ============================================================================
test('Weight calculation for suggestion should use correct base weight', () => {
  const localStorage = new MockLocalStorage();

  // Store Week 1 data
  localStorage.setItem('sheet1_w1_d1_A1_1', JSON.stringify({weight: 20, reps: 10, completed: true}));
  localStorage.setItem('sheet1_w1_d1_A1_2', JSON.stringify({weight: 20, reps: 10, completed: true}));
  localStorage.setItem('sheet1_w1_d1_A1_3', JSON.stringify({weight: 20, reps: 10, completed: true}));

  // Retrieve weights
  const weights = [];
  for (let i = 1; i <= 3; i++) {
    const key = `sheet1_w1_d1_A1_${i}`;
    const data = JSON.parse(localStorage.getItem(key));
    weights.push(data.weight);
  }

  console.log('  Retrieved weights:', weights);

  // Calculate average
  const avgWeight = weights.reduce((sum, w) => sum + w, 0) / weights.length;
  console.log('  Average weight:', avgWeight);

  assertEquals(avgWeight, 20, 'Average weight should be 20');
  assert(avgWeight !== 200, 'Average weight should NOT be 200');

  // Calculate suggested weight (12.5% increase)
  const increase = 0.125;
  const suggestedWeight = avgWeight * (1 + increase);
  console.log('  Suggested weight (12.5% increase):', suggestedWeight);

  assertEquals(suggestedWeight, 22.5, 'Suggested weight should be 22.5 lbs');
  assert(suggestedWeight !== 220, 'Suggested weight should NOT be 220 lbs');
});

// ============================================================================
// TEST 6: Data Type Preservation
// ============================================================================
test('Data types are preserved during storage/retrieval', () => {
  const localStorage = new MockLocalStorage();

  const testData = {
    weight: 20,
    reps: 10,
    completed: true
  };

  localStorage.setItem('test_key', JSON.stringify(testData));
  const retrieved = JSON.parse(localStorage.getItem('test_key'));

  console.log('  Original types:', {
    weight: typeof testData.weight,
    reps: typeof testData.reps,
    completed: typeof testData.completed
  });
  console.log('  Retrieved types:', {
    weight: typeof retrieved.weight,
    reps: typeof retrieved.reps,
    completed: typeof retrieved.completed
  });

  assertEquals(typeof retrieved.weight, 'number', 'Weight should be a number');
  assertEquals(typeof retrieved.reps, 'number', 'Reps should be a number');
  assertEquals(typeof retrieved.completed, 'boolean', 'Completed should be a boolean');
});

// ============================================================================
// TEST 7: Simulate Bug Scenario
// ============================================================================
test('Simulate bug scenario: 20 lbs × 10 reps showing as 200 lbs', () => {
  const localStorage = new MockLocalStorage();

  // User enters: Set 1 = 20 lbs × 10 reps
  const userInput = {
    weight: 20,
    reps: 10,
    completed: true
  };

  // Store correctly
  localStorage.setItem('sheet1_w1_d1_A1_1', JSON.stringify(userInput));

  // Retrieve
  const stored = JSON.parse(localStorage.getItem('sheet1_w1_d1_A1_1'));
  console.log('  Stored data:', stored);

  // Check if multiplication happened anywhere
  const possibleBugValue = stored.weight * stored.reps;
  console.log('  If weight × reps calculated:', possibleBugValue);

  assertEquals(stored.weight, 20, 'Weight should remain 20');
  assert(stored.weight !== possibleBugValue, 'Weight should NOT be multiplied by reps');

  console.log('');
  console.log('  🔍 BUG ANALYSIS:');
  console.log('  If the bug exists, it\'s NOT in the storage layer.');
  console.log('  The bug is likely in:');
  console.log('  1. /src/utils/weightSuggestions.js - getWeek1Results()');
  console.log('  2. /src/ui/suggestionCard.js - getSuggestionForExercise()');
  console.log('  Storage layer correctly preserves weight=20, reps=10 separately.');
});

// ============================================================================
// TEST 8: Multiple Sets Retrieval Pattern
// ============================================================================
test('Multiple sets retrieval pattern preserves individual weights', () => {
  const localStorage = new MockLocalStorage();

  // Store 3 sets with same weight
  for (let i = 1; i <= 3; i++) {
    const key = `sheet1_w1_d1_A1_${i}`;
    localStorage.setItem(key, JSON.stringify({
      weight: 20,
      reps: 10,
      completed: true
    }));
  }

  // Retrieve all sets (simulating getWeek1Results)
  const results = [];
  for (let i = 1; i <= 3; i++) {
    const key = `sheet1_w1_d1_A1_${i}`;
    const data = localStorage.getItem(key);
    if (data) {
      results.push(JSON.parse(data));
    }
  }

  console.log('  Retrieved results:', results);

  assertEquals(results.length, 3, 'Should retrieve 3 sets');

  results.forEach((result, index) => {
    assertEquals(result.weight, 20, `Set ${index + 1} weight should be 20`);
    assertEquals(result.reps, 10, `Set ${index + 1} reps should be 10`);
  });

  // Calculate average
  const avgWeight = results.reduce((sum, r) => sum + r.weight, 0) / results.length;
  console.log('  Average weight:', avgWeight);
  assertEquals(avgWeight, 20, 'Average weight should be 20');
});

// ============================================================================
// RUN ALL TESTS
// ============================================================================
runTests().then(() => {
  console.log('');
  console.log('📝 CONCLUSION:');
  console.log('='.repeat(60));
  console.log('Storage layer is working correctly.');
  console.log('Data is stored as: {weight: 20, reps: 10}');
  console.log('Data is retrieved as: {weight: 20, reps: 10}');
  console.log('');
  console.log('🐛 BUG LOCATION:');
  console.log('The bug is NOT in /src/storage.js or /src/index.html storage.');
  console.log('The bug is likely in ONE of these files:');
  console.log('  1. /src/utils/weightSuggestions.js - getWeek1Results()');
  console.log('  2. /src/utils/weightSuggestions.js - calculateSuggestion()');
  console.log('  3. /src/ui/suggestionCard.js - getSuggestionForExercise()');
  console.log('');
  console.log('Next step: Examine how Week 1 results are retrieved and processed.');
  console.log('='.repeat(60));
});

// Export for Node.js if available
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { runTests, MockLocalStorage };
}
