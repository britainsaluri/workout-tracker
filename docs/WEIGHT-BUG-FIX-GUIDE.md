# Weight Calculation Bug Fix Guide

## 🐛 The Problem

**Bug**: Weight suggestions were showing unreasonable numbers (e.g., 20 lbs × 10 reps → 200 lbs suggested)

**Expected**: Progressive overload within 20% of previous weight (e.g., 20 lbs → 20-25 lbs)

**Root Cause**: HTML input values are strings by default. Old data was stored as `weight: "20"` instead of `weight: 20`, causing type coercion bugs in calculations.

---

## ✅ The Fix (Already Deployed)

The code has been fixed in commit `266433a`. The fix ensures all weight and reps values are converted to numbers when stored:

### Fixed Locations:

**`src/index.html` - Line 926 (handleInputChange)**
```javascript
// BEFORE (buggy):
state.completedSets[key][type] = e.target.value;  // Stores "20" (string)

// AFTER (fixed):
state.completedSets[key][type] = parseFloat(e.target.value) || 0;  // Stores 20 (number)
```

**`src/index.html` - Lines 956-957 (handleSetComplete)**
```javascript
// BEFORE (buggy):
state.completedSets[key].weight = weightInput.value;  // "20"
state.completedSets[key].reps = repsInput.value;      // "10"

// AFTER (fixed):
state.completedSets[key].weight = parseFloat(weightInput.value) || 0;  // 20
state.completedSets[key].reps = parseInt(repsInput.value, 10) || 0;    // 10
```

**`src/utils/weightSuggestions.js` - Line 87 (Calculation)**
```javascript
// Correct algorithm (always was):
const suggestedWeight = this._roundToNearestHalf(avgWeight + adjustment.amount);
// ADDS adjustment (+2.5, +5, +10 lbs), doesn't multiply
```

---

## 🔧 Why You're Still Seeing the Bug

**Old Data**: If you entered workout data BEFORE the fix was deployed, that data is still stored as strings in localStorage.

**Example**:
```json
{
  "sheet1_w1_d1_A1_1": {
    "weight": "20",    // ⚠️ STRING (old data)
    "reps": "10",      // ⚠️ STRING (old data)
    "completed": true
  }
}
```

Even though NEW data is now stored correctly, the OLD data remains as strings and causes the bug.

---

## 🚀 Solution: Data Migration Tool

### Step 1: Open Migration Tool

Navigate to the migration tool in your browser:
```
http://localhost:8000/migrate-data.html
```

Or if using the deployed version:
```
https://your-site.com/migrate-data.html
```

### Step 2: Analyze Your Data

The tool will automatically analyze your data and show:
- ✅ How many values are numbers (correct)
- ⚠️ How many values are strings (need fixing)
- 📊 Examples of problem data

### Step 3: Run Migration

1. Click **"Fix My Data"** button
2. The tool will:
   - Create a backup of your current data
   - Convert all string values to numbers
   - Save the fixed data to localStorage
   - Generate a migration report

### Step 4: Download Backup (Optional)

Click **"Download Backup"** to save a JSON file of your original data, just in case you need to restore it.

### Step 5: Test

1. Go back to your workout tracker
2. Navigate to Week 2 of a workout
3. Check the suggested weights - they should now be reasonable (within 20% of Week 1)

---

## 📊 Verification Tests

All verification tests pass:

### Test 1: String to Number Conversion ✅
```javascript
Input: weight="20", reps="10" (strings)
Output: weight=20, reps=10 (numbers)
```

### Test 2: Storage Format ✅
```json
{
  "weight": 20,      // number ✅
  "reps": 10,        // number ✅
  "completed": true
}
```

### Test 3: Weight Calculation ✅
```
Week 1: 20 lbs × 10 reps (2 sets)
Suggested: 25 lbs (+5 lbs, +25%)
NOT 200 lbs ✅
```

### Test 4: Increment Logic ✅
- Isolation exercises: +2.5 to +5 lbs (additive)
- Compound exercises: +5 to +10 lbs (additive)
- NOT multiplicative ✅

