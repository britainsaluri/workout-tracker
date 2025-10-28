/**
 * Bug Fix Verification Test
 *
 * Verifies the fix for the bug where Week 1 performance of 20 lbs × 10 reps
 * was suggesting 200 lbs instead of a reasonable progression (22.5 lbs).
 *
 * Root Cause: The bug was likely in the weight calculation logic where
 * increments were being multiplied instead of added.
 */

// Import the actual SuggestionEngine from the source
import { SuggestionEngine } from '../src/utils/weightSuggestions.js';

class BugFixVerification {
  constructor() {
    this.engine = new SuggestionEngine();
    this.testResults = [];
  }

  /**
   * Test the specific bug scenario: 20 lbs × 10 reps
   */
  testOriginalBugScenario() {
    console.log('\n🔍 Testing Original Bug Scenario...');
    console.log('Week 1: 20 lbs × 10 reps');
    console.log('Expected Week 2: 20-25 lbs (reasonable progression)');
    console.log('Bug was suggesting: 200 lbs (10x multiplication error)\n');

    try {
      // Simulate Week 1 data: 20 lbs for 10 reps across 2 sets
      const week1Data = [
        { weight: 20, reps: 10, completed: true },
        { weight: 20, reps: 10, completed: true }
      ];

      // Calculate suggestion for Week 2 with target range 3x8-10
      const suggestion = this.engine.calculateSuggestedWeight(
        'Leg Extension',
        week1Data,
        '3x8-10'
      );

      if (!suggestion) {
        throw new Error('No suggestion returned');
      }

      console.log('✓ Calculation Results:');
      console.log(`  Previous Weight: ${suggestion.week1Results.avgWeight} lbs`);
      console.log(`  Suggested Weight: ${suggestion.suggestedWeight} lbs`);
      console.log(`  Increase: ${suggestion.increaseAmount} lbs`);
      console.log(`  Percentage: ${suggestion.increasePercentage}%`);
      console.log(`  Performance: ${suggestion.reason}`);
      console.log(`  Confidence: ${suggestion.confidence}`);

      // Verify the fix
      const isReasonable = suggestion.suggestedWeight >= 20 &&
                          suggestion.suggestedWeight <= 30;

      const isNotBuggy = suggestion.suggestedWeight !== 200;

      if (isReasonable && isNotBuggy) {
        console.log('\n✅ BUG FIX VERIFIED: Suggestion is reasonable!');
        this.testResults.push({ name: 'Original Bug Scenario', passed: true });
        return true;
      } else {
        console.log('\n❌ BUG STILL EXISTS: Suggestion is unreasonable!');
        console.log(`   Got: ${suggestion.suggestedWeight} lbs`);
        console.log(`   Expected: 20-30 lbs range`);
        this.testResults.push({ name: 'Original Bug Scenario', passed: false });
        return false;
      }
    } catch (error) {
      console.error('\n❌ TEST FAILED:', error.message);
      this.testResults.push({ name: 'Original Bug Scenario', passed: false, error: error.message });
      return false;
    }
  }

  /**
   * Test similar scenarios with different weights
   */
  testSimilarScenarios() {
    console.log('\n🔍 Testing Similar Scenarios...\n');

    const scenarios = [
      {
        name: '15 lbs × 10 reps',
        data: [{ weight: 15, reps: 10 }, { weight: 15, reps: 10 }],
        expectedMin: 15,
        expectedMax: 25
      },
      {
        name: '25 lbs × 8 reps',
        data: [{ weight: 25, reps: 8 }, { weight: 25, reps: 8 }],
        expectedMin: 25,
        expectedMax: 35
      },
      {
        name: '30 lbs × 12 reps (strong performance)',
        data: [{ weight: 30, reps: 12 }, { weight: 30, reps: 12 }],
        expectedMin: 30,
        expectedMax: 40
      }
    ];

    let allPassed = true;

    scenarios.forEach(scenario => {
      try {
        const suggestion = this.engine.calculateSuggestedWeight(
          'Test Exercise',
          scenario.data,
          '3x8-12'
        );

        const isReasonable = suggestion.suggestedWeight >= scenario.expectedMin &&
                            suggestion.suggestedWeight <= scenario.expectedMax;

        if (isReasonable) {
          console.log(`✓ ${scenario.name}: ${suggestion.suggestedWeight} lbs (reasonable)`);
          this.testResults.push({ name: scenario.name, passed: true });
        } else {
          console.log(`✗ ${scenario.name}: ${suggestion.suggestedWeight} lbs (unreasonable)`);
          console.log(`  Expected: ${scenario.expectedMin}-${scenario.expectedMax} lbs`);
          this.testResults.push({ name: scenario.name, passed: false });
          allPassed = false;
        }
      } catch (error) {
        console.error(`✗ ${scenario.name}: ERROR - ${error.message}`);
        this.testResults.push({ name: scenario.name, passed: false, error: error.message });
        allPassed = false;
      }
    });

    return allPassed;
  }

