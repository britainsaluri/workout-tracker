# UI Integration Plan for Weight Suggestions

## Overview
This document outlines the step-by-step integration plan for adding weight suggestion cards to the workout tracker UI.

**Status:** Design Complete ✅ | Implementation Pending ⏳

---

## Phase 1: Component Integration (Week 2 Display)

### 1.1 Import Suggestion Modules

**Location:** `/Users/britainsaluri/workout-tracker/src/index.html`

**Add to `<script>` section (after line 513):**

```javascript
// Import weight suggestion functionality
import {
  renderSuggestionCard,
  getSuggestionForExercise,
  isSuggestionDismissed
} from './ui/suggestionCard.js';
```

---

### 1.2 Check Week and Data Availability

**Location:** `renderWorkout()` function (line 656)

**Add after exercise loop starts (line 684):**

```javascript
// Render each exercise
exercises.forEach((exercise, index) => {
  const card = createExerciseCard(exercise, index + 1);

  // ✅ NEW: Check if we should show weight suggestions
  if (shouldShowSuggestion(exercise)) {
    const suggestionCard = createSuggestionForExercise(exercise);
    if (suggestionCard) {
      container.appendChild(suggestionCard);
    }
  }

  container.appendChild(card);
});
```

---

### 1.3 Add Suggestion Logic Helper Functions

**Location:** After `setupCardListeners()` function (line 804)

```javascript
/**
 * Check if weight suggestion should be shown for this exercise
 *
 * @param {Object} exercise - Exercise data
 * @returns {boolean} True if suggestion should be shown
 */
function shouldShowSuggestion(exercise) {
  // Only show in Week 2+
  if (state.currentWeek <= 1) {
    return false;
  }

  // Don't show if already dismissed
  if (isSuggestionDismissed(exercise.id)) {
    return false;
  }

  // Don't show if user already started entering weights
  if (hasUserStartedExercise(exercise.id)) {
    return false;
  }

  // Check if Week 1 data exists
  const week1Results = getWeek1Results(
    state.currentProgram,
    1,
    state.currentDay,
    exercise.id
  );

  return week1Results && week1Results.length > 0;
}

/**
 * Check if user has already started entering weights for this exercise
 *
 * @param {string} exerciseId - Exercise identifier
 * @returns {boolean} True if user has entered any weights
 */
function hasUserStartedExercise(exerciseId) {
  const key = `${state.currentProgram}_w${state.currentWeek}_d${state.currentDay}_${exerciseId}_1`;
  const setData = state.completedSets[key];

  return setData && (setData.weight || setData.reps);
}

/**
 * Create suggestion card for an exercise
 *
 * @param {Object} exercise - Exercise data
 * @returns {HTMLElement|null} Suggestion card or null
 */
function createSuggestionForExercise(exercise) {
  // Get suggestion from engine
  const suggestion = getSuggestionForExercise(
    state.currentProgram,
    state.currentDay,
    exercise.id,
    exercise.setsRepsRaw
  );

  if (!suggestion) {
    return null;
  }

  // Render suggestion card
  return renderSuggestionCard(
    suggestion,
    handleSuggestionAccept,
    handleSuggestionModify,
    handleSuggestionDismiss
  );
}

/**
 * Handle suggestion acceptance
 *
 * @param {Object} suggestion - Accepted suggestion
 */
function handleSuggestionAccept(suggestion) {
  console.log('[UI] Accepted suggestion:', suggestion.exerciseId, suggestion.suggestedWeight);
  showToast(`Applied ${suggestion.suggestedWeight} lbs to all sets`);

  // Save state
  saveState();
}

/**
 * Handle suggestion modification
 *
 * @param {Object} suggestion - Modified suggestion
 */
function handleSuggestionModify(suggestion) {
  console.log('[UI] Modified suggestion:', suggestion.exerciseId);
}

/**
 * Handle suggestion dismissal
 *
 * @param {Object} suggestion - Dismissed suggestion
 */
function handleSuggestionDismiss(suggestion) {
  console.log('[UI] Dismissed suggestion:', suggestion.exerciseId);
  showToast('Suggestion dismissed');
}
```

