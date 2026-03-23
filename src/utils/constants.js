// Common colors used throughout the app
export const COLORS = {
  bg: '#F8F9FE',
  primary: '#5E60CE',
  primaryLight: '#E0E0FF',

  green100: '#DCFCE7',
  green300: '#86EFAC',
  green500: '#4ADE80',
  green700: '#15803D',
  green900: '#09662e',

  red100: '#FEE2E2',
  red500: '#EF4444',
  red600: '#DC2626',

  orange100: '#FFEDD5',
  orange500: '#F97316',

  blue500: '#3B82F6',

  textDark: '#1E293B',
  textGray: '#64748B',
  white: '#FFFFFF',
  borderColor: '#E2E8F0',
  danger: '#e43c3c',
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
    const dateStr = date.toISOString().split('T')[0];
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
  return today.toISOString().split('T')[0];
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
