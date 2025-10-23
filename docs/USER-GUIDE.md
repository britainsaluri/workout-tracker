# Mobile Workout Tracker - User Guide

## Welcome!

Welcome to your personal Mobile Workout Tracker! This app helps you log, track, and analyze your workouts right from your phone—no internet connection required.

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Creating Your First Workout](#creating-your-first-workout)
3. [Managing Workouts](#managing-workouts)
4. [Viewing Workout History](#viewing-workout-history)
5. [Data Export](#data-export)
6. [Settings](#settings)
7. [Tips & Tricks](#tips--tricks)
8. [Troubleshooting](#troubleshooting)
9. [FAQ](#faq)

---

## Getting Started

### System Requirements

- **iOS**: iOS 14.0 or later, Safari 14+
- **Android**: Android 8.0 or later, Chrome 90+
- **Storage**: Minimum 10MB free space
- **Internet**: Not required (works 100% offline)

### Installation

#### Option 1: Add to Home Screen (Recommended)

**For iOS (iPhone/iPad):**
1. Open Safari and navigate to the app URL
2. Tap the Share button (square with arrow pointing up)
3. Scroll down and tap "Add to Home Screen"
4. Name the app (e.g., "Workout Tracker")
5. Tap "Add"
6. The app icon will appear on your home screen

**For Android:**
1. Open Chrome and navigate to the app URL
2. Tap the menu (three dots)
3. Select "Add to Home Screen" or "Install App"
4. Confirm installation
5. The app icon will appear in your app drawer

#### Option 2: Browser Bookmark
Simply bookmark the app URL in your mobile browser for quick access.

### First Launch

When you first open the app:
1. You'll see an empty workout list
2. Tap the "+ New Workout" button to get started
3. The app will request permission to store data locally (always allow)

---

## Creating Your First Workout

### Step-by-Step Guide

#### 1. Start a New Workout

```
[Screenshot: Home screen with "New Workout" button]
```

1. Tap the **"+ New Workout"** button (usually bottom-right or top-right)
2. The workout creation screen opens

#### 2. Set Workout Details

```
[Screenshot: Workout details form]
```

**Date & Time**
- Default: Current date and time
- Tap to change if logging a past workout
- Use the date picker for easy selection

**Workout Name** (Optional)
- Examples: "Morning Upper Body", "Leg Day", "Quick Cardio"
- Leave blank for automatic naming (e.g., "Workout - Oct 23")

**Location** (Optional)
- Examples: "Home Gym", "Gold's Gym", "Outdoor"
- Helps you track where you trained

#### 3. Add Exercises

```
[Screenshot: Exercise selection screen]
```

1. Tap **"+ Add Exercise"**
2. Choose from:
   - **Search**: Type exercise name (e.g., "bench press")
   - **Recent**: Quick access to your most-used exercises
   - **Categories**: Browse by muscle group (Chest, Back, Legs, etc.)
   - **Custom**: Create your own exercise

**Popular Exercises:**
- Chest: Bench Press, Push-ups, Dumbbell Flyes
- Back: Pull-ups, Rows, Deadlifts
- Legs: Squats, Lunges, Leg Press
- Shoulders: Overhead Press, Lateral Raises
- Arms: Bicep Curls, Tricep Extensions

#### 4. Log Sets and Reps

```
[Screenshot: Set logging interface]
```

For each exercise:

**Adding Sets:**
1. Tap **"+ Add Set"**
2. Enter **Reps** (number of repetitions)
3. Enter **Weight** (if applicable)
4. Select **Unit** (kg or lbs)

**Quick Copy:**
- Tap **"Copy Previous"** to duplicate the last set
- Useful for consistent weights

**Example:**
```
Set 1: 10 reps @ 135 lbs
Set 2: 8 reps @ 135 lbs
Set 3: 6 reps @ 135 lbs
```

**Tips:**
- Leave weight blank for bodyweight exercises
- Use decimal weights (e.g., 22.5 kg)
- Reps can include partial reps (e.g., "10+2" in notes)

#### 5. Add Notes (Optional)

```
[Screenshot: Notes section]
```

Use notes to record:
- How you felt during the workout
- Form adjustments
- Energy levels
- Next session goals
- Equipment variations

**Example Notes:**
- "Felt strong today, increase weight next time"
- "Lower back slightly sore, focus on form"
- "Used resistance bands instead of dumbbells"

#### 6. Save Your Workout

```
[Screenshot: Save button]
```

1. Review all entries
2. Tap **"Save Workout"** (top-right or bottom)
3. Confirmation message appears
4. You're redirected to the workout list

**Auto-Save:**
- Many versions auto-save as you type
- Look for the "Saved" indicator

---

## Managing Workouts

### Viewing a Workout

```
[Screenshot: Workout detail view]
```

1. Tap any workout from the list
2. View all details:
   - Date and time
   - Total duration
   - All exercises and sets
   - Notes
3. Swipe up/down to scroll through exercises

### Editing a Workout

```
[Screenshot: Edit mode]
```

1. Open the workout
2. Tap **"Edit"** button
3. Make changes:
   - Modify sets, reps, weights
   - Add or remove exercises
   - Update notes
4. Tap **"Save Changes"**

**Quick Edits:**
- Tap directly on a number to edit
- Swipe left on a set to delete
- Long-press for additional options

### Copying a Workout

```
[Screenshot: Copy workout option]
```

Perfect for repeating similar workouts:
1. Open a workout
2. Tap **"Copy Workout"**
3. A new workout is created with the same exercises
4. Update weights/reps as needed
5. Save

### Deleting a Workout

```
[Screenshot: Delete confirmation]
```

1. Open the workout OR swipe left on the list
2. Tap **"Delete"** or trash icon
3. Confirm deletion
4. **Warning**: This cannot be undone (unless you have a backup)

---

## Viewing Workout History

### List View

```
[Screenshot: Workout list with filters]
```

**Default View:**
- Most recent workouts at the top
- Shows date, name, and exercise count
- Scroll to see older workouts

**Sorting Options:**
- **Date**: Newest first (default)
- **Name**: Alphabetical
- **Duration**: Longest first
- **Exercises**: Most exercises first

### Search & Filter

```
[Screenshot: Search and filter interface]
```

**Search:**
1. Tap the search icon
2. Type exercise name, workout name, or notes
3. Results update in real-time

**Filter by Date:**
- Today
- This Week
- This Month
- Custom Date Range

**Filter by Exercise:**
- See all workouts containing a specific exercise
- Great for tracking progress on compound lifts

### Progress Tracking

```
[Screenshot: Progress charts]
```

Some versions include:
- **Exercise Volume**: Total weight lifted over time
- **Frequency**: Workouts per week
- **Personal Records**: Track PRs automatically
- **Body Part Split**: Visual breakdown of muscle groups trained

---

## Data Export

### Exporting Your Data

```
[Screenshot: Export options]
```

#### JSON Export (Full Data)

1. Go to **Settings** or **Menu**
2. Tap **"Export Data"**
3. Select **"JSON Format"**
4. Choose export location:
   - Save to Files (iOS)
   - Download folder (Android)
   - Share via email/cloud

**Use Cases:**
- Complete backup
- Import into other apps
- Data analysis

**Sample JSON:**
```json
{
  "workouts": [
    {
      "id": "workout-123",
      "date": "2025-10-23T10:30:00Z",
      "exercises": [
        {
          "name": "Bench Press",
          "sets": [
            {"reps": 10, "weight": 135, "unit": "lbs"},
            {"reps": 8, "weight": 145, "unit": "lbs"}
          ]
        }
      ],
      "duration": 45,
      "notes": "Great session"
    }
  ]
}
```

#### CSV Export (Spreadsheet)

1. Go to **Settings**
2. Tap **"Export Data"**
3. Select **"CSV Format"**
4. Open in Excel, Google Sheets, or Numbers

**Use Cases:**
- Create custom charts
- Share with coach/trainer
- Print workout logs

#### Text Export (Readable Format)

Simple text file for printing or sharing:

```
Workout - October 23, 2025
=========================

Bench Press
  Set 1: 10 reps @ 135 lbs
  Set 2: 8 reps @ 145 lbs
  Set 3: 6 reps @ 155 lbs

Squats
  Set 1: 12 reps @ 185 lbs
  Set 2: 10 reps @ 205 lbs

Notes: Felt strong today!
```

---

## Settings

### Units

```
[Screenshot: Units settings]
```

**Weight Units:**
- Kilograms (kg)
- Pounds (lbs)
- Can be changed per-exercise or globally

**Distance Units** (if tracking cardio):
- Miles
- Kilometers

**Settings are saved and apply to all future workouts**

### Preferences

**Theme:**
- Light mode
- Dark mode
- Auto (follow system)

**Default Rest Timer:**
- Set preferred rest time between sets
- Optional sound/vibration alerts

**Week Start Day:**
- Sunday or Monday
- Affects weekly statistics

### Data Management

```
[Screenshot: Data management options]
```

**Storage Used:**
- View how much space your workouts use
- Typically very small (<10MB for 1000 workouts)

**Clear Old Data:**
- Delete workouts older than X months
- Free up storage

**Reset App:**
- **Warning**: Deletes ALL data
- Export first!

---

## Tips & Tricks

### Speed Up Logging

1. **Use Copy Previous Set**: Saves retyping
2. **Create Templates**: Save common workout routines
3. **Voice Input**: Use your phone's microphone for notes
4. **Quick Add**: Some versions support "Quick Add" from home screen

### Progress Photos

While not built into the app:
1. Take photos with your phone's camera
2. Name them with dates (e.g., "Progress-Oct-2025")
3. Store in a dedicated album
4. Compare alongside your workout data

### Backup Strategy

**Daily:** App auto-saves locally
**Weekly:** Export JSON to cloud storage
**Monthly:** Create a backup folder with all exports

### Training Tips

1. **Track Everything**: Even "bad" workouts teach you something
2. **Be Consistent**: Log immediately after your workout
3. **Review Regularly**: Look at past workouts before training
4. **Set Goals**: Use your data to create realistic targets
5. **Progressive Overload**: Gradually increase weight or reps

---

## Troubleshooting

### Common Issues

#### App Won't Load

**Solution:**
1. Check internet connection (for initial load only)
2. Clear browser cache:
   - iOS Safari: Settings > Safari > Clear History and Website Data
   - Android Chrome: Settings > Privacy > Clear browsing data
3. Re-add to home screen
4. Update your browser

#### Data Not Saving

**Solution:**
1. Ensure you have sufficient storage (check Settings > Storage)
2. Don't force quit immediately after saving
3. Grant storage permissions if prompted
4. Try saving in airplane mode to rule out network issues

#### Workouts Disappeared

**Solution:**
1. Check if you're viewing a filtered list (clear filters)
2. Look in recently deleted (if feature exists)
3. Restore from your latest JSON backup
4. Check if using the same device/browser

#### Slow Performance

**Solution:**
1. Close other apps/tabs
2. Restart your device
3. Export and archive old workouts (>1 year)
4. Update your browser
5. Clear browser cache

#### Numbers Not Accepted

**Solution:**
1. Use your device's numeric keyboard
2. For decimals, use period (.) not comma (,)
3. Avoid special characters
4. Stay within reasonable ranges (0-9999)

#### Date Issues

**Solution:**
1. Check your device's date/time settings
2. Ensure automatic time zone is enabled
3. Manually set date in the app

### Getting Help

**Self-Help:**
1. Check this guide's FAQ section
2. Review the test plan for expected behaviors
3. Export your data before troubleshooting

**Contact Support:**
Include:
- Device model and OS version
- Browser name and version
- Steps to reproduce the issue
- Screenshots if possible
- Exported JSON (if data issue)

---

## FAQ

### General Questions

**Q: Do I need internet to use this app?**
A: No! The app works 100% offline. You only need internet for the initial installation.

**Q: Is my data private?**
A: Yes. All data is stored locally on your device. Nothing is sent to servers.

**Q: Can I use this on multiple devices?**
A: You can install on multiple devices, but data won't sync automatically. Use export/import to transfer data.

**Q: How much storage does it use?**
A: Very little! Typically 1-5MB even with hundreds of workouts.

**Q: Can I print my workouts?**
A: Yes, export to text or CSV, then print from your computer.

### Workout Logging

**Q: What if I forget to log a workout?**
A: You can log it later and manually set the date/time.

**Q: Can I log cardio?**
A: Depends on the version. Look for "Cardio" or "Add Exercise > Other" options.

**Q: How do I track bodyweight exercises?**
A: Simply leave the weight field blank or enter "0".

**Q: Can I use the same exercise multiple times?**
A: Yes! For example, do bench press, then other exercises, then more bench press.

**Q: What's the maximum weight I can enter?**
A: Most apps support up to 9999 lbs/kg.

### Data & Backup

**Q: How often should I backup?**
A: Weekly for active users, monthly for casual users.

**Q: What format is best for backup?**
A: JSON for complete data, CSV for sharing with trainers.

**Q: Can I import data from other apps?**
A: Some versions support CSV import. Check import options in settings.

**Q: What happens if I delete the app?**
A: All data is deleted unless you have a backup. Always export first!

**Q: Is data stored in the cloud?**
A: No, unless you manually upload your exports.

### Technical

**Q: Does it drain my battery?**
A: No, it's very lightweight with minimal battery impact.

**Q: Why does it need storage permission?**
A: To save your workouts locally on your device.

**Q: Can I use it in the gym without signal?**
A: Absolutely! No internet needed once installed.

**Q: Does it work on tablets?**
A: Yes, it adapts to tablet screen sizes.

**Q: What if my phone breaks?**
A: Your data is safe if you have regular backups exported to cloud storage.

---

## Keyboard Shortcuts (for external keyboards)

| Shortcut | Action |
|----------|--------|
| Ctrl/Cmd + N | New workout |
| Ctrl/Cmd + S | Save current workout |
| Ctrl/Cmd + E | Edit mode |
| Ctrl/Cmd + F | Search |
| Esc | Cancel/Go back |

---

## Appendix: Sample Workout Plans

### Beginner Full Body (3x/week)

**Workout A:**
- Squats: 3x10
- Bench Press: 3x10
- Rows: 3x10
- Overhead Press: 2x12
- Planks: 3x30s

**Workout B:**
- Deadlifts: 3x8
- Pull-ups: 3x5-10
- Dumbbell Press: 3x10
- Lunges: 3x10 (each leg)
- Bicycle Crunches: 3x15

### Intermediate Push/Pull/Legs

**Push Day:**
- Bench Press: 4x8
- Overhead Press: 3x10
- Incline Dumbbell Press: 3x12
- Tricep Dips: 3x10
- Lateral Raises: 3x15

**Pull Day:**
- Deadlifts: 4x6
- Pull-ups: 4x8
- Barbell Rows: 3x10
- Face Pulls: 3x15
- Bicep Curls: 3x12

**Leg Day:**
- Squats: 4x8
- Romanian Deadlifts: 3x10
- Leg Press: 3x12
- Leg Curls: 3x12
- Calf Raises: 4x15

---

## Contact & Support

**Documentation:**
- User Guide (this document)
- [Deployment Guide](DEPLOYMENT.md)
- [Test Plan](../tests/test-plan.md)

**Version:** 1.0
**Last Updated:** October 23, 2025

---

**Happy Training!** 💪

Remember: Consistency beats perfection. Log your workouts, track your progress, and celebrate your gains!
