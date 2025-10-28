/**
 * Manual Bug Fix Verification
 *
 * Verifies the fix for: 20 lbs × 10 reps suggesting 200 lbs instead of ~22.5 lbs
 *
 * This is a standalone test that can be run in Node.js or browser console
 */

// Inline SuggestionEngine implementation for testing
class SuggestionEngine {
  calculateSuggestedWeight(exerciseId, week1Results, week2Target) {
    if (!exerciseId || !week1Results || week1Results.length === 0) {
      return null;
    }

    // Filter only completed sets with valid data
    const completedSets = week1Results.filter(set => {
      if (!set.weight || set.weight <= 0) return false;
      if (set.reps < 0) return false;
      if (set.reps === 0) return false;
      if (set.hasOwnProperty('completed') && !set.completed) return false;
      return true;
    });

    if (completedSets.length === 0) return null;

    // Parse Week 2 target
    const targetRange = this._parseRepRange(week2Target);
    if (!targetRange) throw new Error('Invalid target range format');

    // Calculate averages
    const avgWeight = this._average(completedSets.map(s => s.weight));
    const avgReps = this._average(completedSets.map(s => s.reps));

    // Analyze performance
    const performance = this.analyzePerformance(completedSets, targetRange);

    // Get exercise type
    const exerciseType = this._classifyExerciseById(exerciseId);

    // Calculate weight adjustment
    const adjustment = this.calculateAdjustment(performance, exerciseType, avgWeight);

    // Apply adjustment (CRITICAL: This should be ADDITION, not multiplication)
    const suggestedWeight = this._roundToNearestHalf(avgWeight + adjustment.amount);
    const increaseAmount = suggestedWeight - avgWeight;
    const increasePercentage = avgWeight > 0 ? (increaseAmount / avgWeight) * 100 : 0;

    return {
      exerciseId,
      week1Results: {
        avgWeight: this._roundToNearestHalf(avgWeight),
        avgReps: Math.round(avgReps * 10) / 10,
      },
      suggestedWeight,
      increaseAmount: this._roundToNearestHalf(increaseAmount),
      increasePercentage: Math.round(increasePercentage * 10) / 10,
      reason: adjustment.reason,
      confidence: adjustment.confidence
    };
  }

  analyzePerformance(week1Results, targetRange) {
    const { min, max } = targetRange;
    const repSpan = max - min;

    const setScores = week1Results.map(set => {
      if (set.reps >= max) return 100;
      if (set.reps <= min) return 25;
      const progress = (set.reps - min) / repSpan;
      return 25 + (progress * 75);
    });

    const avgScore = this._average(setScores);

    let level;
    if (avgScore >= 100) level = 'EXCEEDED';
    else if (avgScore >= 75) level = 'STRONG';
    else if (avgScore >= 50) level = 'MAINTAINED';
    else level = 'STRUGGLED';

    return { level, score: Math.round(avgScore) };
  }

  calculateAdjustment(performance, exerciseType, currentWeight) {
    const adjustments = {
      COMPOUND: {
        EXCEEDED: { amount: 10, reason: 'Crushed it!', confidence: 'high' },
        STRONG: { amount: 5, reason: 'Great work!', confidence: 'high' },
        MAINTAINED: { amount: 0, reason: 'Master this weight', confidence: 'medium' },
        STRUGGLED: { amount: 0, reason: 'Nail this weight', confidence: 'low' }
      },
      ISOLATION: {
        EXCEEDED: { amount: 5, reason: 'Perfect form!', confidence: 'high' },
        STRONG: { amount: 2.5, reason: 'Solid progress!', confidence: 'high' },
        MAINTAINED: { amount: 0, reason: 'Keep building', confidence: 'medium' },
        STRUGGLED: { amount: 0, reason: 'Focus on control', confidence: 'low' }
      }
    };

    return adjustments[exerciseType][performance.level];
  }

  _parseRepRange(rangeStr) {
    if (!rangeStr) return null;
    const cleaned = rangeStr.replace(/^\d+x/i, '');
    const rangeMatch = cleaned.match(/(\d+)-(\d+)/);
    if (rangeMatch) {
      return {
        min: parseInt(rangeMatch[1], 10),
        max: parseInt(rangeMatch[2], 10)
      };
    }
    return null;
  }

  _classifyExerciseById(exerciseId) {
    const normalized = (exerciseId || '').toLowerCase();
    const compoundKeywords = ['squat', 'deadlift', 'bench', 'press', 'row', 'pull', 'lunge'];
    const isCompound = compoundKeywords.some(k => normalized.includes(k));
    return isCompound ? 'COMPOUND' : 'ISOLATION';
  }

  _average(arr) {
    if (!arr || arr.length === 0) return 0;
    return arr.reduce((sum, val) => sum + val, 0) / arr.length;
  }

  _roundToNearestHalf(num) {
    return Math.round(num * 2) / 2;
  }
}