---

## Phase 2: Visual Integration

### 2.1 Suggestion Card Placement

**Card appears BEFORE set input fields:**

```
┌─────────────────────────────────────────────┐
│ [A1] Barbell Bench Press               1    │
│ Tempo: 211 | 3×18-20 | Rest: 1m             │
├─────────────────────────────────────────────┤
│                                              │
│ ┌─────────────────────────────────────────┐ │ ← SUGGESTION CARD
│ │ 💡 SUGGESTED WEIGHT            [×]      │ │
│ │ 155 lbs (+10 from last week)    ✅      │ │
│ │ Last week: 145×20, 145×20, 145×19       │ │
│ │ [    Accept    ] [   Modify   ]         │ │
│ └─────────────────────────────────────────┘ │
│                                              │
│ Set 1: [____] lbs × [____] reps [○]         │ ← SET INPUTS
│ Set 2: [____] lbs × [____] reps [○]         │
│ Set 3: [____] lbs × [____] reps [○]         │
└─────────────────────────────────────────────┘
```

---

### 2.2 CSS Integration

**Status:** ✅ CSS already injected via `suggestionCard.js`

The `injectSuggestionCardStyles()` function automatically adds all necessary CSS when the module loads.

**To verify styles are loaded:**

```javascript
// Check in browser console
document.getElementById('suggestion-card-styles'); // Should return <style> element
```

---

## Phase 3: Data Flow

### 3.1 Data Retrieval Flow

```
User navigates to Week 2, Day 1
        ↓
renderWorkout() called
        ↓
For each exercise:
  ↓
shouldShowSuggestion(exercise)
  ↓
  Check: state.currentWeek >= 2 ✓
  Check: Not dismissed ✓
  Check: User hasn't started ✓
  Check: Week 1 data exists ✓
        ↓
getSuggestionForExercise(program, day, exerciseId, setsReps)
        ↓
  Retrieves Week 1 data from localStorage
        ↓
  SuggestionEngine.calculateSuggestedWeight()
        ↓
  Returns: {
    suggestedWeight: 155,
    increaseAmount: 10,
    confidence: 'high',
    reason: 'hit_top_range_all_sets',
    week1Results: {...}
  }
        ↓
renderSuggestionCard(suggestion, callbacks)
        ↓
Appends suggestion card to DOM
        ↓
User interacts (Accept/Modify/Dismiss)
```

---

### 3.2 LocalStorage Schema

**New data structure added to `workoutTrackerState`:**

```javascript
{
  currentProgram: 'sheet1',
  currentWeek: 2,
  currentDay: 1,
  completedSets: {
    // Existing structure
    'sheet1_w1_d1_A1_1': { weight: 145, reps: 20, completed: true },
    'sheet1_w1_d1_A1_2': { weight: 145, reps: 20, completed: true },
    // ...
  },
  suggestionStates: {  // ← NEW
    'A1': {
      action: 'accepted',  // 'accepted' | 'modified' | 'dismissed'
      weight: 155,
      timestamp: '2025-10-28T18:30:00.000Z'
    },
    'A2': {
      action: 'dismissed',
      weight: null,
      timestamp: '2025-10-28T18:31:00.000Z'
    }
  }
}
```

---

## Phase 4: User Interaction Flows

### 4.1 Accept Suggestion Flow

```
1. User taps "Accept" button
2. handleAcceptSuggestion(exerciseId, weight) called
3. Find all weight inputs for exercise (.weight-input)
4. Fill each input with suggested weight
5. Trigger 'input' event to save state
6. Add visual feedback (green pulse animation)
7. Update suggestion card to "accepted" state
8. Save to localStorage.suggestionStates
9. Show toast: "Applied 155 lbs to all sets"
10. Haptic feedback (if available)
```

---

### 4.2 Modify Suggestion Flow

