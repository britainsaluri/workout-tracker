# Sheet 1 Extraction Summary - "Davey Jone's Pump"

## Extraction Status: ✅ COMPLETE

**Source File:** `/Users/britainsaluri/Downloads/Argh Let's Get Huge Matey.xlsx`
**Output File:** `/Users/britainsaluri/workout-tracker/src/sheet1-workout-data.json`
**Sheet Analyzed:** Sheet 1 (rows 1-50)

## Important Note: Week 2 Data

After analyzing the complete Excel file structure, **Sheet 1 only contains Week 1 data**. The file shows "WEEK 1" labels before each day but does not contain Week 2 data in Sheet 1. Week 2 data may be located in another sheet of the workbook.

## Extraction Results

### Week 1 - Complete Extraction

| Day | Day Name | Exercise Count | Status |
|-----|----------|----------------|--------|
| Day 1 | Upper Pull/Lower Push | 10 exercises | ✅ |
| Day 2 | Upper Pull/Lower Push | 7 exercises | ✅ |
| Day 3 | Arm Farm/ Core/ Cardio | 5 exercises | ✅ |
| Day 4 | Upper Pull/Lower Push | 7 exercises | ✅ |
| Day 5 | Upper Pull/Lower Push | 10 exercises | ✅ |

**Total Exercises Extracted:** 39

## Day 1 - Upper Pull/Lower Push (10 exercises)

1. **A1** - Barbell Bench (Tempo: 211, Sets: 2x18-20, Rest: 1m)
2. **A2** - DB Shrug (Tempo: 121, Sets: 2x18-20)
3. **B1** - Barbell Back Squat (Tempo: 211, Sets: 2x18-20)
4. **C1** - Incline Pec Fly (Tempo: 311, Sets: 2x18-20, Rest: 1-2m)
5. **C2** - DB Split Squat (Tempo: 211, Sets: 2x10ea)
6. **D1** - Cable Tricep Press Down (Tempo: 211, Sets: 2x18-20, Rest: 1m)
7. **D2** - DB Lateral Raises (Tempo: 211, Sets: 2x18-20)
8. **E1** - DB OH Tricep Extension (Tempo: 211, Sets: 2x18-20, Rest: 1m)
9. **E2** - Weighted Sit-ups (Tempo: 311, Sets: 2x20-25)
10. **E3** - DB Split Squat Hold (Tempo: 211, Sets: 2x25 sec ea)

## Day 2 - Upper Pull/Lower Push (7 exercises)

1. **A1** - Pull-ups (Tempo: 211, Sets: 2xMax Reps, Rest: 1m)
2. **A2** - Barbell RDL (Tempo: 121, Sets: 2x15-18)
3. **B1** - DB Chest Supported Row (Tempo: 211, Sets: 2x18-20, Rest: 2m)
4. **B2** - DB SL Glute Bridge (Tempo: 311, Sets: 2x12-15 ea)
5. **C1** - DB Incline Curl (Tempo: 211, Sets: 2x18-20, Rest: 1-2m)
6. **C2** - Lying Leg Raises (Tempo: 211, Sets: 2x18-20)
7. **D1** - Cable Curls (Tempo: 211, Sets: 2x18-20, Rest: 1m)

## Day 3 - Arm Farm/ Core/ Cardio (5 exercises)

1. **A1** - Single Arm Strict Curls (Tempo: 211, Sets: 2x18-20, Rest: 1:30m)
2. **A2** - DB Skull Crushers (Tempo: 211, Sets: 2x18-20)
3. **B1** - Lean-away Lateral Flyes (Tempo: 211, Sets: 2x15-20, Rest: 1:30m)
4. **B2** - SA Cable Shrugs (Tempo: 121, Sets: 2x15-20)
5. **B3** - Hanging Leg Raise (Tempo: 311, Sets: 2x15-20)

## Day 4 - Upper Pull/Lower Push (7 exercises)

1. **A1** - Incline BB Bench (Tempo: 211, Sets: 2x18-20, Rest: 1m)
2. **A2** - Heel Elevated Front Squat (Tempo: 121, Sets: 2x15-18)
3. **B1** - DB Bench Press (Tempo: 211, Sets: 2x18-20, Rest: 2m)
4. **B2** - BB Reverse Lunge (Tempo: 311, Sets: 2x8-10 ea)
5. **C1** - Decline DB Pec Flyes (Tempo: 211, Sets: 2x18-20, Rest: 1-2m)
6. **C2** - Cable OH Tri Extension (Tempo: 211, Sets: 2x18-20)
7. **D1** - Cable Column Crunches (Tempo: 211, Sets: 2x18-20, Rest: 1m)

## Day 5 - Upper Pull/Lower Push (10 exercises)

1. **A1** - Bent-over BB Rows (Tempo: 211, Sets: 2x15-18, Rest: 1m)
2. **A2** - BB Shrugs (Tempo: 121, Sets: 2x18-20)
3. **B1** - BB Goodmornings (Tempo: 211, Sets: 2x12-15, Rest: 2m)
4. **C1** - DB Low Row (Tempo: 311, Sets: 2x18-20, Rest: 1m)
5. **C2** - Hand Supported SL DB RDL (Tempo: 211, Sets: 2x10-12 ea)
6. **D1** - DB Pull-overs (Tempo: 211, Sets: 2x18-20, Rest: 1m)
7. **D2** - Cable Lateral Raises (Tempo: 211, Sets: 2x18-20)
8. **D3** - BB Curls (Tempo: 211, Sets: 2x18-20)
9. **E2** - Decline Weighted Sit-ups (Tempo: 311, Sets: 2x20-25, Rest: 1m)
10. **E3** - Alternating DB Curls (Tempo: 211, Sets: 2x12ea)

## Data Structure

Each exercise in the JSON file contains:
- `exercise_id`: Exercise identifier (A1, A2, B1, etc.)
- `exercise_name`: Full exercise name
- `tempo`: Tempo notation (e.g., 211, 311, 121)
- `sets_reps`: Sets and reps format (e.g., "2x18-20", "2x10ea")
- `rest`: Rest period between sets (e.g., "1m", "1-2m", "2m")
- `day`: Day number (1-5)
- `week`: Week number (1)

## Next Steps

To extract Week 2 data, you will need to:
1. Check if there are additional sheets in the workbook (Sheet 2, Sheet 3, etc.)
2. Run the extraction script on those sheets
3. Or modify the current sheet if Week 2 data exists further down in the same sheet

## Files Created

1. **Python Script:** `/Users/britainsaluri/workout-tracker/src/extract_sheet1_workout.py`
2. **JSON Output:** `/Users/britainsaluri/workout-tracker/src/sheet1-workout-data.json`
3. **Inspection Script:** `/Users/britainsaluri/workout-tracker/src/inspect_sheet1.py`
4. **This Summary:** `/Users/britainsaluri/workout-tracker/docs/sheet1-extraction-summary.md`

## Coordination

Data has been saved to Claude Flow memory:
- Memory key: `swarm/analyzer/sheet1-data`
- Location: `.swarm/memory.db`

---

**Extraction completed successfully on 2025-10-23**