  /**
   * Test edge cases that could reveal calculation errors
   */
  testEdgeCases() {
    console.log('\n🔍 Testing Edge Cases...\n');

    const edgeCases = [
      {
        name: 'Very light weight (5 lbs)',
        data: [{ weight: 5, reps: 20 }, { weight: 5, reps: 20 }],
        expectedMin: 5,
        expectedMax: 15
      },
      {
        name: 'Heavy weight (200 lbs)',
        data: [{ weight: 200, reps: 6 }, { weight: 200, reps: 6 }],
        expectedMin: 200,
        expectedMax: 220
      },
      {
        name: 'Decimal weight (22.5 lbs)',
        data: [{ weight: 22.5, reps: 10 }, { weight: 22.5, reps: 10 }],
        expectedMin: 22.5,
        expectedMax: 32.5
      }
    ];

    let allPassed = true;

    edgeCases.forEach(testCase => {
      try {
        const suggestion = this.engine.calculateSuggestedWeight(
          'Test Exercise',
          testCase.data,
          '3x8-12'
        );

        const isReasonable = suggestion.suggestedWeight >= testCase.expectedMin &&
                            suggestion.suggestedWeight <= testCase.expectedMax;

        if (isReasonable) {
          console.log(`✓ ${testCase.name}: ${suggestion.suggestedWeight} lbs`);
          this.testResults.push({ name: testCase.name, passed: true });
        } else {
          console.log(`✗ ${testCase.name}: ${suggestion.suggestedWeight} lbs (unreasonable)`);
          console.log(`  Expected: ${testCase.expectedMin}-${testCase.expectedMax} lbs`);
          this.testResults.push({ name: testCase.name, passed: false });
          allPassed = false;
        }
      } catch (error) {
        console.error(`✗ ${testCase.name}: ERROR - ${error.message}`);
        this.testResults.push({ name: testCase.name, passed: false, error: error.message });
        allPassed = false;
      }
    });

    return allPassed;
  }

  /**
   * Test that increments are added, not multiplied
   */
  testIncrementLogic() {
    console.log('\n🔍 Testing Increment Logic (Add vs Multiply)...\n');

    const tests = [
      {
        name: 'Compound exercise +10 lbs (should add, not multiply)',
        exerciseId: 'Squat',
        data: [{ weight: 100, reps: 10 }, { weight: 100, reps: 10 }],
        range: '3x8-10',
        expectedIncrease: 10
      },
      {
        name: 'Isolation exercise +5 lbs (should add, not multiply)',
        exerciseId: 'Curl',
        data: [{ weight: 20, reps: 10 }, { weight: 20, reps: 10 }],
        range: '3x8-10',
        expectedIncrease: 5
      }
    ];

    let allPassed = true;

    tests.forEach(test => {
      try {
        const suggestion = this.engine.calculateSuggestedWeight(
          test.exerciseId,
          test.data,
          test.range
        );

        const actualIncrease = suggestion.increaseAmount;
        const isPassed = Math.abs(actualIncrease - test.expectedIncrease) < 5; // Allow 5 lbs tolerance

        if (isPassed) {
          console.log(`✓ ${test.name}`);
          console.log(`  Weight: ${test.data[0].weight} → ${suggestion.suggestedWeight} lbs (+${actualIncrease} lbs)`);
          this.testResults.push({ name: test.name, passed: true });
        } else {
          console.log(`✗ ${test.name}`);
          console.log(`  Expected increase: ~${test.expectedIncrease} lbs`);
          console.log(`  Actual increase: ${actualIncrease} lbs`);
          console.log(`  Weight: ${test.data[0].weight} → ${suggestion.suggestedWeight} lbs`);
          this.testResults.push({ name: test.name, passed: false });
          allPassed = false;
        }
      } catch (error) {
        console.error(`✗ ${test.name}: ERROR - ${error.message}`);
        this.testResults.push({ name: test.name, passed: false, error: error.message });
        allPassed = false;
      }
    });

    return allPassed;
  }

  /**
   * Generate final report
   */
  generateReport() {
    console.log('\n' + '='.repeat(70));
    console.log('BUG FIX VERIFICATION REPORT');
    console.log('='.repeat(70));

    const total = this.testResults.length;
    const passed = this.testResults.filter(r => r.passed).length;
    const failed = total - passed;
    const passRate = ((passed / total) * 100).toFixed(1);

    console.log(`\nTotal Tests: ${total}`);
    console.log(`Passed: ${passed} (${passRate}%)`);
    console.log(`Failed: ${failed}`);

    if (failed > 0) {
      console.log('\n❌ Failed Tests:');
      this.testResults.filter(r => !r.passed).forEach(r => {
        console.log(`  - ${r.name}`);
        if (r.error) console.log(`    Error: ${r.error}`);
      });
    }

    console.log('\n' + '='.repeat(70));

    if (failed === 0) {
      console.log('✅ BUG FIX APPROVED: All verification tests passed!');
      console.log('✅ Weight calculations are working correctly');
      console.log('✅ No multiplication errors detected');
      console.log('✅ Increments are reasonable (additive, not multiplicative)');
      return true;
    } else {
      console.log('❌ BUG FIX REJECTED: Some tests failed');
      console.log('❌ Review failed tests above and investigate');
      return false;
    }
  }

  /**
   * Run all verification tests
   */
  runAll() {
    console.log('╔════════════════════════════════════════════════════════════════════╗');
    console.log('║           BUG FIX VERIFICATION TEST SUITE                         ║');
    console.log('║       Testing: 20 lbs → 200 lbs Bug Fix                          ║');
    console.log('╚════════════════════════════════════════════════════════════════════╝');

    const test1 = this.testOriginalBugScenario();
    const test2 = this.testSimilarScenarios();
    const test3 = this.testEdgeCases();
    const test4 = this.testIncrementLogic();

    return this.generateReport();
  }
}

// Run verification if executed directly
if (typeof process !== 'undefined' && process.argv[1]?.includes('bug-fix-verification')) {
  const verification = new BugFixVerification();
  const success = verification.runAll();
  process.exit(success ? 0 : 1);
}

export default BugFixVerification;