```
1. User taps "Modify" button
2. handleModifySuggestion(exerciseId, suggestedWeight) called
3. Show prompt with suggested weight
4. User enters custom weight (e.g., 150 lbs)
5. Call handleAcceptSuggestion() with custom weight
6. Fill inputs with custom weight
7. Save as 'modified' to localStorage
8. Update card to show custom weight
```

---

### 4.3 Dismiss Suggestion Flow

```
1. User taps "×" dismiss button
2. handleDismissSuggestion(exerciseId) called
3. Save 'dismissed' state to localStorage
4. Animate card out (fade + slide right)
5. Remove card from DOM after 300ms
6. User enters weights manually as usual
```

---

### 4.4 Re-show Dismissed Suggestion

```
Option 1: Add "View suggestion" link below exercise header
Option 2: Show in "?" help menu
Option 3: Clear all dismissed on week change

Implementation (Option 1):
<div class="suggestion-dismissed-link" style="display: ${dismissed ? 'block' : 'none'}">
  <a onclick="reshowSuggestion('A1')">💡 View weight suggestion</a>
</div>
```

---

## Phase 5: Performance Optimization

### 5.1 Rendering Performance

**Target:** <100ms to calculate and render all suggestions

**Optimization strategies:**
- ✅ Batch calculations using `calculateDaySuggestions()`
- ✅ Cache suggestion results in `SuggestionEngine.cache`
- ✅ Use `DocumentFragment` for batch DOM insertion
- ✅ Lazy load styles (already implemented)

**Measurement:**

```javascript
console.time('Suggestion Rendering');
// Render suggestions for all exercises
console.timeEnd('Suggestion Rendering');
// Expected: 50-80ms for 5-10 exercises
```

---

### 5.2 Memory Management

**Strategies:**
- Clear dismissed suggestions after 7 days
- Limit cache size to 50 entries
- Remove old suggestion states on week change

**Implementation:**

```javascript
function cleanupOldSuggestions() {
  const state = JSON.parse(localStorage.getItem('workoutTrackerState'));
  const suggestionStates = state.suggestionStates || {};
  const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);

  Object.keys(suggestionStates).forEach(key => {
    const suggestion = suggestionStates[key];
    const timestamp = new Date(suggestion.timestamp).getTime();

    if (timestamp < sevenDaysAgo) {
      delete suggestionStates[key];
    }
  });

  state.suggestionStates = suggestionStates;
  localStorage.setItem('workoutTrackerState', JSON.stringify(state));
}

// Call on app init
cleanupOldSuggestions();
```

---

## Phase 6: Edge Cases & Error Handling

### 6.1 No Week 1 Data

**Scenario:** User skips Week 1 or incomplete data

**Handling:**
- No suggestion card shown
- User enters weights manually
- Next week uses this as baseline

---

### 6.2 Calculation Failure

**Scenario:** Algorithm fails to calculate suggestion

**Handling:**

```javascript
function createSuggestionForExercise(exercise) {
  try {
    const suggestion = getSuggestionForExercise(
      state.currentProgram,
      state.currentDay,
      exercise.id,
      exercise.setsRepsRaw
    );

    if (!suggestion) {
      return null;
    }

    return renderSuggestionCard(suggestion, ...);
  } catch (error) {
    console.error('[UI] Suggestion error:', error);
    return null; // Fail silently, allow manual entry
  }
}
```

---

### 6.3 Mixed Data (Some Exercises Have Week 1, Some Don't)

**Scenario:** User completed only some exercises in Week 1

**Handling:**
- Show suggestions for exercises with data
- No suggestions for exercises without data
- User enters manually for missing exercises

---

### 6.4 Very Low Confidence Suggestions

**Scenario:** Algorithm has low confidence (<70%)

**Visual treatment:**
- Orange/red border
- Warning icon (⚠️)
- Different messaging: "Estimated starting point"
- More conservative weight increases

---

## Phase 7: Testing Checklist

### 7.1 Functional Testing

