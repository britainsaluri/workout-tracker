# Workout Data Extraction Scripts

## extract_workouts.py

Python script to extract workout data from Excel files and convert to structured JSON format.

### Features

- ✅ Parses multiple sheets (Sheet1-4) with different formats
- ✅ Extracts workout days, weeks, exercises, tempo, sets/reps, rest periods
- ✅ Handles nested structure (sheets → days → weeks → exercises)
- ✅ Preserves results and performance tracking data
- ✅ Clean JSON output optimized for web applications

### Requirements

```bash
pip install openpyxl
```

### Usage

```bash
python3 workout-tracker/scripts/extract_workouts.py
```

### Input

Excel file: `/Users/britainsaluri/Downloads/Argh Let's Get Huge Matey.xlsx`

### Output

JSON file: `/Users/britainsaluri/workout-tracker/src/workout-data.json`

### JSON Structure

#### For Sheets 1-3 (Standard Format):
```json
{
  "program_name": "Argh Let's Get Huge Matey",
  "sheets": [
    {
      "sheet_name": "Sheet2",
      "program_name": "Swole Seven Seas",
      "days": [
        {
          "day_name": "DAY 1: Upper Push",
          "weeks": [
            {
              "week_number": 1,
              "exercises": [
                {
                  "exercise_id": "A1",
                  "exercise_name": "Barbell Bench",
                  "tempo": "211",
                  "sets_reps": "4x10-12",
                  "rest": "1m",
                  "results": "115x10,115x7,115x7,95x10"
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}
```

#### For Sheet 4 (Block Format):
```json
{
  "sheet_name": "Sheet4",
  "program_name": "Britanica",
  "days": [
    {
      "day_name": "Day 1: Total Upper",
      "week_range": "Week 1,2",
      "blocks": [
        {
          "block_name": "Block 1",
          "exercises": [
            {
              "exercise_name": "Barbell Bench Press",
              "week_1_2": {
                "tempo": "NA",
                "sets": "3,4",
                "reps": "08-12",
                "results": "135x10,135x9,135x7",
                "pump_rating": 6.0
              },
              "week_3_4": {
                "tempo": "NA'",
                "sets": "4.0",
                "reps": "06-10",
                "results": "",
                "pump_rating": null
              }
            }
          ]
        }
      ]
    }
  ]
}
```

### Key Features

1. **Multi-Sheet Support**: Handles 4 different sheets with varying layouts
2. **Week Tracking**: Preserves weekly progression data
3. **Exercise Details**: Captures tempo, sets/reps, rest periods, and results
4. **Flexible Structure**: Adapts to different workout program formats
5. **Error Handling**: Safe value extraction with fallbacks

### Tempo Notation

The tempo is represented as 3 digits (e.g., "211", "311"):
- **First digit**: Eccentric (lowering) phase in seconds
- **Second digit**: Isometric (hold) phase in seconds
- **Third digit**: Concentric (lifting) phase in seconds

Example: "311" = 3 seconds down, 1 second hold, 1 second up

### Data Summary

- **Total Sheets**: 4
- **Total Days**: 20
- **Total Exercises**: 300+
- **File Size**: ~62 KB

### Notes

- Datetime values are converted to MM-DD format
- Empty cells are handled gracefully with empty strings
- Exercise IDs follow pattern: A1, B2, C1, etc.
- Results include weight and rep counts (e.g., "115x10,115x7")