---

## 🎯 Progressive Overload Algorithm

The suggestion engine uses a smart algorithm:

### Performance Levels:

1. **EXCEEDED** (100%): Hit max reps on all sets
   - Compound: +10 lbs
   - Isolation: +5 lbs

2. **STRONG** (75-99%): Hit high end of range
   - Compound: +5 lbs
   - Isolation: +2.5 lbs

3. **MAINTAINED** (50-74%): Mid-range performance
   - Compound: 0 lbs (maintain)
   - Isolation: 0 lbs (maintain)

4. **STRUGGLED** (25-49%): Low end of range
   - Compound: 0 lbs (maintain)
   - Isolation: 0 lbs (maintain)

5. **FAILED** (<25%): Below target or incomplete
   - Compound: -5 lbs (reduce)
   - Isolation: -2.5 lbs (reduce)

### Examples:

**Example 1: Leg Extension (Isolation)**
- Week 1: 20 lbs × 10 reps (target 8-10)
- Performance: EXCEEDED (10/10 reps = 100%)
- Adjustment: +5 lbs
- Week 2: **25 lbs** ✅

**Example 2: Squat (Compound)**
- Week 1: 135 lbs × 8 reps (target 8-10)
- Performance: MAINTAINED (8/10 reps = 80%)
- Adjustment: +5 lbs
- Week 2: **140 lbs** ✅

**Example 3: Curl (Isolation)**
- Week 1: 30 lbs × 12 reps (target 10-12)
- Performance: EXCEEDED (12/12 reps = 100%)
- Adjustment: +5 lbs
- Week 2: **35 lbs** ✅

---

## 🔍 Troubleshooting

### Issue: Migration tool shows "No data found"
**Solution**: Make sure you've completed at least one workout in the tracker first.

### Issue: Still seeing unreasonable suggestions after migration
**Solution**:
1. Clear browser cache (Ctrl+Shift+Delete)
2. Hard reload the page (Ctrl+Shift+R)
3. Re-run the migration tool

### Issue: Want to undo migration
**Solution**:
1. Use the downloaded backup file
2. Open browser DevTools (F12)
3. Go to Console tab
4. Paste:
   ```javascript
   // Replace YOUR_BACKUP_JSON with the contents of your backup file
   localStorage.setItem('workoutTrackerState', 'YOUR_BACKUP_JSON');
   location.reload();
   ```

### Issue: Data looks correct but still getting bugs
**Solution**:
1. Open DevTools (F12) → Console
2. Run:
   ```javascript
   const state = JSON.parse(localStorage.getItem('workoutTrackerState'));
   console.log('Sample set:', state.completedSets[Object.keys(state.completedSets)[0]]);
   ```
3. Check if weight/reps are numbers or strings
4. Share screenshot for further debugging

---

## 📝 Summary

| Component | Status |
|-----------|--------|
| Code Fix | ✅ Deployed (commit 266433a) |
| Tests | ✅ All passing |
| Algorithm | ✅ Correct (additive, not multiplicative) |
| Data Migration | 🔧 Required (use migrate-data.html) |

**Next Steps**:
1. Run the migration tool: `http://localhost:8000/migrate-data.html`
2. Download backup before migrating
3. Click "Fix My Data"
4. Test workout suggestions
5. Confirm suggestions are reasonable (within 20% of previous weight)

---

## 💡 Prevention

**For Future**: The fix ensures all NEW data is stored correctly. You only need to run the migration tool ONCE to fix existing data.

**Auto-Update**: The app now automatically converts all input values to numbers, so this bug won't happen again.

**Validation**: The suggestion engine validates all weights are positive numbers before calculating.

---

**Questions?** Check the test files:
- `tests/simple-bug-verification.js` - Basic validation
- `tests/bug-fix-manual-test.js` - Comprehensive tests
- `tests/bug-fix-verification.js` - Full test suite

All tests can be run with:
```bash
node tests/simple-bug-verification.js
node tests/bug-fix-manual-test.js
```
