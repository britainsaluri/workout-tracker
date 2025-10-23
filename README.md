# 💪 Argh Let's Get Huge Matey - Workout Tracker

A mobile-first Progressive Web App (PWA) for tracking your workout progress. Built with vanilla JavaScript, offline-capable, and optimized for smartphones.

![Workout Tracker](https://img.shields.io/badge/PWA-Ready-blue)
![Offline](https://img.shields.io/badge/Offline-Capable-green)
![Mobile](https://img.shields.io/badge/Mobile-Optimized-orange)

## 🎯 Features

- ✅ **Daily Workout Display** - Shows one workout per day with clear exercise details
- ✅ **Progress Tracking** - Enter weights and reps for each set
- ✅ **Offline Support** - Works without internet connection
- ✅ **Data Persistence** - All results saved locally (localStorage + IndexedDB)
- ✅ **Previous Results** - View your last session's performance
- ✅ **4 Workout Programs** - Multiple training phases included
- ✅ **Mobile Optimized** - Touch-friendly interface with large tap targets
- ✅ **PWA Installation** - Install as a home screen app on iOS/Android

## 🚀 Quick Start

### Option 1: Use Deployed Version (Easiest)
Just visit the live app: **https://workout-tracker-epwojsq4j-britain-saluris-projects.vercel.app**

### Option 2: Run Locally
1. Clone this repository
2. Open `src/index.html` in your browser
3. Start tracking workouts!

### Option 3: Install as App
1. Visit the deployed URL on your phone
2. Tap "Share" → "Add to Home Screen" (iOS)
3. Or tap menu → "Install App" (Android)

## 📱 Usage

1. **Select Program**: Choose from Week 1-4 programs in the header dropdown
2. **Navigate Days**: Use Previous/Next buttons to move between workout days
3. **Log Sets**: Enter weight and reps for each set
4. **Mark Complete**: Tap the circle to mark sets as done
5. **Finish Workout**: Tap "Complete Workout" when done

## 📂 Project Structure

```
workout-tracker/
├── src/
│   ├── index.html          # Main application (single-page app)
│   ├── workout-data.json   # Workout programs data
│   ├── storage.js          # Data persistence layer
│   ├── workout-state.js    # State management
│   ├── manifest.json       # PWA manifest
│   └── sw.js              # Service worker for offline support
├── scripts/
│   └── extract_workouts.py # Excel to JSON converter
├── tests/
│   ├── test-plan.md       # Testing strategy
│   ├── storage.test.js    # Storage layer tests
│   └── workout-state.test.js # State management tests
└── docs/
    ├── USER-GUIDE.md      # Complete user guide
    ├── DEPLOYMENT.md      # Deployment instructions
    └── storage-*.md       # API documentation
```

## 🛠️ Technology Stack

- **Frontend**: Vanilla JavaScript (ES6+), HTML5, CSS3
- **Storage**: localStorage (primary) + IndexedDB (fallback)
- **PWA**: Service Worker, Web App Manifest
- **Deployment**: Vercel
- **Data Source**: Excel (converted to JSON)

## 🏋️ Workout Programs

The app includes 4 comprehensive workout programs:

1. **Davey Jone's Pump** (Weeks 1-2) - High volume, metabolic stress
2. **Swole Seven Seas** (Weeks 1-4) - Progressive overload, strength focus
3. **Swole Seven Seas II** (Weeks 1-4) - Continuation cycle
4. **Britanica** (Weeks 1-4) - Simplified 3-day split

## 📊 Data Model

Workouts are structured as:
```javascript
{
  "program": "Week 1",
  "days": [
    {
      "day": "DAY 1: Upper Push",
      "exercises": [
        {
          "id": "A1",
          "name": "Barbell Bench",
          "tempo": "211",
          "sets_reps": "4x10-12",
          "rest": "1m",
          "results": "115x10,115x7,115x7,95x10"
        }
      ]
    }
  ]
}
```

## 🔧 Development

### Data Extraction
Convert Excel workouts to JSON:
```bash
cd scripts
python3 extract_workouts.py
```

### Testing
See `tests/test-plan.md` for comprehensive testing strategy.

### Deployment
See `docs/DEPLOYMENT.md` for detailed deployment instructions.

## 📖 Documentation

- **[User Guide](docs/USER-GUIDE.md)** - How to use the app
- **[Deployment Guide](docs/DEPLOYMENT.md)** - Hosting and deployment
- **[Test Plan](tests/test-plan.md)** - Testing strategy
- **[Storage API](docs/storage-api-reference.md)** - API reference

## 🤝 Contributing

This is a personal workout tracker, but feel free to fork and customize for your own use!

## 📝 License

MIT License - Feel free to use and modify for your personal fitness journey.

## 🎯 Roadmap

- [ ] Cloud sync across devices
- [ ] Exercise form videos
- [ ] Progress charts and analytics
- [ ] Custom workout builder
- [ ] Social sharing features
- [ ] Exercise substitutions
- [ ] Rest timer with notifications

## 💡 Built With

Created using Claude Code with SPARC methodology and Claude-Flow swarm coordination:
- 6 specialized AI agents working in parallel
- Mesh topology for efficient coordination
- Adaptive strategy for optimal task distribution

---

**Ready to get huge, matey? Start tracking your workouts today! 🏴‍☠️💪**
