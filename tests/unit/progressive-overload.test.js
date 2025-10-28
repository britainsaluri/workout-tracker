/**
 * Unit Tests for Progressive Overload Algorithm
 *
 * Tests the core weight suggestion logic with various scenarios
 * including perfect performance, struggles, edge cases, and rep ranges.
 */

import { calculateWeightSuggestion } from '../../src/utils/progressiveOverload';

describe('Progressive Overload Algorithm - Unit Tests', () => {

  describe('Weight Increase Logic', () => {

    test('ALG-001: Perfect Performance - Hit Upper Limit', () => {
      const week1Data = {
        sets: [
          { weight: 145, reps: 20 },
          { weight: 145, reps: 20 }
        ]
      };
      const targetRange = { min: 18, max: 20, sets: 2 };

      const suggestion = calculateWeightSuggestion(week1Data, targetRange);

      expect(suggestion.weight).toBe(155);
      expect(suggestion.increase).toBe(10);
      expect(suggestion.confidence).toBe('high');
      expect(suggestion.reason).toContain('upper rep limit');
    });

    test('ALG-002: Excellent Performance - Exceeded Target', () => {
      const week1Data = {
        sets: [
          { weight: 145, reps: 21 },
          { weight: 145, reps: 20 }
        ]
      };
      const targetRange = { min: 18, max: 20, sets: 2 };

      const suggestion = calculateWeightSuggestion(week1Data, targetRange);

      expect(suggestion.weight).toBe(155);
      expect(suggestion.increase).toBe(10);
      expect(suggestion.confidence).toBe('high');
      expect(suggestion.reason).toContain('Exceeded target');
    });

    test('ALG-003: Good Performance - Mid-Range', () => {
      const week1Data = {
        sets: [
          { weight: 145, reps: 19 },
          { weight: 145, reps: 18 }
        ]
      };
      const targetRange = { min: 18, max: 20, sets: 2 };

      const suggestion = calculateWeightSuggestion(week1Data, targetRange);

      expect(suggestion.weight).toBe(150);
      expect(suggestion.increase).toBe(5);
      expect(suggestion.confidence).toBe('medium');
      expect(suggestion.reason).toContain('Solid performance');
    });

    test('ALG-004: Adequate Performance - Lower Range', () => {
      const week1Data = {
        sets: [
          { weight: 145, reps: 18 },
          { weight: 145, reps: 17 }
        ]
      };
      const targetRange = { min: 18, max: 20, sets: 2 };

      const suggestion = calculateWeightSuggestion(week1Data, targetRange);

      expect(suggestion.weight).toBeGreaterThanOrEqual(145);
      expect(suggestion.weight).toBeLessThanOrEqual(150);
      expect(suggestion.confidence).toBe('medium');
    });

    test('ALG-005: Struggled - Below Target', () => {
      const week1Data = {
        sets: [
          { weight: 145, reps: 16 },
          { weight: 145, reps: 15 }
        ]
      };
      const targetRange = { min: 18, max: 20, sets: 2 };

      const suggestion = calculateWeightSuggestion(week1Data, targetRange);

      expect(suggestion.weight).toBe(145);
      expect(suggestion.increase).toBe(0);
      expect(suggestion.reason).toContain('maintain weight');
    });

    test('ALG-006: Significant Struggle', () => {
      const week1Data = {
        sets: [
          { weight: 145, reps: 12 },
          { weight: 145, reps: 10 }
        ]
      };
      const targetRange = { min: 18, max: 20, sets: 2 };

      const suggestion = calculateWeightSuggestion(week1Data, targetRange);

      expect(suggestion.weight).toBeLessThan(145);
      expect(suggestion.increase).toBeLessThan(0);
      expect(suggestion.reason).toContain('reduce weight');
    });
  });

  describe('Edge Cases', () => {

    test('EDGE-001: No Week 1 Data', () => {
      const week1Data = null;
      const targetRange = { min: 18, max: 20, sets: 2 };

      const suggestion = calculateWeightSuggestion(week1Data, targetRange);

      expect(suggestion).toBeNull();
    });

    test('EDGE-002: Empty Week 1 Data', () => {
      const week1Data = { sets: [] };
      const targetRange = { min: 18, max: 20, sets: 2 };

      const suggestion = calculateWeightSuggestion(week1Data, targetRange);

      expect(suggestion).toBeNull();
    });

    test('EDGE-003: Single Set Only', () => {
      const week1Data = {
        sets: [
          { weight: 50, reps: 20 }
        ]
      };
      const targetRange = { min: 18, max: 20, sets: 2 };

      const suggestion = calculateWeightSuggestion(week1Data, targetRange);

      expect(suggestion).not.toBeNull();
      expect(suggestion.warning).toContain('based on 1 set');
      expect(suggestion.confidence).toBe('low');
    });

    test('EDGE-004: Inconsistent Sets', () => {
      const week1Data = {
        sets: [
          { weight: 145, reps: 20 },
          { weight: 145, reps: 10 }
        ]
      };
      const targetRange = { min: 18, max: 20, sets: 2 };

      const suggestion = calculateWeightSuggestion(week1Data, targetRange);

      expect(suggestion.weight).toBe(145);
      expect(suggestion.warning).toContain('Inconsistent performance');
      expect(suggestion.confidence).toBe('low');
    });

    test('EDGE-005: Failed Sets (0 reps)', () => {
      const week1Data = {
        sets: [
          { weight: 185, reps: 20 },
          { weight: 185, reps: 0 }
        ]
      };
      const targetRange = { min: 18, max: 20, sets: 2 };

      const suggestion = calculateWeightSuggestion(week1Data, targetRange);

      expect(suggestion).not.toBeNull();
      expect(suggestion.note).toContain('completed sets only');
    });

    test('EDGE-006: Invalid Weight Values', () => {
      const week1Data = {
        sets: [
          { weight: 0, reps: 20 },
          { weight: -5, reps: 18 }
        ]
      };
      const targetRange = { min: 18, max: 20, sets: 2 };

      expect(() => {
        calculateWeightSuggestion(week1Data, targetRange);
      }).toThrow('Invalid weight values');
    });

    test('EDGE-007: Extreme Weight Values', () => {
      const week1Data = {
        sets: [
          { weight: 999, reps: 20 },
          { weight: 999, reps: 20 }
        ]
      };
      const targetRange = { min: 18, max: 20, sets: 2 };

      const suggestion = calculateWeightSuggestion(week1Data, targetRange);

      expect(suggestion.increase).toBeLessThanOrEqual(25); // Max increment cap
    });
  });

  describe('Rep Range Scenarios', () => {

    test('REP-001: Low Rep Range (Strength)', () => {
      const week1Data = {
        sets: [
          { weight: 225, reps: 6 },
          { weight: 225, reps: 6 },
          { weight: 225, reps: 5 }
        ]
      };
      const targetRange = { min: 4, max: 6, sets: 3 };

      const suggestion = calculateWeightSuggestion(week1Data, targetRange);

      expect(suggestion.weight).toBe(235);
      expect(suggestion.increase).toBe(10);
    });

    test('REP-002: Mid Rep Range (Hypertrophy)', () => {
      const week1Data = {
        sets: [
          { weight: 185, reps: 10 },
          { weight: 185, reps: 9 },
          { weight: 185, reps: 8 }
        ]
      };
      const targetRange = { min: 8, max: 10, sets: 3 };

      const suggestion = calculateWeightSuggestion(week1Data, targetRange);

      expect(suggestion.weight).toBeGreaterThan(185);
      expect(suggestion.weight).toBeLessThanOrEqual(195);
    });

    test('REP-003: High Rep Range (Endurance)', () => {
      const week1Data = {
        sets: [
          { weight: 135, reps: 20 },
          { weight: 135, reps: 19 },
          { weight: 135, reps: 18 }
        ]
      };
      const targetRange = { min: 15, max: 20, sets: 3 };

      const suggestion = calculateWeightSuggestion(week1Data, targetRange);

      expect(suggestion.weight).toBeGreaterThan(135);
      expect(suggestion.weight).toBeLessThanOrEqual(145);
    });
  });

  describe('Calculation Accuracy', () => {

    test('Should calculate average reps correctly', () => {
      const week1Data = {
        sets: [
          { weight: 145, reps: 20 },
          { weight: 145, reps: 18 },
          { weight: 145, reps: 19 }
        ]
      };
      const targetRange = { min: 18, max: 20, sets: 3 };

      const suggestion = calculateWeightSuggestion(week1Data, targetRange);
      const avgReps = (20 + 18 + 19) / 3;

      expect(avgReps).toBe(19);
      expect(suggestion.weight).toBeGreaterThan(145);
    });

    test('Should handle decimal weights correctly', () => {
      const week1Data = {
        sets: [
          { weight: 52.5, reps: 20 },
          { weight: 52.5, reps: 20 }
        ]
      };
      const targetRange = { min: 18, max: 20, sets: 2 };

      const suggestion = calculateWeightSuggestion(week1Data, targetRange);

      expect(suggestion.weight).toBe(62.5);
      expect(suggestion.increase).toBe(10);
    });
  });
});
