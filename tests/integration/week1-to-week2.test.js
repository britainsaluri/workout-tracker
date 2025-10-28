/**
 * Integration Tests for Week 1 to Week 2 Flow
 *
 * Tests the complete user journey from completing Week 1 workouts
 * to receiving suggestions in Week 2.
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Week1Component from '../../src/components/Week1';
import Week2Component from '../../src/components/Week2';

describe('Week 1 to Week 2 Integration', () => {

  beforeEach(() => {
    localStorage.clear();
  });

  test('INT-001: Complete Week 1 Workflow', async () => {
    // Step 1: Render Week 1
    const { rerender } = render(<Week1Component />);

    // Step 2: Complete first exercise
    const weightInput = screen.getByLabelText(/weight/i);
    const repsInput = screen.getByLabelText(/reps/i);

    await userEvent.type(weightInput, '145');
    await userEvent.type(repsInput, '20');
    await userEvent.click(screen.getByText(/save set/i));

    // Complete second set
    await userEvent.clear(repsInput);
    await userEvent.type(repsInput, '20');
    await userEvent.click(screen.getByText(/save set/i));

    // Step 3: Save workout
    await userEvent.click(screen.getByText(/complete workout/i));

    // Step 4: Verify localStorage
    const storedData = JSON.parse(localStorage.getItem('workoutData'));
    expect(storedData.week1).toBeDefined();
    expect(storedData.week1.exercises).toHaveLength(1);
    expect(storedData.week1.exercises[0].sets).toHaveLength(2);

    // Step 5: Navigate to Week 2
    rerender(<Week2Component />);

    // Step 6: Verify suggestions appear
    await waitFor(() => {
      expect(screen.getByText(/suggested weight/i)).toBeInTheDocument();
    });

    const suggestion = screen.getByText(/155 lbs/i);
    expect(suggestion).toBeInTheDocument();
  });

  test('INT-002: Real Workout Data with 39 Exercises', async () => {
    // Load fixture with all exercises
    const fullWorkout = require('../fixtures/week1-data.json').fullWorkoutData;
    localStorage.setItem('workoutData', JSON.stringify({ week1: fullWorkout }));

    // Render Week 2
    const { container } = render(<Week2Component />);

    // Wait for all suggestions to calculate
    await waitFor(() => {
      const suggestions = container.querySelectorAll('[data-testid="weight-suggestion"]');
      expect(suggestions.length).toBeGreaterThan(0);
    }, { timeout: 500 }); // Should be well under 500ms

    // Verify no calculation errors
    expect(screen.queryByText(/error/i)).not.toBeInTheDocument();

    // Verify suggestions are reasonable
    const suggestions = container.querySelectorAll('[data-testid="suggested-weight"]');
    suggestions.forEach(suggestion => {
      const weight = parseFloat(suggestion.textContent);
      expect(weight).toBeGreaterThan(0);
      expect(weight).toBeLessThan(1000); // Sanity check
    });
  });

  test('INT-003: Multiple Exercises with Different Performance Levels', async () => {
    const mixedPerformance = {
      week1: {
        exercises: [
          {
            name: 'Exercise A - Perfect',
            targetRange: { min: 18, max: 20, sets: 2 },
            sets: [
              { weight: 100, reps: 20 },
              { weight: 100, reps: 20 }
            ]
          },
          {
            name: 'Exercise B - Struggled',
            targetRange: { min: 18, max: 20, sets: 2 },
            sets: [
              { weight: 100, reps: 15 },
              { weight: 100, reps: 14 }
            ]
          },
          {
            name: 'Exercise C - Good',
            targetRange: { min: 18, max: 20, sets: 2 },
            sets: [
              { weight: 100, reps: 19 },
              { weight: 100, reps: 18 }
            ]
          }
        ]
      }
    };

    localStorage.setItem('workoutData', JSON.stringify(mixedPerformance));
    render(<Week2Component />);

    await waitFor(() => {
      // Perfect performance: +10 lbs
      expect(screen.getByText(/Exercise A.*110 lbs/)).toBeInTheDocument();

      // Struggled: same weight
      expect(screen.getByText(/Exercise B.*100 lbs/)).toBeInTheDocument();

      // Good: +5 lbs
      expect(screen.getByText(/Exercise C.*105 lbs/)).toBeInTheDocument();
    });
  });

  test('INT-004: Accept Suggestion Flow', async () => {
    const week1Data = {
      week1: {
        exercises: [{
          name: 'Goblet Squat',
          targetRange: { min: 18, max: 20, sets: 2 },
          sets: [
            { weight: 145, reps: 20 },
            { weight: 145, reps: 20 }
          ]
        }]
      }
    };

    localStorage.setItem('workoutData', JSON.stringify(week1Data));
    render(<Week2Component />);

    // Wait for suggestion
    await waitFor(() => {
      expect(screen.getByText(/155 lbs/i)).toBeInTheDocument();
    });

    // Click accept button
    const acceptButton = screen.getByText(/accept/i);
    await userEvent.click(acceptButton);

    // Verify weight field is populated
    const weightInput = screen.getByLabelText(/weight/i);
    expect(weightInput.value).toBe('155');

    // Verify suggestion is dismissed
    expect(screen.queryByText(/accept/i)).not.toBeInTheDocument();
  });

  test('INT-005: Reject Suggestion Flow', async () => {
    const week1Data = {
      week1: {
        exercises: [{
          name: 'Goblet Squat',
          targetRange: { min: 18, max: 20, sets: 2 },
          sets: [
            { weight: 145, reps: 20 },
            { weight: 145, reps: 20 }
          ]
        }]
      }
    };

    localStorage.setItem('workoutData', JSON.stringify(week1Data));
    render(<Week2Component />);

    // Wait for suggestion
    await waitFor(() => {
      expect(screen.getByText(/155 lbs/i)).toBeInTheDocument();
    });

    // Click dismiss button
    const dismissButton = screen.getByText(/dismiss/i);
    await userEvent.click(dismissButton);

    // Verify weight field is empty (user can enter manually)
    const weightInput = screen.getByLabelText(/weight/i);
    expect(weightInput.value).toBe('');

    // Verify suggestion is dismissed
    expect(screen.queryByText(/dismiss/i)).not.toBeInTheDocument();
  });

  test('INT-006: Offline Functionality', async () => {
    // Simulate offline by mocking navigator.onLine
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: false
    });

    const week1Data = {
      week1: {
        exercises: [{
          name: 'Goblet Squat',
          targetRange: { min: 18, max: 20, sets: 2 },
          sets: [
            { weight: 145, reps: 20 },
            { weight: 145, reps: 20 }
          ]
        }]
      }
    };

    localStorage.setItem('workoutData', JSON.stringify(week1Data));
    render(<Week2Component />);

    // Verify suggestions still work offline
    await waitFor(() => {
      expect(screen.getByText(/155 lbs/i)).toBeInTheDocument();
    });

    // All functionality should work
    expect(screen.getByText(/accept/i)).toBeInTheDocument();
  });
});
