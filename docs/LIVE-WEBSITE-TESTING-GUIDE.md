# 🧪 Live Website Testing Guide

## Your Live Website is Now Deployed! 🎉

**Production URL:**
https://workout-tracker-m2gt9kmru-britain-saluris-projects.vercel.app

---

## ✅ What Was Deployed

All fixes from the swarm analysis:
- ✅ parseFloat/parseInt number conversion (commit 266433a)
- ✅ Auto-migration for old data (commit 0abcacf)
- ✅ Comprehensive test suite (commit 2a61015)
- ✅ All swarm documentation

---

## 🧪 Step-by-Step Testing on Live Site

### Test 1: Auto-Migration (2 minutes)

1. **Open the live site:**
   ```
   https://workout-tracker-m2gt9kmru-britain-saluris-projects.vercel.app
   ```

2. **Open Browser DevTools:**
   - Press F12 (Windows/Linux)
   - Press Cmd+Option+I (Mac)
   - Go to "Console" tab

3. **Watch for auto-migration:**
   - If you have old data, you'll see:
   - Toast notification: "Data migrated: Fixed X values"
   - Console log: `[Migration] ✅ Migrated X values from strings to numbers`

4. **If no migration message:**
   - That means you don't have old data (all good!)
   - Or you're using a different browser/device

---

### Test 2: The Critical Bug Fix (5 minutes)

**Test the exact scenario you reported: 20 lbs × 10 reps**

1. **Navigate to Week 1, Day 1**

2. **Find any isolation exercise** (Leg Extension, Curl, etc.)

3. **Enter Week 1 data:**
   - Set 1: 20 lbs, 10 reps (click checkmark ✓)
   - Set 2: 20 lbs, 10 reps (click checkmark ✓)

4. **Navigate to Week 2, Day 1**

5. **Look for the weight suggestion card:**
   - Should show: **22.5 lbs** or **25 lbs**
   - Should NOT show: ~~200 lbs~~ ❌

6. **Verify the suggestion is reasonable:**
   - Within 20-25 lbs range ✅
   - Shows reason: "Perfect form!" or similar ✅

---

### Test 3: Verify Data Type (DevTools Check)

1. **Open DevTools Console** (F12)

2. **Run this command:**
   ```javascript
   const state = JSON.parse(localStorage.getItem('workoutTrackerState'));
   const set1 = state.completedSets['sheet1_w1_d1_A1_1'];
   console.log('Weight:', set1.weight, '(Type:', typeof set1.weight + ')');
   console.log('Reps:', set1.reps, '(Type:', typeof set1.reps + ')');
   ```

3. **Expected output:**
   ```
   Weight: 20 (Type: number)
   Reps: 10 (Type: number)
   ```

4. **If you see strings:**
   - Refresh the page to trigger auto-migration
   - Check console for migration messages

---

### Test 4: Different Weight Ranges

Try other scenarios to ensure robustness:

| Week 1 | Exercise Type | Expected Week 2 |
|--------|--------------|-----------------|
| 50 lbs × 8 reps | Compound | 55-60 lbs |
| 100 lbs × 12 reps | Compound | 110 lbs |
| 15 lbs × 10 reps | Isolation | 17.5-20 lbs |
| 30 lbs × 6 reps | Isolation | 27.5-30 lbs |

All suggestions should be **reasonable** (within 20% of previous weight).

---

## ✅ Success Criteria

The deployment is SUCCESSFUL if:

1. ✅ Auto-migration runs (if you had old data)
2. ✅ 20 lbs × 10 reps → 22.5 or 25 lbs (NOT 200 lbs)
3. ✅ Data is stored as numbers (not strings)
4. ✅ All weight suggestions are reasonable
5. ✅ No console errors

---

## 🐛 Troubleshooting

### Issue: Still seeing 200 lbs

**Solution 1: Hard Refresh**
- Press Ctrl+Shift+R (Windows/Linux)
- Press Cmd+Shift+R (Mac)
- This clears browser cache

**Solution 2: Clear localStorage**
- Open DevTools Console (F12)
- Run: `localStorage.clear(); location.reload();`
- Re-enter your workout data

**Solution 3: Different Browser**
- Try Chrome, Firefox, or Safari
- localStorage is browser-specific

### Issue: No migration toast appears

**This is normal if:**
- You're using a fresh browser/device
- You cleared localStorage before
- You never had old string data

**To verify it works:**
- Enter new workout data
- Check that suggestions are reasonable
- Check DevTools that types are numbers

### Issue: Can't find the suggestion card

**Make sure:**
- You're on Week 2 or later (suggestions only show Week 2+)
- You completed sets in Week 1 (marked with ✓)
- The exercise has Week 1 data for comparison

---

## 📱 Testing on Mobile

1. Open the site on your phone:
   ```
   https://workout-tracker-m2gt9kmru-britain-saluris-projects.vercel.app
   ```

2. Test the same workflow:
   - Week 1: Enter 20 lbs × 10 reps
   - Week 2: Check suggestion (should be 22.5-25 lbs)

3. Mobile DevTools (advanced):
   - Connect phone to computer
   - Use Chrome Remote Debugging
   - Or just verify visually that suggestions are reasonable

---

## 📊 What to Report Back

After testing, please report:

✅ **Success:**
- "Auto-migration worked - saw toast notification"
- "20 lbs × 10 reps suggests 22.5 lbs - CORRECT!"
- "All tests passed"

❌ **Issues:**
- "Still seeing 200 lbs" (include screenshot)
- "Migration didn't run" (include console log)
- "Suggestion seems wrong: X lbs → Y lbs"

---

## 🎯 Quick Verification (30 seconds)

**Fastest way to verify the fix:**

1. Open: https://workout-tracker-m2gt9kmru-britain-saluris-projects.vercel.app
2. Week 1, Day 1: Enter 20 lbs × 10 reps (2 sets)
3. Week 2, Day 1: Check suggestion
4. ✅ Should be 20-25 lbs, NOT 200 lbs

**That's it!** If this works, everything is fixed.

---

## 📞 Next Steps

If all tests pass:
- ✅ Bug is fixed!
- ✅ Auto-migration working!
- ✅ Ready to use the app normally!

If any issues:
- Share screenshot of the issue
- Share DevTools console log
- We'll debug together

---

**Deployed:** October 28, 2025
**Commit:** 2a61015 (with swarm analysis and fixes)
**Production URL:** https://workout-tracker-m2gt9kmru-britain-saluris-projects.vercel.app
