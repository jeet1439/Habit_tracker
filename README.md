# Habit Tracker

**Build better habits, one day at a time.**

A clean, simple React Native app for tracking daily habits, monitoring progress, and journaling your journey.

## Features

### ✨ Core Features

1. **Add & Manage Habits**
   - Quickly add new habits with custom names, times, and descriptions
   - Edit existing habits anytime
   - Delete habits you no longer want to track
   - Support for daily habit reminders

2. **Daily Progress Tracking**
   - Check off completed habits today
   - Visual progress indicator showing completion percentage
   - Week-at-a-glance calendar showing daily completion status
   - Streak counter to motivate consistency

3. **Simple Note Journaling**
   - Create notes for each day
   - Reflect on wins and challenges
   - Search through your notes
   - Easy editing and deletion

4. **User Account**
   - Secure Google Sign-In authentication
   - Cloud storage via Firebase Firestore
   - Personal dashboard

## Architecture

The app has been completely rewritten for **simplicity and maintainability**:

### Folder Structure

```
src/
├── components/          # Reusable UI components
│   ├── HabitItem.jsx   # Habit list item with actions
│   └── HabitForm.jsx   # Modal form for adding/editing habits
├── context/            # State management
│   └── HabitContext.js # Global habits context provider
├── screens/            # Screen components
│   ├── LoginScreen.jsx      # Google Sign-In
│   ├── TodayScreen.jsx      # Daily progress view
│   ├── ScheduleScreen.jsx   # Manage habits
│   ├── NotesScreen.jsx      # Journal entries
│   └── SettingsScreen.jsx   # Account settings
├── utils/
│   └── constants.js    # Colors, utilities, icons
└── Navigation/
    └── TabNavigation.jsx # Bottom tab navigator
```

### State Management

**HabitContext** handles all habit management logic:
- Centralized Firebase Firestore connections
- Real-time updates via listeners
- Simple methods: `addHabit()`, `updateHabit()`, `deleteHabit()`, `toggleHabitCompletion()`
- Easy-to-use `useHabits()` hook

### Firestore Database Schema

```
users/
├── {userId}/
│   ├── email: string
│   ├── name: string
│   ├── habits/ (collection)
│   │   ├── {habitId}
│   │   │   ├── name: string
│   │   │   ├── startTime: string (optional)
│   │   │   ├── endTime: string (optional)
│   │   │   ├── description: string (optional)
│   │   │   ├── frequency: string (daily/weekly/custom)
│   │   │   ├── createdAt: timestamp
│   │   │   └── updatedAt: timestamp
│   └── daily_status/ (collection)
│       ├── {YYYY-MM-DD}
│       │   ├── completed: array<habitId>
│       │   └── updatedAt: timestamp
│   └── notes/ (collection)
│       ├── {noteId}
│       │   ├── title: string
│       │   ├── content: string
│       │   ├── createdAt: timestamp
│       │   └── updatedAt: timestamp
```

## How to Use

### 1. Add a Habit
- Go to **Schedule** tab
- Tap the **+** button
- Fill in habit name (required), optional time slots and description
- Choose frequency (daily, weekly, or custom)
- Tap **Create**

### 2. Track Daily Progress
- Go to **Today** tab
- See all your habits for the day
- Tap a habit to mark it as complete
- Track your progress with the circular indicator
- View your weekly calendar

### 3. Journal Your Progress
- Go to **Notes** tab
- Tap the **+** button to create a note
- Write a title and description
- Tap **Save**
- Search through notes anytime

### 4. View Settings
- Go to **Settings** tab
- See your profile information
- Sign out anytime

## Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/habit-tracker.git
   cd Habit_tracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up Firebase**
   - Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
   - Enable Firestore Database and Google Authentication
   - Update your Firebase credentials in the appropriate config files

4. **Run on Android**
   ```bash
   npm run android
   ```

5. **Run on iOS**
   ```bash
   npm run ios
   ```

## Key Improvements

✅ **Simpler State Management** - Centralized context instead of scattered refs
✅ **Cleaner Components** - Less code, better readability
✅ **Reusable UI Elements** - HabitItem and HabitForm components
✅ **Better Error Handling** - Consistent error feedback
✅ **Optimized Performance** - No unnecessary re-renders
✅ **Consistent Styling** - Centralized color constants
✅ **Logical Flow** - Easy to add new features

## Dependencies

- React Native 0.83.1
- React Navigation 7.x
- Firebase (Auth & Firestore)
- React Native Vector Icons

## Future Enhancements

- [ ] Habit reminders and notifications
- [ ] Advanced analytics and charts
- [ ] Goal setting with milestones
- [ ] Habit templates
- [ ] Social sharing of achievements
- [ ] Habit categories
- [ ] Custom habit streaks

## License

MIT License - feel free to use this project for learning and personal use.

## Support

For issues or questions, please open an issue on GitHub.