- [ ] Suggestion appears on Week 2, Day 1
- [ ] No suggestion on Week 1
- [ ] Accept button fills all weight inputs
- [ ] Modify button prompts for custom weight
- [ ] Dismiss button hides card with animation
- [ ] Dismissed suggestion stays hidden on refresh
- [ ] Multiple exercises show correct suggestions
- [ ] Works with different set counts (2 sets, 3 sets, etc.)

---

### 7.2 Visual Testing

- [ ] Card displays correctly on iPhone SE (smallest)
- [ ] Card displays correctly on iPhone 15 Pro
- [ ] Card displays correctly on iPad
- [ ] Touch targets are 44×44px minimum
- [ ] Confidence badges show correct colors
- [ ] Animations are smooth (60fps)
- [ ] Text is readable without zoom

---

### 7.3 Data Integrity Testing

- [ ] Week 1 data retrieval is accurate
- [ ] Suggestion calculations match expected values
- [ ] localStorage saves correctly
- [ ] State persists across page reloads
- [ ] No data loss when dismissing
- [ ] Accepted weights save to completedSets

---

### 7.4 Performance Testing

```javascript
// Test rendering time
function testSuggestionPerformance() {
  const exercises = getCurrentExercises();

  console.time('Full Suggestion Render');

  exercises.forEach(exercise => {
    if (shouldShowSuggestion(exercise)) {
      createSuggestionForExercise(exercise);
    }
  });

  console.timeEnd('Full Suggestion Render');
  // Expected: <100ms for 5-10 exercises
}
```

---

## Phase 8: Future Enhancements

### 8.1 Version 1.1 Features

**Progressive Enhancement:**
- Swipe gestures (left = dismiss, right = accept)
- Haptic patterns (different for accept/modify/dismiss)
- Animation improvements (spring physics)
- Undo dismissed suggestions

---

### 8.2 Version 1.2 Features

**Analytics & Learning:**
- Track acceptance rate
- A/B test different confidence thresholds
- Learn from user modifications
- Personalized adjustment factors

---

### 8.3 Version 2.0 Features

**Advanced Intelligence:**
- Multi-week trend analysis
- Predictive modeling (ML-based)
- Fatigue detection
- Deload week recommendations

---

## Implementation Timeline

### Week 1: Core Integration
- ✅ Day 1-2: UI component creation (COMPLETE)
- ⏳ Day 3-4: Index.html integration (PENDING)
- ⏳ Day 5: Testing & debugging (PENDING)

### Week 2: Polish & Optimization
- ⏳ Day 1-2: Performance optimization
- ⏳ Day 3: Edge case handling
- ⏳ Day 4-5: User testing & feedback

### Week 3: Launch
- ⏳ Day 1-2: Final testing
- ⏳ Day 3: Documentation
- ⏳ Day 4-5: Production deployment

---

## Risk Mitigation

### Risk 1: Algorithm Accuracy
**Mitigation:** Start with conservative increases, allow easy modifications

### Risk 2: User Confusion
**Mitigation:** Clear messaging, explanation panel, help tooltips

### Risk 3: Performance Issues
**Mitigation:** Batch calculations, cache results, lazy rendering

### Risk 4: Data Loss
**Mitigation:** Robust localStorage handling, error boundaries, fallbacks

---

## Success Metrics

### Primary Metrics
- **Adoption Rate:** % of users who accept suggestions (target: >60%)
- **Modification Rate:** % of users who modify suggestions (target: <20%)
- **Dismissal Rate:** % of users who dismiss suggestions (target: <10%)

### Secondary Metrics
- **Time Savings:** Time to complete workout entry (target: -30%)
- **Accuracy:** Weight progression accuracy vs manual (target: >95%)
- **User Satisfaction:** Post-feature survey (target: >4.5/5)

---

## Contact & Support

**Questions?** Create an issue in the project repository.

**Bugs?** Report with:
- Device/browser
- Week/day/exercise
- Screenshot
- localStorage dump

---

**Last Updated:** 2025-10-28
**Version:** 1.0.0
**Status:** Ready for Implementation ✅