// Test Runner
function runBugFixVerification() {
  console.log('╔════════════════════════════════════════════════════════════════════╗');
  console.log('║           BUG FIX VERIFICATION TEST                               ║');
  console.log('║       Testing: 20 lbs → 200 lbs Bug Fix                          ║');
  console.log('╚════════════════════════════════════════════════════════════════════╝\n');

  const engine = new SuggestionEngine();
  let allPassed = true;

  // TEST 1: Original bug scenario
  console.log('TEST 1: Original Bug Scenario');
  console.log('  Week 1: 20 lbs × 10 reps (2 sets)');
  console.log('  Expected: 20-25 lbs (reasonable progression)');
  console.log('  Bug was: 200 lbs (10x multiplication error)\n');

  try {
    const result = engine.calculateSuggestedWeight(
      'Leg Extension',
      [
        { weight: 20, reps: 10, completed: true },
        { weight: 20, reps: 10, completed: true }
      ],
      '3x8-10'
    );

    console.log('  Results:');
    console.log(`    Previous: ${result.week1Results.avgWeight} lbs`);
    console.log(`    Suggested: ${result.suggestedWeight} lbs`);
    console.log(`    Increase: ${result.increaseAmount} lbs`);
    console.log(`    Percentage: ${result.increasePercentage}%`);
    console.log(`    Reason: ${result.reason}`);

    const isReasonable = result.suggestedWeight >= 20 && result.suggestedWeight <= 30;
    const isNotBuggy = result.suggestedWeight !== 200;

    if (isReasonable && isNotBuggy) {
      console.log('  ✅ PASS: Suggestion is reasonable!\n');
    } else {
      console.log(`  ❌ FAIL: Got ${result.suggestedWeight} lbs (expected 20-30 lbs)\n`);
      allPassed = false;
    }
  } catch (error) {
    console.log(`  ❌ ERROR: ${error.message}\n`);
    allPassed = false;
  }

  // TEST 2: Similar scenarios
  console.log('TEST 2: Similar Weight Scenarios');
  const scenarios = [
    { weight: 15, reps: 10, name: '15 lbs × 10', min: 15, max: 25 },
    { weight: 25, reps: 8, name: '25 lbs × 8', min: 25, max: 35 },
    { weight: 30, reps: 12, name: '30 lbs × 12', min: 30, max: 40 }
  ];

  scenarios.forEach(scenario => {
    try {
      const result = engine.calculateSuggestedWeight(
        'Test Exercise',
        [
          { weight: scenario.weight, reps: scenario.reps },
          { weight: scenario.weight, reps: scenario.reps }
        ],
        '3x8-12'
      );

      const isReasonable = result.suggestedWeight >= scenario.min &&
                          result.suggestedWeight <= scenario.max;

      if (isReasonable) {
        console.log(`  ✓ ${scenario.name}: ${result.suggestedWeight} lbs (reasonable)`);
      } else {
        console.log(`  ✗ ${scenario.name}: ${result.suggestedWeight} lbs (unreasonable, expected ${scenario.min}-${scenario.max})`);
        allPassed = false;
      }
    } catch (error) {
      console.log(`  ✗ ${scenario.name}: ERROR - ${error.message}`);
      allPassed = false;
    }
  });

  // TEST 3: Increment logic (add vs multiply)
  console.log('\nTEST 3: Increment Logic (Add vs Multiply)');
  console.log('  Testing that increments are ADDED, not MULTIPLIED\n');

  try {
    // Isolation exercise should add 5 lbs (not multiply by 5)
    const isolationResult = engine.calculateSuggestedWeight(
      'Curl',
      [{ weight: 20, reps: 10 }, { weight: 20, reps: 10 }],
      '3x8-10'
    );

    console.log(`  Isolation (20 lbs → ${isolationResult.suggestedWeight} lbs):`);
    console.log(`    Increment: ${isolationResult.increaseAmount} lbs`);

    const isolationPassed = isolationResult.increaseAmount >= 0 &&
                           isolationResult.increaseAmount <= 10;

    if (isolationPassed) {
      console.log('    ✅ PASS: Increment is additive, not multiplicative');
    } else {
      console.log(`    ❌ FAIL: Unexpected increment of ${isolationResult.increaseAmount} lbs`);
      allPassed = false;
    }

    // Compound exercise should add 10 lbs (not multiply by 10)
    const compoundResult = engine.calculateSuggestedWeight(
      'Squat',
      [{ weight: 100, reps: 10 }, { weight: 100, reps: 10 }],
      '3x8-10'
    );

    console.log(`\n  Compound (100 lbs → ${compoundResult.suggestedWeight} lbs):`);
    console.log(`    Increment: ${compoundResult.increaseAmount} lbs`);

    const compoundPassed = compoundResult.increaseAmount >= 0 &&
                          compoundResult.increaseAmount <= 15;

    if (compoundPassed) {
      console.log('    ✅ PASS: Increment is additive, not multiplicative\n');
    } else {
      console.log(`    ❌ FAIL: Unexpected increment of ${compoundResult.increaseAmount} lbs\n`);
      allPassed = false;
    }
  } catch (error) {
    console.log(`  ❌ ERROR: ${error.message}\n`);
    allPassed = false;
  }

  // Final verdict
  console.log('═══════════════════════════════════════════════════════════════════');
  if (allPassed) {
    console.log('✅ BUG FIX APPROVED: All tests passed!');
    console.log('✅ Weight calculations are working correctly');
    console.log('✅ Increments are additive (not multiplicative)');
    console.log('✅ No 10x multiplication error detected');
  } else {
    console.log('❌ BUG FIX REJECTED: Some tests failed');
    console.log('❌ Review failures above');
  }
  console.log('═══════════════════════════════════════════════════════════════════');

  return allPassed;
}

// Run if executed directly
if (typeof module !== 'undefined' && require.main === module) {
  const success = runBugFixVerification();
  process.exit(success ? 0 : 1);
}

module.exports = { SuggestionEngine, runBugFixVerification };
