// Common colors used throughout the app
export const COLORS = {
  bg: '#0B1020',
  primary: '#8B8DFF',
  primaryLight: '#25275A',

  green100: '#173B32',
  green300: '#5EE6A8',
  green500: '#36C982',
  green700: '#197A50',
  green900: '#0C4E35',

  red100: '#48232B',
  red500: '#FF6675',
  red600: '#D94A5A',

  orange100: '#4B301C',
  orange500: '#FFAD5C',

  blue500: '#66A9FF',

  textDark: '#F4F6FF',
  textGray: '#A8B0C5',
  white: '#FFFFFF',
  surface: '#161C2E',
  borderColor: '#2A334B',
  danger: '#FF6B78',
};

// Get icon name based on habit name
export const getIconForHabit = (habitName = '') => {
  const name = habitName.toLowerCase();

  if (name.includes('gym') || name.includes('workout') || name.includes('exercise')) {
    return 'dumbbell';
  }
  if (name.includes('read')) {
    return 'book-open';
  }
  if (name.includes('mediat') || name.includes('yoga')) {
    return 'meditation';
  }
  if (name.includes('run') || name.includes('walk') || name.includes('jog')) {
    return 'run';
  }
  if (name.includes('water') || name.includes('drink')) {
    return 'water';
  }
  if (name.includes('study') || name.includes('learn')) {
    return 'school';
  }
  if (name.includes('sleep')) {
    return 'bed';
  }
  if (name.includes('code') || name.includes('program')) {
    return 'code-braces';
  }
  if (name.includes('cook') || name.includes('eat') || name.includes('meal')) {
    return 'chef-hat';
  }
  if (name.includes('clean') || name.includes('laundry')) {
    return 'broom';
  }
  if (name.includes('social') || name.includes('call') || name.includes('message')) {
    return 'chat-bubble';
  }
  if (name.includes('music') || name.includes('sing') || name.includes('play')) {
    return 'music';
  }

  return 'target'; // Default icon
};

// Format date string to readable format
export const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
};

// Get week dates (last 7 days including today)
export const getWeekDates = () => {
  const today = new Date();
  const dates = [];

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dateStr = [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-');
    dates.push({
      dateStr,
      label: date.toLocaleDateString('en-US', { weekday: 'narrow' }),
      dayNum: date.getDate(),
      isToday: i === 0,
    });
  }

  return dates;
};

// Get today's date string
export const getTodayStr = () => {
  const today = new Date();
  return [today.getFullYear(), String(today.getMonth() + 1).padStart(2, '0'), String(today.getDate()).padStart(2, '0')].join('-');
};

// Calculate streak from week data
export const calculateStreak = (weekData) => {
  let streak = 0;
  for (let i = weekData.length - 1; i >= 0; i--) {
    if (weekData[i].isAllDone) {
      streak++;
    } else if (!weekData[i].isToday) {
      break;
    }
  }
  return streak;
};
