# Progressive Overload Feature - End-to-End Integration Test Plan

**Version:** 1.0
**Date:** 2025-10-28
**Test Phase:** Phase 2 - UI Integration Testing
**Target Browsers:** Chrome 120+, Firefox 120+, Safari 17+, Mobile Safari iOS 15+, Chrome Android 120+

---

## Table of Contents

1. [Test Environment Setup](#test-environment-setup)
2. [Core User Journey Scenarios](#core-user-journey-scenarios)
3. [Mobile Device Testing](#mobile-device-testing)
4. [Performance Testing](#performance-testing)
5. [Edge Case Testing](#edge-case-testing)
6. [Regression Testing](#regression-testing)
7. [Test Data Fixtures](#test-data-fixtures)
8. [Bug Report Template](#bug-report-template)
9. [Screenshot/Video Capture Checklist](#screenshotvideo-capture-checklist)

---

## Test Environment Setup

### Prerequisites
- [ ] Fresh browser profile (cleared cache, localStorage)
- [ ] Developer tools open (Console, Network, Application tabs)
- [ ] Screen recording software ready
- [ ] Test data fixtures loaded (see Test Data Fixtures section)
- [ ] Stopwatch/performance profiler for timing measurements

### Test Data Reset Procedure
```javascript
// Run in browser console before each test scenario
localStorage.clear();
sessionStorage.clear();
location.reload();
```

### Verification Checklist
- [ ] Service worker registered and active
- [ ] localStorage accessible (no quota errors)
- [ ] Network tab shows offline capability
- [ ] Console shows no errors on page load

---

## Core User Journey Scenarios

### Scenario 1: First-Time User (No Week 1 Data)

**Objective:** Verify progressive overload suggestions do not appear without baseline data.

**Test Steps:**
1. [ ] Clear all localStorage data
2. [ ] Navigate to `/week2.html`
3. [ ] Observe each exercise section
4. [ ] Attempt to expand suggestion cards (if visible)

**Expected Results:**
- [ ] ✅ No progressive overload suggestion cards visible
- [ ] ✅ Week 2 weight inputs are empty/default
- [ ] ✅ Console shows: "No Week 1 data found for [exercise]" (debug mode)
- [ ] ✅ Page loads without errors
- [ ] ✅ All other Week 2 functionality works normally

**Test Data Validation:**
5. [ ] Navigate to `/week1.html`
6. [ ] Complete a workout (e.g., Barbell Hip Thrust: 2 sets, 145 lbs, 15-18 reps)
7. [ ] Verify data saves to localStorage (`workoutData` key)
8. [ ] Navigate back to `/week2.html`

**Expected Results After Week 1 Completion:**
- [ ] ✅ Progressive overload suggestion card now appears
- [ ] ✅ Suggestion shows calculated weight increase
- [ ] ✅ Confidence indicator displays (Low/Medium/High)
- [ ] ✅ "Accept Suggestion" button is functional

**Pass/Fail:** ___________
**Notes:** ___________________________________________
**Screenshot:** [ ] Captured

---

### Scenario 2: Strong Performance (+10 lbs Increase)

**Objective:** Test suggestion for user who hit top of rep range consistently.

**Pre-Condition Test Data (Week 1):**
```json
{
  "week1": {
    "Barbell Hip Thrust": {
      "sets": [
        { "weight": 145, "reps": 20 },
        { "weight": 145, "reps": 20 }
      ]
    }
  }
}
```

**Test Steps:**
1. [ ] Load test data fixture (Scenario 2) into localStorage
2. [ ] Navigate to `/week2.html`
3. [ ] Locate Barbell Hip Thrust exercise section
4. [ ] Observe progressive overload suggestion card

**Expected Results - Suggestion Display:**
- [ ] ✅ Suggestion card visible at top of exercise section
- [ ] ✅ Shows suggested weight: **155 lbs** (+10 from 145)
- [ ] ✅ Confidence indicator: **High** (green badge/icon)
- [ ] ✅ Rationale text: "You hit max reps consistently" or similar
- [ ] ✅ "Accept Suggestion" button enabled and visible
- [ ] ✅ "Modify" button enabled and visible
- [ ] ✅ "Dismiss" button/icon visible

**Test Steps - Accept Suggestion:**
5. [ ] Click "Accept Suggestion" button
6. [ ] Observe all weight input fields for Barbell Hip Thrust

**Expected Results - Auto-Fill:**
- [ ] ✅ All set weight inputs auto-filled with **155 lbs**
- [ ] ✅ Auto-fill completes in <50ms (measure in Network tab)
- [ ] ✅ Suggestion card disappears or shows "Applied" state
- [ ] ✅ No JavaScript errors in console
- [ ] ✅ localStorage updated with dismissed suggestion

**Test Steps - Data Persistence:**
7. [ ] Refresh page (F5)
8. [ ] Verify suggestion card does NOT reappear
9. [ ] Verify weight inputs retain 155 lbs values

**Expected Results - Persistence:**
- [ ] ✅ Suggestion stays dismissed after refresh
- [ ] ✅ Weight values persist in localStorage
- [ ] ✅ No duplicate suggestions appear

**Pass/Fail:** ___________
**Screenshot:** [ ] Before Accept [ ] After Accept
**Video:** [ ] Auto-fill animation captured

---

### Scenario 3: Moderate Performance (+5 lbs Increase)

**Objective:** Test suggestion for user in middle of rep range.

**Pre-Condition Test Data (Week 1):**
```json
{
  "week1": {
    "Barbell Hip Thrust": {
      "sets": [
        { "weight": 145, "reps": 18 },
        { "weight": 145, "reps": 19 }
      ]
    }
  }
}
```

**Test Steps:**
1. [ ] Load test data fixture (Scenario 3)
2. [ ] Navigate to `/week2.html`
3. [ ] Locate Barbell Hip Thrust section

**Expected Results:**
- [ ] ✅ Suggestion shows: **150 lbs** (+5 from 145)
- [ ] ✅ Confidence indicator: **Medium** (yellow/amber badge)
- [ ] ✅ Rationale: "Solid progress, moderate increase" or similar
- [ ] ✅ Accept/Modify/Dismiss buttons functional

**Test Steps - Verify Calculation:**
4. [ ] Calculate expected increase: `(18 + 19) / 2 = 18.5 avg reps`
5. [ ] Verify 18.5 is in middle of 12-20 range
6. [ ] Confirm +5 lbs is appropriate for moderate performance

**Expected Results - Logic Validation:**
- [ ] ✅ Average reps calculated correctly
- [ ] ✅ Weight increase matches algorithm (5-10 lbs for middle range)
- [ ] ✅ Confidence level matches performance tier

**Pass/Fail:** ___________
**Notes:** ___________________________________________

---

### Scenario 4: Struggled Performance (Same Weight)

**Objective:** Test suggestion when user barely hit minimum reps.

**Pre-Condition Test Data (Week 1):**
```json
{
  "week1": {
    "Barbell Hip Thrust": {
      "sets": [
        { "weight": 145, "reps": 12 },
        { "weight": 145, "reps": 12 }
      ]
    }
  }
}
```

**Test Steps:**
1. [ ] Load test data fixture (Scenario 4)
2. [ ] Navigate to `/week2.html`
3. [ ] Locate suggestion card

**Expected Results:**
- [ ] ✅ Suggestion shows: **145 lbs** (no increase)
- [ ] ✅ Confidence indicator: **Low** (gray/neutral badge)
- [ ] ✅ Rationale: "Maintain current weight to build strength" or similar
- [ ] ✅ Accept button still functional (maintains 145 lbs)
- [ ] ✅ No negative weight suggestions

**Test Steps - Edge Case:**
4. [ ] Verify suggestion does not recommend *decreasing* weight
5. [ ] Verify positive/encouraging messaging despite no increase

**Expected Results - UX Validation:**
- [ ] ✅ No discouraging language in suggestion
- [ ] ✅ Maintains motivation with positive framing
- [ ] ✅ Option to modify allows user to decrease if needed

**Pass/Fail:** ___________
**Notes:** ___________________________________________

---

### Scenario 5: Dismiss and Recall Suggestion

**Objective:** Test suggestion persistence across page refreshes and workout progression.

**Pre-Condition Test Data (Week 1):**
```json
{
  "week1": {
    "Barbell Hip Thrust": {
      "sets": [
        { "weight": 145, "reps": 20 },
        { "weight": 145, "reps": 20 }
      ]
    }
  }
}
```

**Test Steps - Dismiss:**
1. [ ] Load test data (Scenario 5)
2. [ ] Navigate to `/week2.html`
3. [ ] Locate suggestion card (should show 155 lbs)
4. [ ] Click "Dismiss" button/icon
5. [ ] Observe suggestion card disappears

**Expected Results - Dismiss:**
- [ ] ✅ Suggestion card hides immediately
- [ ] ✅ localStorage saves dismissed state
- [ ] ✅ Dismiss animation smooth (<200ms)
- [ ] ✅ No JavaScript errors

**Test Steps - Persistence Check:**
6. [ ] Refresh page (F5)
7. [ ] Scroll to Barbell Hip Thrust section
8. [ ] Verify suggestion does NOT reappear

**Expected Results - Refresh:**
- [ ] ✅ Suggestion stays dismissed
- [ ] ✅ Weight inputs remain empty (user dismissed, so no auto-fill)
- [ ] ✅ No console errors

**Test Steps - Complete Week 2:**
9. [ ] Manually enter weight for Week 2 sets (e.g., 160 lbs)
10. [ ] Log 2 sets with reps (e.g., 18, 19)
11. [ ] Navigate to `/week3.html` (if exists) or simulate Week 3

**Expected Results - Week 3 Suggestion:**
- [ ] ✅ NEW suggestion appears for Week 3
- [ ] ✅ Suggestion based on Week 2 data (160 lbs → 165 lbs)
- [ ] ✅ Dismissed Week 2 suggestion does not affect Week 3
- [ ] ✅ Suggestion calculation uses most recent workout (Week 2)

**Pass/Fail:** ___________
**Screenshot:** [ ] Dismissed [ ] Week 3 suggestion

---

### Scenario 6: Modify Suggestion Weight

**Objective:** Test custom weight modification flow.

**Pre-Condition Test Data (Week 1):**
```json
{
  "week1": {
    "Barbell Hip Thrust": {
      "sets": [
        { "weight": 145, "reps": 20 },
        { "weight": 145, "reps": 20 }
      ]
    }
  }
}
```

**Test Steps:**
1. [ ] Load test data (Scenario 6)
2. [ ] Navigate to `/week2.html`
3. [ ] Locate suggestion card (shows 155 lbs)
4. [ ] Click "Modify" button

**Expected Results - Modify UI:**
- [ ] ✅ Input field appears for custom weight entry
- [ ] ✅ Input pre-filled with suggested weight (155)
- [ ] ✅ Input focused automatically
- [ ] ✅ "Apply" and "Cancel" buttons appear
- [ ] ✅ Accept/Dismiss buttons disabled or hidden

**Test Steps - Enter Custom Weight:**
5. [ ] Clear input field
6. [ ] Enter custom weight: **152** lbs
7. [ ] Click "Apply" button

**Expected Results - Custom Weight Applied:**
- [ ] ✅ All set weight inputs auto-filled with **152 lbs**
- [ ] ✅ Suggestion card shows "Custom weight applied" or disappears
- [ ] ✅ localStorage saves dismissed suggestion
- [ ] ✅ Custom weight saves to workout data

**Test Steps - Cancel Modification:**
8. [ ] Refresh page
9. [ ] Load new test data (repeat steps 1-4)
10. [ ] Click "Modify" button
11. [ ] Click "Cancel" button

**Expected Results - Cancel:**
- [ ] ✅ Modify UI closes
- [ ] ✅ Suggestion card returns to original state (155 lbs)
- [ ] ✅ No changes to weight inputs
- [ ] ✅ No localStorage updates

**Test Steps - Validation:**
12. [ ] Repeat modify flow (steps 4-5)
13. [ ] Enter invalid weight: **-50** lbs
14. [ ] Attempt to apply

**Expected Results - Validation:**
- [ ] ✅ Error message displays: "Weight must be positive"
- [ ] ✅ Apply button disabled for invalid input
- [ ] ✅ Input field shows error state (red border)
- [ ] ✅ No localStorage corruption

**Pass/Fail:** ___________
**Screenshot:** [ ] Modify UI [ ] Custom weight applied

---

## Mobile Device Testing

### iOS Safari (iPhone 12+, iOS 15+)

**Device Specifications:**
- [ ] iPhone 12 (iOS 15.0+)
- [ ] iPhone 13 Pro (iOS 16.0+)
- [ ] iPhone 14 (iOS 17.0+)

**Test Scenarios:**
1. [ ] **Touch Interactions**
   - [ ] ✅ Tap "Accept Suggestion" button (target size >44x44px)
   - [ ] ✅ Tap "Dismiss" icon (target size adequate)
   - [ ] ✅ Tap "Modify" opens keyboard smoothly
   - [ ] ✅ No accidental touches on adjacent UI elements

2. [ ] **Viewport and Layout**
   - [ ] ✅ Suggestion card responsive (portrait mode)
   - [ ] ✅ Suggestion card responsive (landscape mode)
   - [ ] ✅ No horizontal scrolling required
   - [ ] ✅ Text readable without zooming (font size ≥16px)

3. [ ] **Keyboard and Input**
   - [ ] ✅ Number keyboard appears for weight input
   - [ ] ✅ Input field not obscured by keyboard
   - [ ] ✅ Return key dismisses keyboard
   - [ ] ✅ No viewport jumping when keyboard appears

4. [ ] **Offline Mode**
   - [ ] ✅ Enable airplane mode
   - [ ] ✅ Navigate to Week 2
   - [ ] ✅ Suggestions still load from localStorage
   - [ ] ✅ Accept/Dismiss actions work offline
   - [ ] ✅ Service worker serves cached assets

5. [ ] **PWA Installation**
   - [ ] ✅ Add to Home Screen
   - [ ] ✅ Launch from home screen
   - [ ] ✅ Suggestions work in standalone mode
   - [ ] ✅ No browser UI interference

6. [ ] **Performance**
   - [ ] ✅ Page load <2 seconds on 4G
   - [ ] ✅ Suggestion render <100ms
   - [ ] ✅ Auto-fill <50ms (60fps)
   - [ ] ✅ No jank during animations

**Pass/Fail:** ___________
**Device Tested:** ___________
**iOS Version:** ___________

---

### Android Chrome (Samsung Galaxy S21+, Pixel 6+)

**Device Specifications:**
- [ ] Samsung Galaxy S21 (Android 12+)
- [ ] Google Pixel 6 (Android 13+)
- [ ] Samsung Galaxy S23 (Android 14+)

**Test Scenarios:**
1. [ ] **Touch Interactions**
   - [ ] ✅ Haptic feedback on button press (if implemented)
   - [ ] ✅ Long-press does not trigger context menu
   - [ ] ✅ Swipe gestures do not interfere with scroll

2. [ ] **Viewport and Layout**
   - [ ] ✅ Suggestion card fits various screen sizes (5.8"-6.7")
   - [ ] ✅ Portrait and landscape modes tested
   - [ ] ✅ Status bar color matches app theme

3. [ ] **Keyboard and Input**
   - [ ] ✅ Number pad appears for weight input
   - [ ] ✅ Input autocomplete disabled (no password suggestions)
   - [ ] ✅ No autocorrect interference

4. [ ] **Offline Mode**
   - [ ] ✅ Same tests as iOS (see above)
   - [ ] ✅ Background sync working (if implemented)

5. [ ] **PWA Installation**
   - [ ] ✅ "Add to Home Screen" banner appears
   - [ ] ✅ Install prompt functional
   - [ ] ✅ Standalone mode works correctly

6. [ ] **Performance**
   - [ ] ✅ Page load <2 seconds on 4G
   - [ ] ✅ Smooth animations (60fps)
   - [ ] ✅ No memory leaks (check Chrome DevTools)

**Pass/Fail:** ___________
**Device Tested:** ___________
**Android Version:** ___________

---

### Cross-Platform Testing

**Test Scenarios:**
1. [ ] **Data Sync**
   - [ ] ✅ Complete Week 1 on iOS
   - [ ] ✅ Export localStorage data
   - [ ] ✅ Import to Android device
   - [ ] ✅ Verify suggestions appear correctly on Android

2. [ ] **Orientation Changes**
   - [ ] ✅ Rotate device during suggestion display
   - [ ] ✅ Verify no layout breaks
   - [ ] ✅ Verify no data loss

3. [ ] **Browser Back Button**
   - [ ] ✅ Accept suggestion on Week 2
   - [ ] ✅ Press back button
   - [ ] ✅ Return to Week 2
   - [ ] ✅ Verify suggestion stays dismissed

**Pass/Fail:** ___________

---

## Performance Testing

### Rendering Performance

**Test Setup:**
- [ ] Open Chrome DevTools → Performance tab
- [ ] Start recording
- [ ] Navigate to `/week2.html`
- [ ] Stop recording after page fully loaded

**Metrics to Measure:**
1. [ ] **Suggestion Card Render Time**
   - Target: <100ms
   - Actual: ___________ ms
   - [ ] ✅ Pass (<100ms) / [ ] ❌ Fail (≥100ms)

2. [ ] **Auto-Fill Weight Inputs**
   - Target: <50ms
   - Actual: ___________ ms
   - [ ] ✅ Pass (<50ms) / [ ] ❌ Fail (≥50ms)

3. [ ] **First Contentful Paint (FCP)**
   - Target: <1.8s
   - Actual: ___________ s
   - [ ] ✅ Pass (<1.8s) / [ ] ❌ Fail (≥1.8s)

4. [ ] **Largest Contentful Paint (LCP)**
   - Target: <2.5s
   - Actual: ___________ s
   - [ ] ✅ Pass (<2.5s) / [ ] ❌ Fail (≥2.5s)

5. [ ] **Time to Interactive (TTI)**
   - Target: <3.8s
   - Actual: ___________ s
   - [ ] ✅ Pass (<3.8s) / [ ] ❌ Fail (≥3.8s)

**Lighthouse Audit:**
- [ ] Run Lighthouse audit (mobile)
- Performance Score: ___________ / 100
- [ ] ✅ Pass (≥90) / [ ] ❌ Fail (<90)

---

### localStorage Performance

**Test Setup:**
```javascript
// Run in browser console
console.time('localStorage-read');
const data = JSON.parse(localStorage.getItem('workoutData'));
console.timeEnd('localStorage-read');

console.time('localStorage-write');
localStorage.setItem('workoutData', JSON.stringify(data));
console.timeEnd('localStorage-write');
```

**Metrics:**
1. [ ] **Read Speed**
   - Target: <5ms
   - Actual: ___________ ms
   - [ ] ✅ Pass (<5ms) / [ ] ❌ Fail (≥5ms)

2. [ ] **Write Speed**
   - Target: <10ms
   - Actual: ___________ ms
   - [ ] ✅ Pass (<10ms) / [ ] ❌ Fail (≥10ms)

3. [ ] **Storage Quota**
   - Check available space: `navigator.storage.estimate()`
   - Current usage: ___________ KB
   - [ ] ✅ Pass (<5MB used)

---

### Memory Usage

**Test Setup:**
- [ ] Open DevTools → Memory tab
- [ ] Take heap snapshot before test
- [ ] Complete full workout flow (Week 1 → Week 2 suggestions → Accept)
- [ ] Take heap snapshot after test

**Metrics:**
1. [ ] **Heap Size Increase**
   - Target: <10MB increase
   - Actual: ___________ MB
   - [ ] ✅ Pass (<10MB) / [ ] ❌ Fail (≥10MB)

2. [ ] **Detached DOM Nodes**
   - Target: 0 detached nodes
   - Actual: ___________ nodes
   - [ ] ✅ Pass (0) / [ ] ❌ Fail (>0)

3. [ ] **Memory Leaks**
   - [ ] ✅ No memory leaks detected
   - [ ] ❌ Memory leak found: ___________________________

---

## Edge Case Testing

### Scenario 7: Incomplete Week 1 Data

**Test Data:**
```json
{
  "week1": {
    "Barbell Hip Thrust": {
      "sets": [
        { "weight": 145, "reps": 20 }
        // Missing second set
      ]
    }
  }
}
```

**Test Steps:**
1. [ ] Load incomplete data
2. [ ] Navigate to Week 2
3. [ ] Observe suggestion behavior

**Expected Results:**
- [ ] ✅ Suggestion appears based on single set (if algorithm allows)
- [ ] ✅ OR: "Insufficient data" message displays
- [ ] ✅ No JavaScript errors
- [ ] ✅ Does not crash or freeze page

**Pass/Fail:** ___________

---

### Scenario 8: Corrupted localStorage Data

**Test Data:**
```javascript
// Corrupt data structure
localStorage.setItem('workoutData', '{"week1":{"Barbell Hip Thrust":INVALID}}');
```

**Test Steps:**
1. [ ] Inject corrupted data
2. [ ] Navigate to Week 2
3. [ ] Observe error handling

**Expected Results:**
- [ ] ✅ Page loads without crashing
- [ ] ✅ Console error logged (graceful degradation)
- [ ] ✅ Suggestion card not displayed
- [ ] ✅ User can still log workout manually
- [ ] ✅ Option to "Reset Data" displayed (if implemented)

**Pass/Fail:** ___________

---

### Scenario 9: Failed Sets (0 Reps)

**Test Data:**
```json
{
  "week1": {
    "Barbell Hip Thrust": {
      "sets": [
        { "weight": 145, "reps": 0 },
        { "weight": 145, "reps": 0 }
      ]
    }
  }
}
```

**Test Steps:**
1. [ ] Load failed sets data
2. [ ] Navigate to Week 2

**Expected Results:**
- [ ] ✅ No suggestion appears (cannot calculate increase from 0)
- [ ] ✅ OR: Suggestion to decrease weight
- [ ] ✅ Helpful message: "Try lowering weight" or similar
- [ ] ✅ No division by zero errors

**Pass/Fail:** ___________

---

### Scenario 10: Very High Weights (300+ lbs)

**Test Data:**
```json
{
  "week1": {
    "Barbell Hip Thrust": {
      "sets": [
        { "weight": 350, "reps": 20 },
        { "weight": 350, "reps": 20 }
      ]
    }
  }
}
```

**Test Steps:**
1. [ ] Load high-weight data
2. [ ] Navigate to Week 2
3. [ ] Check suggested weight

**Expected Results:**
- [ ] ✅ Suggestion calculates correctly (360 lbs)
- [ ] ✅ No integer overflow errors
- [ ] ✅ Weight input accepts 3-digit numbers
- [ ] ✅ UI layout does not break with large numbers

**Pass/Fail:** ___________

---

### Scenario 11: Very Low Weights (<10 lbs)

**Test Data:**
```json
{
  "week1": {
    "Barbell Hip Thrust": {
      "sets": [
        { "weight": 5, "reps": 20 },
        { "weight": 5, "reps": 20 }
      ]
    }
  }
}
```

**Test Steps:**
1. [ ] Load low-weight data
2. [ ] Navigate to Week 2

**Expected Results:**
- [ ] ✅ Suggestion shows 7.5 lbs (2.5 lb increment) OR 10 lbs (5 lb increment)
- [ ] ✅ Algorithm handles fractional weights (if applicable)
- [ ] ✅ Suggestion makes sense for low starting weights
- [ ] ✅ No negative weight suggestions

**Pass/Fail:** ___________

---

### Scenario 12: Switching Between Programs

**Test Steps:**
1. [ ] Complete Week 1 of Program A (Hip Thrust)
2. [ ] Navigate to Week 2 of Program A
3. [ ] Verify suggestion appears
4. [ ] Switch to Program B (different exercises)
5. [ ] Return to Program A, Week 2

**Expected Results:**
- [ ] ✅ Program A suggestion persists
- [ ] ✅ No cross-program data contamination
- [ ] ✅ localStorage keys properly namespaced
- [ ] ✅ Switching programs does not corrupt data

**Pass/Fail:** ___________

---

## Regression Testing

### Existing Functionality Verification

**Goal:** Ensure new progressive overload code does not break existing features.

#### Week 1 Workout Logging

**Test Steps:**
1. [ ] Navigate to `/week1.html`
2. [ ] Log a complete workout:
   - [ ] Enter weights for all exercises
   - [ ] Enter reps for all sets
   - [ ] Click "Save Workout" or equivalent
3. [ ] Verify data saves to localStorage
4. [ ] Refresh page
5. [ ] Verify data persists

**Expected Results:**
- [ ] ✅ Week 1 logging works exactly as before
- [ ] ✅ No new bugs introduced
- [ ] ✅ Save button functional
- [ ] ✅ Data format unchanged (backward compatible)

**Pass/Fail:** ___________

---

#### Offline Mode Functionality

**Test Steps:**
1. [ ] Enable offline mode (airplane mode or DevTools offline)
2. [ ] Navigate to Week 1
3. [ ] Log workout
4. [ ] Navigate to Week 2
5. [ ] View suggestions

**Expected Results:**
- [ ] ✅ Service worker serves cached pages
- [ ] ✅ localStorage accessible offline
- [ ] ✅ All features work without network
- [ ] ✅ No network error messages

**Pass/Fail:** ___________

---

#### Service Worker Updates

**Test Steps:**
1. [ ] Check service worker version in DevTools
2. [ ] Deploy new version of progressive overload feature
3. [ ] Refresh page
4. [ ] Verify service worker updates

**Expected Results:**
- [ ] ✅ Service worker updates without manual intervention
- [ ] ✅ New features load after update
- [ ] ✅ No "old version" caching issues
- [ ] ✅ Update notification displayed (if implemented)

**Pass/Fail:** ___________

---

#### Cross-Browser Compatibility

**Test Browsers:**
1. [ ] **Chrome 120+** (Desktop + Mobile)
   - All scenarios pass: [ ] ✅ / [ ] ❌

2. [ ] **Firefox 120+** (Desktop + Mobile)
   - All scenarios pass: [ ] ✅ / [ ] ❌

3. [ ] **Safari 17+** (Desktop + Mobile)
   - All scenarios pass: [ ] ✅ / [ ] ❌

4. [ ] **Edge 120+** (Desktop)
   - All scenarios pass: [ ] ✅ / [ ] ❌

**Known Issues:**
- Browser: ___________
- Issue: ___________________________________________

---

## Test Data Fixtures

### Fixture 1: Strong Performance (Scenario 2)
```javascript
// Copy-paste into browser console to load test data
const scenario2Data = {
  "week1": {
    "Barbell Hip Thrust": {
      "sets": [
        { "weight": 145, "reps": 20, "date": "2025-10-21" },
        { "weight": 145, "reps": 20, "date": "2025-10-21" }
      ]
    },
    "Cable Pull Through": {
      "sets": [
        { "weight": 100, "reps": 15, "date": "2025-10-21" },
        { "weight": 100, "reps": 15, "date": "2025-10-21" }
      ]
    }
  }
};
localStorage.setItem('workoutData', JSON.stringify(scenario2Data));
console.log('Scenario 2 test data loaded');
```

### Fixture 2: Moderate Performance (Scenario 3)
```javascript
const scenario3Data = {
  "week1": {
    "Barbell Hip Thrust": {
      "sets": [
        { "weight": 145, "reps": 18, "date": "2025-10-21" },
        { "weight": 145, "reps": 19, "date": "2025-10-21" }
      ]
    }
  }
};
localStorage.setItem('workoutData', JSON.stringify(scenario3Data));
console.log('Scenario 3 test data loaded');
```

### Fixture 3: Struggled Performance (Scenario 4)
```javascript
const scenario4Data = {
  "week1": {
    "Barbell Hip Thrust": {
      "sets": [
        { "weight": 145, "reps": 12, "date": "2025-10-21" },
        { "weight": 145, "reps": 12, "date": "2025-10-21" }
      ]
    }
  }
};
localStorage.setItem('workoutData', JSON.stringify(scenario4Data));
console.log('Scenario 4 test data loaded');
```

### Fixture 4: Multiple Exercises (Full Workout)
```javascript
const fullWorkoutData = {
  "week1": {
    "Barbell Hip Thrust": {
      "sets": [
        { "weight": 145, "reps": 20, "date": "2025-10-21" },
        { "weight": 145, "reps": 20, "date": "2025-10-21" }
      ]
    },
    "Cable Pull Through": {
      "sets": [
        { "weight": 100, "reps": 14, "date": "2025-10-21" },
        { "weight": 100, "reps": 14, "date": "2025-10-21" }
      ]
    },
    "Romanian Deadlift": {
      "sets": [
        { "weight": 95, "reps": 18, "date": "2025-10-21" },
        { "weight": 95, "reps": 19, "date": "2025-10-21" }
      ]
    },
    "Goblet Squat": {
      "sets": [
        { "weight": 35, "reps": 17, "date": "2025-10-21" },
        { "weight": 35, "reps": 18, "date": "2025-10-21" }
      ]
    },
    "Leg Extension": {
      "sets": [
        { "weight": 70, "reps": 12, "date": "2025-10-21" },
        { "weight": 70, "reps": 13, "date": "2025-10-21" }
      ]
    },
    "Seated Leg Curl": {
      "sets": [
        { "weight": 60, "reps": 15, "date": "2025-10-21" },
        { "weight": 60, "reps": 15, "date": "2025-10-21" }
      ]
    },
    "Walking Lunge": {
      "sets": [
        { "weight": 25, "reps": 20, "date": "2025-10-21" },
        { "weight": 25, "reps": 20, "date": "2025-10-21" }
      ]
    },
    "Calf Raise": {
      "sets": [
        { "weight": 80, "reps": 19, "date": "2025-10-21" },
        { "weight": 80, "reps": 20, "date": "2025-10-21" }
      ]
    }
  }
};
localStorage.setItem('workoutData', JSON.stringify(fullWorkoutData));
console.log('Full workout test data loaded');
```

### Fixture 5: Edge Cases
```javascript
const edgeCasesData = {
  "week1": {
    // Incomplete data (missing sets)
    "Barbell Hip Thrust": {
      "sets": [
        { "weight": 145, "reps": 20, "date": "2025-10-21" }
      ]
    },
    // Failed sets
    "Cable Pull Through": {
      "sets": [
        { "weight": 100, "reps": 0, "date": "2025-10-21" },
        { "weight": 100, "reps": 0, "date": "2025-10-21" }
      ]
    },
    // Very high weight
    "Romanian Deadlift": {
      "sets": [
        { "weight": 350, "reps": 20, "date": "2025-10-21" },
        { "weight": 350, "reps": 20, "date": "2025-10-21" }
      ]
    },
    // Very low weight
    "Goblet Squat": {
      "sets": [
        { "weight": 5, "reps": 20, "date": "2025-10-21" },
        { "weight": 5, "reps": 20, "date": "2025-10-21" }
      ]
    }
  }
};
localStorage.setItem('workoutData', JSON.stringify(edgeCasesData));
console.log('Edge cases test data loaded');
```

---

## Bug Report Template

### Bug Report #______

**Date:** ___________
**Tester:** ___________
**Browser/Device:** ___________
**Test Scenario:** ___________

**Summary:**
Brief description of the bug (1-2 sentences)

**Steps to Reproduce:**
1.
2.
3.

**Expected Behavior:**


**Actual Behavior:**


**Screenshots/Videos:**
[ ] Screenshot attached
[ ] Video attached
[ ] Console log attached

**Console Errors:**
```
(paste console errors here)
```

**localStorage State:**
```json
(paste localStorage.getItem('workoutData') output)
```

**Severity:**
[ ] Critical (blocks testing)
[ ] High (major feature broken)
[ ] Medium (workaround exists)
[ ] Low (cosmetic issue)

**Priority:**
[ ] P0 (fix immediately)
[ ] P1 (fix before release)
[ ] P2 (fix in next iteration)
[ ] P3 (backlog)

**Additional Notes:**


---

## Screenshot/Video Capture Checklist

### Required Screenshots

**Desktop (Chrome DevTools Mobile View):**
- [ ] Week 2 page load (no suggestions visible)
- [ ] Suggestion card - High confidence (+10 lbs)
- [ ] Suggestion card - Medium confidence (+5 lbs)
- [ ] Suggestion card - Low confidence (same weight)
- [ ] "Accept Suggestion" button clicked (before/after)
- [ ] "Modify" button UI open
- [ ] Custom weight entered
- [ ] Suggestion dismissed
- [ ] All weight inputs auto-filled
- [ ] Mobile viewport (375x667 - iPhone SE)
- [ ] Tablet viewport (768x1024 - iPad)

**Mobile (Real Devices):**
- [ ] iOS Safari - Portrait mode
- [ ] iOS Safari - Landscape mode
- [ ] Android Chrome - Portrait mode
- [ ] Android Chrome - Landscape mode
- [ ] PWA icon on home screen
- [ ] PWA launched in standalone mode

**Performance Screenshots:**
- [ ] Chrome DevTools Performance tab (full recording)
- [ ] Lighthouse audit results
- [ ] Network tab (offline mode)
- [ ] Application tab (localStorage view)
- [ ] Memory tab (heap snapshot)

### Required Videos

**User Journey Videos (30-60 seconds each):**
- [ ] First-time user → No Week 1 data → Complete Week 1 → Return to Week 2 → Suggestion appears
- [ ] Accept suggestion → Auto-fill animation → Weights populate
- [ ] Modify suggestion → Enter custom weight → Weights update
- [ ] Dismiss suggestion → Refresh page → Suggestion stays dismissed
- [ ] Full workout flow: Week 1 complete → Week 2 suggestions → Complete Week 2 → Week 3 suggestions

**Performance Videos:**
- [ ] 60fps recording of auto-fill animation
- [ ] Screen recording of mobile device testing (iOS)
- [ ] Screen recording of mobile device testing (Android)

**Bug Videos (if applicable):**
- [ ] Any bugs discovered during testing

### Video Naming Convention
```
YYYYMMDD_scenario-name_device_browser.mp4

Examples:
20251028_accept-suggestion_iphone13_safari.mp4
20251028_auto-fill-animation_desktop_chrome.mp4
20251028_offline-mode_pixel6_chrome.mp4
```

---

## Test Execution Log

**Test Session #1**

| Date | Tester | Scenarios Completed | Pass Rate | Bugs Found | Notes |
|------|--------|-------------------|-----------|------------|-------|
| 2025-10-28 | _________ | ___/12 | ___% | ___ | _____________ |
| | | | | | |
| | | | | | |

**Overall Pass Rate:** ___________
**Critical Bugs:** ___________
**Recommendation:** [ ] Approve for production [ ] Additional testing required [ ] Major fixes needed

---

## Appendix: Test Automation Potential

### Candidate Tests for Automation (Phase 3)

1. **Unit Tests (Jest/Vitest):**
   - [ ] `calculateWeightIncrease()` function with various rep ranges
   - [ ] `getConfidenceLevel()` function
   - [ ] `dismissSuggestion()` localStorage update
   - [ ] `acceptSuggestion()` auto-fill logic

2. **Integration Tests (Playwright/Cypress):**
   - [ ] Full user journey (Week 1 → Week 2)
   - [ ] Accept suggestion flow
   - [ ] Modify suggestion flow
   - [ ] Dismiss and recall

3. **Visual Regression Tests (Percy/Chromatic):**
   - [ ] Suggestion card appearance
   - [ ] Mobile responsive layouts
   - [ ] Dark mode (if implemented)

4. **Performance Tests (Lighthouse CI):**
   - [ ] Automated Lighthouse audits on every commit
   - [ ] Performance budget enforcement

**Automation Priority:** High
**Estimated Effort:** 2-3 weeks
**ROI:** High (regression testing coverage for future iterations)

---

**Document Version:** 1.0
**Last Updated:** 2025-10-28
**Next Review:** After Phase 2 testing completion

---

## Quick Reference: Pass/Fail Criteria

✅ **PASS:** All expected results met, no critical bugs
⚠️ **PASS WITH NOTES:** Minor issues found, workarounds exist
❌ **FAIL:** Critical bugs found, feature unusable

**Minimum Pass Threshold:** 95% of test scenarios pass (11/12 scenarios)

---

**End of Test Plan**
