import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Svg, { Circle } from 'react-native-svg';
import { useHabits } from '../context/HabitContext';
import HabitItem from '../components/HabitItem';
import { COLORS, getWeekDates, getTodayStr } from '../utils/constants';

export default function TodayScreen() {
  const { habits, dailyStatus, loading, getTodayStr: getToday, toggleHabitCompletion, getDailyStatusForDate } = useHabits();
  const [weekData, setWeekData] = useState([]);
  const [streak, setStreak] = useState(0);

  // Calculate week progress and streak
  useEffect(() => {
    const calculateProgress = async () => {
      const weekDates = getWeekDates();
      const progressData = [];

      for (const dateItem of weekDates) {
        const status = dateItem.isToday 
          ? dailyStatus 
          : await getDailyStatusForDate(dateItem.dateStr);
        
        const completedCount = status?.completed?.filter(id => 
          habits.some(h => h.id === id)
        ).length || 0;

        progressData.push({
          ...dateItem,
          completedCount,
          totalCount: habits.length,
          isAllDone: habits.length > 0 && completedCount >= habits.length,
        });
      }

      setWeekData(progressData);

      // Calculate streak
      let streakCount = 0;
      for (let i = progressData.length - 1; i >= 0; i--) {
        if (progressData[i].isAllDone) {
          streakCount++;
        } else if (!progressData[i].isToday) {
          break;
        }
      }
      setStreak(streakCount);
    };

    calculateProgress();
  }, [habits, dailyStatus, getDailyStatusForDate]);

  const todayCompleted = dailyStatus?.completed?.filter(id => 
    habits.some(h => h.id === id)
  ) || [];

  const completedCount = todayCompleted.length;
  const totalCount = habits.length;

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const getTodayDisplay = () => {
    const today = new Date();
    return today.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    }).toUpperCase();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} translucent={false} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Daily Progress</Text>
            <Text style={styles.subtitle}>{getTodayDisplay()}</Text>
          </View>
          {streak > 0 && (
            <View style={styles.streakBadge}>
              <Icon name="fire" size={18} color={COLORS.orange500} />
              <Text style={styles.streakText}>{streak}</Text>
            </View>
          )}
        </View>

        {/* Week Calendar */}
        {weekData.length > 0 && (
          <View style={styles.weekContainer}>
            {weekData.map((day) => (
              <View key={day.dateStr} style={styles.dayItem}>
                <Text style={styles.dayLabel}>{day.label}</Text>
                <View style={[
                  styles.dayBox,
                  { backgroundColor: getDayColor(day.completedCount, day.totalCount) }
                ]}>
                  <Text style={[
                    styles.dayNumber,
                    { color: getDayTextColor(day.completedCount, day.totalCount) }
                  ]}>
                    {day.dayNum}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Progress Summary */}
        {totalCount > 0 && (
          <View style={styles.progressCard}>
            <CircularProgress total={totalCount} completed={completedCount} />
            <View style={styles.progressText}>
              <Text style={styles.progressTitle}>
                {completedCount === totalCount ? '🎉 All Done!' : '💪 Keep Going!'}
              </Text>
              <Text style={styles.progressDesc}>
                {completedCount}/{totalCount} habits completed today
              </Text>
            </View>
          </View>
        )}

        {/* Habits List */}
        <View style={styles.habitsSection}>
          <Text style={styles.sectionTitle}>YOUR HABITS</Text>
          {habits.length === 0 ? (
            <Text style={styles.emptyText}>No habits added yet. Go to Schedule to create one!</Text>
          ) : (
            habits.map((habit) => (
              <HabitItem
                key={habit.id}
                habit={habit}
                isCompleted={todayCompleted.includes(habit.id)}
                onToggle={() => toggleHabitCompletion(habit.id)}
                showActions={false}
              />
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}



const CircularProgress = ({ total, completed }) => {
  const radius = 40;
  const strokeWidth = 6;
  const innerRadius = radius - strokeWidth * 2;
  const circumference = innerRadius * 2 * Math.PI;
  const progress = total > 0 ? completed / total : 0;
  const strokeDashoffset = circumference - (progress * circumference);

  return (
    <View style={styles.circleContainer}>
      <Svg height={radius * 2} width={radius * 2} style={styles.svg}>
        <Circle
          cx={radius}
          cy={radius}
          r={innerRadius}
          stroke={COLORS.primaryLight}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <Circle
          cx={radius}
          cy={radius}
          r={innerRadius}
          stroke={COLORS.primary}
          strokeWidth={strokeWidth}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          rotation="-90"
          origin={`${radius}, ${radius}`}
        />
      </Svg>
      <Text style={styles.progressValue}>{completed}/{total}</Text>
    </View>
  );
};

const getDayColor = (completed, total) => {
  if (total === 0) return COLORS.bg;
  const percent = completed / total;
  if (completed === 0) return COLORS.red100;
  if (percent < 0.5) return COLORS.green100;
  if (percent < 1) return COLORS.green500;
  return COLORS.green700;
};

const getDayTextColor = (completed, total) => {
  if (total === 0 || completed === 0) return COLORS.textDark;
  const percent = completed / total;
  return percent < 0.5 ? COLORS.textDark : COLORS.white;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textGray,
    marginTop: 4,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.orange100,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    gap: 4,
  },
  streakText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.orange500,
  },
  weekContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  dayItem: {
    alignItems: 'center',
    gap: 6,
  },
  dayLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textGray,
  },
  dayBox: {
    width: 44,
    height: 44,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  dayNumber: {
    fontSize: 14,
    fontWeight: '800',
  },
  progressCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  circleContainer: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  svg: {
    transform: [{ rotate: '0deg' }],
  },
  progressValue: {
    position: 'absolute',
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  progressText: {
    flex: 1,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  progressDesc: {
    fontSize: 13,
    color: COLORS.textGray,
    marginTop: 4,
  },
  habitsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textDark,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textGray,
    textAlign: 'center',
    paddingVertical: 24,
  },
});