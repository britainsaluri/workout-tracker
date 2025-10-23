# Workout Tracker - Mobile-First PWA

A beautiful, responsive workout tracking application designed for mobile devices with offline capabilities.

## Features

### Core Functionality
- **Single-page application** optimized for mobile phones
- **One workout at a time** display for focused training
- **Exercise tracking** with weight and reps input for each set
- **Tempo and rest period** reference for proper form
- **Previous results** displayed for progress tracking
- **Day navigation** with Previous/Next buttons
- **Program selector** (Week 1-4 / Sheet 1-4)
- **Clean, touch-friendly UI** with large tap targets (minimum 44px)
- **Offline-capable** with PWA features

### User Experience
- **Persistent storage** using localStorage
- **Set completion tracking** with visual checkmarks
- **Toast notifications** for user feedback
- **Vibration feedback** on compatible devices
- **Pull-to-refresh prevention** for better UX
- **Progress indicators** showing completed sets
- **Empty state** for rest days

### Technical Features
- **Progressive Web App (PWA)** capabilities
- **Service Worker** for offline functionality
- **Responsive design** that works on all screen sizes
- **Performance optimized** for mobile devices
- **No external dependencies** - pure HTML/CSS/JavaScript

## File Structure

```
workout-tracker/
├── src/
│   ├── index.html      # Main application file
│   ├── manifest.json   # PWA manifest
│   └── sw.js          # Service worker
└── docs/
    └── README.md      # This file
```

## Usage

### Opening the App
1. Open `/Users/britainsaluri/workout-tracker/src/index.html` in a web browser
2. On mobile, you can "Add to Home Screen" for a native app-like experience

### Selecting a Program
- Use the program selector in the header to choose between Week 1-4
- Each program has multiple workout days

### Navigating Days
- Use "Previous" and "Next" buttons to move between workout days
- Buttons are disabled at the start/end of a program

### Tracking a Workout
1. For each exercise, enter weight (in kg) and reps for each set
2. Tap the circular check button to mark a set as completed
3. Previous session data is shown in yellow boxes when available
4. Tap "Complete Workout" when done

### Data Persistence
- All data is automatically saved to localStorage
- Your progress persists across sessions
- Previous workout data is saved for future reference

## Design Highlights

### Mobile-First Design
- Touch-optimized with 44px+ minimum tap targets
- Large, easy-to-read typography
- Spacious padding for comfortable thumb navigation
- Prevented pull-to-refresh gesture interference

### Color Scheme
- Primary: Indigo (#4F46E5)
- Success: Green (#10B981)
- Warning: Amber (#F59E0B)
- Clean white and gray backgrounds

### Layout
- Sticky header with program selector
- Fixed navigation bar
- Scrollable content area
- Fixed bottom action button
- Toast notifications

### Accessibility
- High contrast text
- Clear visual feedback
- Haptic feedback (vibration)
- Semantic HTML structure
- Touch-friendly interface

## Sample Data Structure

The app includes sample workout data for demonstration:

```javascript
{
  sheet1: {
    1: [
      {
        id: 'ex1',
        name: 'Barbell Squat',
        sets: 4,
        reps: 8,
        tempo: '3010',
        rest: '120s'
      },
      // ... more exercises
    ],
    // ... more days
  },
  // ... more programs
}
```

## Extending the App

### Adding More Exercises
Edit the `workoutData` object in the script section to add:
- New programs (sheet5, sheet6, etc.)
- New days within programs
- New exercises with sets, reps, tempo, and rest data

### Customizing Styles
All styles are in the `<style>` section with CSS custom properties for easy theming:
- `--primary`: Main brand color
- `--success`: Completion color
- `--warning`: Previous results color
- Other color and spacing variables

### Adding Features
The modular JavaScript structure makes it easy to add:
- Exercise notes or form cues
- Timer functionality for rest periods
- Charts and progress tracking
- Export/import functionality
- Cloud synchronization

## Browser Compatibility

- Modern mobile browsers (iOS Safari, Chrome, Firefox)
- Desktop browsers for testing
- Requires localStorage support
- Service Worker for offline (HTTPS required in production)

## Performance

- **Lightweight**: No external dependencies
- **Fast loading**: Single HTML file under 50KB
- **Smooth interactions**: CSS transitions and optimized JavaScript
- **Offline-capable**: Service Worker caching

## Future Enhancements

Potential features to add:
- [ ] Rest timer with notifications
- [ ] Exercise video/image references
- [ ] Advanced analytics and charts
- [ ] Cloud backup and sync
- [ ] Social sharing
- [ ] Custom program builder
- [ ] Exercise library with search
- [ ] Workout history calendar
- [ ] Export to CSV/PDF

## License

MIT License - Free to use and modify

## Support

For issues or questions, please refer to the project documentation or create an issue in the project repository.