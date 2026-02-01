import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Dimensions, ActivityIndicator, Alert,
  StatusBar
} from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

const { width } = Dimensions.get('window');

const COLORS = {
  bg: '#F8F9FE',
  primary: '#5E60CE',
  primaryLight: '#E0E0FF',
  secondary: '#4ADE80',
  secondaryLight: '#DCFCE7',
  danger: '#EF4444',
  dangerLight: '#FEE2E2',
  textDark: '#1E293B',
  textGray: '#64748B',
  white: '#FFFFFF',
  orangeLight: '#FFEDD5',
  orangeDark: '#F97316',
  borderColor: '#E2E8F0'
};

const getTodayStr = () => new Date().toISOString().split('T')[0];

export default function TodayScreen() {
  const [loading, setLoading] = useState(true);
  const [rawHabits, setRawHabits] = useState([]);
  const [completedIds, setCompletedIds] = useState([]);
  const [weekData, setWeekData] = useState([]);
  const [streak, setStreak] = useState(0);

  const userId = auth().currentUser?.uid;
  const todayStr = getTodayStr();
  const dateDisplay = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }).toUpperCase();

  useEffect(() => {
    if (!userId) return;

    const habitUnsub = firestore()
      .collection('users').doc(userId).collection('habits')
      .orderBy('startTime', 'asc')
      .onSnapshot(snapshot => {
        const habits = snapshot.docs.map(doc => ({
          key: doc.id,
          ...doc.data(),
          icon: getIconForHabit(doc.data().name)
        }));
        setRawHabits(habits);
        calculateWeekAndStreak(habits);
        setLoading(false);
      });

    const statusUnsub = firestore()
      .collection('users').doc(userId).collection('daily_status').doc(todayStr)
      .onSnapshot(doc => {
        setCompletedIds(doc.data()?.completed || []);
      });

    return () => {
      habitUnsub();
      statusUnsub();
    };
  }, [userId]);

  const calculateWeekAndStreak = async (currentHabits) => {
    const days = [];
    const today = new Date();
    let currentStreak = 0;
    let streakBroken = false;

    for (let i = -6; i <= 0; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];

      const snap = await firestore()
        .collection('users').doc(userId)
        .collection('daily_status').doc(dateStr).get();

      const doneCount = snap.data()?.completed?.length || 0;
      const isAllDone = currentHabits.length > 0 && doneCount === currentHabits.length;

      days.push({
        dayName: d.toLocaleDateString('en-US', { weekday: 'narrow' }),
        dayNum: d.getDate(),
        fullDate: dateStr,
        isAllDone,
        isToday: i === 0
      });
    }

    const reversedDays = [...days].reverse();

    reversedDays.forEach((day, idx) => {
      if (day.isAllDone) {
        currentStreak++;
      } else if (!day.isToday) {
        streakBroken = true;
      }
    });

    setWeekData(days);
    setStreak(currentStreak);
  };

  const toggleTask = async (habitId) => {
    if (!userId) return;
    const isCompleted = completedIds.includes(habitId);
    const docRef = firestore().collection('users').doc(userId).collection('daily_status').doc(todayStr);

    try {
      if (isCompleted) {
        await docRef.update({ completed: firestore.FieldValue.arrayRemove(habitId) });
      } else {
        await docRef.set({
          completed: firestore.FieldValue.arrayUnion(habitId),
          updatedAt: firestore.FieldValue.serverTimestamp()
        }, { merge: true });
      }
    } catch (error) {
      console.error(error);
    }
  };

  const getIconForHabit = (name) => {
    const n = name?.toLowerCase() || '';
    if (n.includes('gym')) return 'dumbbell';
    if (n.includes('read')) return 'book-open-variant';
    if (n.includes('code')) return 'laptop';
    if (n.includes('water')) return 'water';
    return 'checkbox-marked-circle-outline';
  };

  const completedCount = completedIds.length;
  const totalCount = rawHabits.length;
  const tasks = rawHabits.map(h => ({ ...h, isCompleted: completedIds.includes(h.key) }));

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#F8F9FE"
        translucent={false}
      />
      <ScrollView contentContainerStyle={styles.scrollContent}>

        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Daily Progress</Text>
            <Text style={styles.headerSubtitle}>{dateDisplay}</Text>
          </View>
          <View style={styles.streakBadge}>
            <Icon name="fire" size={20} color={COLORS.orangeDark} />
            <Text style={styles.streakCount}>{streak}</Text>
          </View>
        </View>

        {/* Calendar Strip with Red/Green Logic */}
        <View style={styles.calendarContainer}>
          {weekData.map((item, index) => (
            <View key={index} style={styles.calendarItem}>
              <Text style={styles.dayLabel}>{item.dayName}</Text>
              <View style={[
                styles.dateCircle,
                item.isToday ? styles.dateToday : (item.isAllDone ? styles.dateDone : styles.dateIncomplete)
              ]}>
                <Text style={[styles.dateText, (item.isAllDone || item.isToday) ? { color: '#FFF' } : { color: COLORS.danger }]}>
                  {item.dayNum}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Progress Card */}
        <View style={styles.progressCard}>
          <CircularProgress total={totalCount} completed={completedCount} />
          <View style={styles.progressTextContainer}>
            <Text style={styles.progressTitle}>{completedCount === totalCount ? "Goal Reached!" : "Keep Pushing!"}</Text>
            <Text style={styles.progressDesc}>Complete all tasks to maintain your streak.</Text>
          </View>
        </View>

        {/* Task List */}
        <View style={styles.tasksContainer}>
          <Text style={styles.sectionTitle}>MY HABITS</Text>
          {tasks.map((task) => (
            <TouchableOpacity key={task.key} onPress={() => toggleTask(task.key)} style={[styles.taskCard, task.isCompleted && styles.taskCardDone]}>
              <View style={styles.taskLeft}>
                <View style={[styles.taskIconBg, task.isCompleted && { backgroundColor: COLORS.secondaryLight }]}>
                  <Icon name={task.icon} size={24} color={task.isCompleted ? COLORS.secondary : COLORS.primary} />
                </View>
                <View>
                  <Text style={[styles.taskTitle, task.isCompleted && styles.textStrikethrough]}>{task.name}</Text>
                  <Text style={styles.taskTime}>{task.startTime} - {task.endTime}</Text>
                </View>
              </View>
              <View style={task.isCompleted ? styles.checkCircle : styles.plusBtn}>
                <Icon name={task.isCompleted ? "check" : "plus"} size={task.isCompleted ? 16 : 24} color={COLORS.white} />
              </View>
            </TouchableOpacity>
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const CircularProgress = ({ total, completed }) => {
  const radius = 35;
  const stroke = 7;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - ((total ? completed / total : 0) * circumference);

  return (
    <View style={styles.center}>
      <Svg height={radius * 2} width={radius * 2}>
        <Circle stroke={COLORS.primaryLight} fill="transparent" strokeWidth={stroke} r={normalizedRadius} cx={radius} cy={radius} />
        <Circle stroke={COLORS.primary} fill="transparent" strokeWidth={stroke} strokeDasharray={circumference + ' ' + circumference} style={{ strokeDashoffset }} strokeLinecap="round" r={normalizedRadius} cx={radius} cy={radius} rotation="-90" origin={`${radius}, ${radius}`} />
      </Svg>
      <Text style={styles.progressInnerPercent}>{completed}/{total}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 20,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  headerSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textGray,
    marginTop: 4,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.orangeLight,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 15,
    gap: 5,
  },
  streakCount: {
    color: COLORS.orangeDark,
    fontWeight: 'bold',
    fontSize: 14,
  },

  calendarContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  calendarItem: {
    alignItems: 'center',
    gap: 5,
  },
  dayLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textGray,
  },
  dateCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateToday: {
    backgroundColor: COLORS.primary,
  },
  dateDone: {
    backgroundColor: COLORS.secondary,
  },
  dateIncomplete: {
    backgroundColor: COLORS.dangerLight,
    borderWidth: 1,
    borderColor: COLORS.danger,
  },
  dateText: {
    fontWeight: '700',
    fontSize: 14,
  },

  progressCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  progressTextContainer: {
    flex: 1,
    marginLeft: 15,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textDark,
  },
  progressDesc: {
    fontSize: 12,
    color: COLORS.textGray,
    marginTop: 2,
  },
  progressInnerPercent: {
    position: 'absolute',
    fontWeight: 'bold',
    fontSize: 14,
    color: COLORS.textDark,
  },

  tasksContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textDark,
    marginBottom: 15,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  taskCard: {
    backgroundColor: COLORS.white,
    padding: 15,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 5,
  },
  taskCardDone: {
    opacity: 0.7,
  },
  taskLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  taskIconBg: {
    width: 45,
    height: 45,
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  textStrikethrough: {
    textDecorationLine: 'line-through',
    color: COLORS.textGray,
  },
  taskTime: {
    fontSize: 12,
    color: COLORS.textGray,
    marginTop: 2,
  },

  checkCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  plusBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
});