# Sheet 1 Workout Data Extraction

## Quick Start

### Run the complete extraction:
```bash
python3 src/extract_sheet1_complete.py
```

This will:
- Extract ALL workout data from Sheet 1 ("Davey Jone's Pump")
- Capture both Week 1 and Week 2 (78 total exercises)
- Save to `/Users/britainsaluri/workout-tracker/src/sheet1-workout-data.json`
- Verify all exercise counts

## Files

### Extraction Scripts
- **`extract_sheet1_complete.py`** - Main extraction script (Week 1 + Week 2)
- **`extract_sheet1_workout.py`** - Original script (Week 1 only)
- **`check_all_sheets.py`** - Inspect all sheets in workbook
- **`inspect_sheet1.py`** - Detailed Sheet 1 inspection
- **`inspect_week2_location.py`** - Find Week 2 data location

### Output
- **`sheet1-workout-data.json`** - Complete workout data (855 lines, 78 exercises)

### Documentation
- **`docs/FINAL-EXTRACTION-SUMMARY.md`** - Complete extraction summary
- **`docs/sheet1-extraction-summary.md`** - Initial Week 1 summary

## Data Structure

```json
{
  "sheet_name": "Sheet1",
  "program_name": "Davey Jone's Pump",
  "weeks": [
    {
      "week": 1,
      "days": [
        {
          "day": 1,
          "day_name": "Upper Pull/Lower Push",
          "exercises": [
            {
              "exercise_id": "A1",
              "exercise_name": "Barbell Bench",
              "tempo": "211",
              "sets_reps": "2x18-20",
              "rest": "1m",
              "results": "105x15,95x10",
              "day": 1,
              "week": 1
            }
          ]
        }
      ]
    }
  ]
}
```

## Exercise Counts

| Week | Day 1 | Day 2 | Day 3 | Day 4 | Day 5 | Total |
|------|-------|-------|-------|-------|-------|-------|
| Week 1 | 10 | 7 | 5 | 7 | 10 | 39 |
| Week 2 | 10 | 7 | 5 | 7 | 10 | 39 |
| **Total** | **20** | **14** | **10** | **14** | **20** | **78** |

## Column Layout

### Week 1 (Columns A-G):
- A: Exercise ID
- B: Exercise Name
- D: Tempo
- E: Sets/Reps
- F: Rest
- G: Results

### Week 2 (Columns A-B, I-L):
- A: Exercise ID (same as Week 1)
- B: Exercise Name (same as Week 1)
- I: Tempo
- J: Sets/Reps
- K: Rest
- L: Results

**Key Difference:** Week 2 has 3 sets vs Week 1's 2 sets (progressive overload)

## Usage Examples

### Load the JSON data:
```python
import json

# Load workout data
with open('src/sheet1-workout-data.json', 'r') as f:
    workout_data = json.load(f)

# Access Week 1, Day 1 exercises
week1_day1 = workout_data['weeks'][0]['days'][0]
print(f"Day: {week1_day1['day_name']}")
for exercise in week1_day1['exercises']:
    print(f"{exercise['exercise_id']}: {exercise['exercise_name']} - {exercise['sets_reps']}")
```

### Get all exercises for a specific day across both weeks:
```python
day_number = 1  # Day 1
for week in workout_data['weeks']:
    day_data = week['days'][day_number - 1]
    print(f"\nWeek {week['week']}, Day {day_number}:")
    for ex in day_data['exercises']:
        print(f"  {ex['exercise_id']}: {ex['exercise_name']} ({ex['sets_reps']})")
```

### Count total exercises:
```python
total = sum(
    len(day['exercises'])
    for week in workout_data['weeks']
    for day in week['days']
)
print(f"Total exercises: {total}")  # Output: 78
```

## Verification

Run verification:
```bash
python3 src/extract_sheet1_complete.py
```

Expected output:
```
✅ All exercise counts match expected values for both weeks!

Week 1: 39 exercises
Week 2: 39 exercises
📊 GRAND TOTAL: 78 exercises across 2 weeks
```

## Coordination

Data saved to Claude Flow memory:
- **Memory Key:** `swarm/analyzer/sheet1-complete-data`
- **Storage:** `.swarm/memory.db`

Access via hooks:
```bash
npx claude-flow@alpha hooks post-edit --file "sheet1-workout-data.json" --memory-key "swarm/analyzer/sheet1-complete-data"
```

---

**Status:** ✅ Complete and verified
**Last Updated:** 2025-10-23
