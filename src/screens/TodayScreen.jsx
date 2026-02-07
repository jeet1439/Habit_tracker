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
  
  green100: '#DCFCE7', 
  green300: '#86EFAC',
  green500: '#4ADE80',
  green700: '#15803D',
  green900: '#09662e',
  
  danger: '#e43c3c',
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
      });

    const statusUnsub = firestore()
      .collection('users').doc(userId).collection('daily_status').doc(todayStr)
      .onSnapshot(doc => {
        const completed = doc.data()?.completed || [];
        setCompletedIds(completed);

        if(rawHabits.length > 0) {
           calculateWeekAndStreak(rawHabits, completed);
        }
        setLoading(false);
      });

    return () => {
      habitUnsub();
      statusUnsub();
    };
  }, [userId]);

  const calculateWeekAndStreak = async (currentHabits, todayCompletedOverride = null) => {
    const days = [];
    const today = new Date();
    let currentStreak = 0;

    const totalHabitsCount = currentHabits.length;

    for (let i = -6; i <= 0; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      const isToday = i === 0;

      let doneCount = 0;

      if (isToday && todayCompletedOverride) {
        doneCount = todayCompletedOverride.length;
      } else {
        const snap = await firestore()
          .collection('users').doc(userId)
          .collection('daily_status').doc(dateStr).get();
        doneCount = snap.data()?.completed?.length || 0;
      }

      const isAllDone = totalHabitsCount > 0 && doneCount === totalHabitsCount;

      days.push({
        dayName: d.toLocaleDateString('en-US', { weekday: 'narrow' }),
        dayNum: d.getDate(),
        fullDate: dateStr,
        doneCount,
        totalCount: totalHabitsCount,
        isAllDone,
        isToday
      });
    }

    const reversedDays = [...days].reverse();
    for (let day of reversedDays) {
       if (day.isAllDone) {
         currentStreak++;
       } else if (!day.isToday) {
         break;
       }
    }

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
    if (n.includes('gym') || n.includes('workout')) return 'dumbbell';
    if (n.includes('read')) return 'book-open-variant';
    if (n.includes('code') || n.includes('dev')) return 'laptop';
    if (n.includes('water')) return 'water';
    if (n.includes('meditat')) return 'spa';
    return 'checkbox-marked-circle-outline';
  };

  const getColorForDay = (done, total) => {
    if (total === 0) return COLORS.bg; 
    if (done === 0) return COLORS.danger; 

    const ratio = done / total;

    if (ratio <= 0.25) return COLORS.green100;
    if (ratio <= 0.50) return COLORS.green300;
    if (ratio <= 0.75) return COLORS.green500;
    if (ratio < 1.0) return COLORS.green700;
    return COLORS.green900; // 100% done
  };

  const getTextColorForDay = (done, total) => {
    if (done === 0) return COLORS.white; 
    const ratio = done / total;
    if (ratio < 0.5 && ratio > 0) return COLORS.textDark; 
    return COLORS.white; 
  };

  const completedCount = completedIds.length;
  const totalCount = rawHabits.length;
  const tasks = rawHabits.map(h => ({ ...h, isCompleted: completedIds.includes(h.key) }));

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FE" translucent={false} />
      
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

        <View style={styles.calendarContainer}>
          {weekData.map((item, index) => {
            const bgColor = getColorForDay(item.doneCount, item.totalCount);
            const textColor = getTextColorForDay(item.doneCount, item.totalCount);
            
            return (
              <View key={index} style={styles.calendarItem}>
                <Text style={styles.dayLabel}>{item.dayName}</Text>
                <View style={[
                  styles.dateSquare, 
                  { backgroundColor: bgColor }
                ]}>
                  <Text style={[styles.dateText, { color: textColor }]}>
                    {item.dayNum}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Progress Card */}
        <View style={styles.progressCard}>
          <CircularProgress total={totalCount} completed={completedCount} />
          <View style={styles.progressTextContainer}>
            <Text style={styles.progressTitle}>
              {completedCount === totalCount && totalCount > 0 ? "All Clear!" : "Keep Going!"}
            </Text>
            <Text style={styles.progressDesc}>
              {completedCount}/{totalCount} tasks completed today.
            </Text>
          </View>
        </View>

        {/* Task List */}
        <View style={styles.tasksContainer}>
          <Text style={styles.sectionTitle}>MY HABITS</Text>
          {tasks.length === 0 ? (
            <Text style={{color: COLORS.textGray, textAlign: 'center', marginTop: 20}}>No habits added yet.</Text>
          ) : (
             tasks.map((task) => (
              <TouchableOpacity key={task.key} onPress={() => toggleTask(task.key)} style={[styles.taskCard, task.isCompleted && styles.taskCardDone]}>
                <View style={styles.taskLeft}>
                  <View style={[styles.taskIconBg, task.isCompleted && { backgroundColor: COLORS.green100 }]}>
                    <Icon name={task.icon} size={24} color={task.isCompleted ? COLORS.green700 : COLORS.primary} />
                  </View>
                  <View>
                    <Text style={[styles.taskTitle, task.isCompleted && styles.textStrikethrough]}>{task.name}</Text>
                    <Text style={styles.taskTime}>{task.startTime} - {task.endTime}</Text>
                  </View>
                </View>
                <View style={[styles.checkCircle, task.isCompleted ? {backgroundColor: COLORS.green500} : {backgroundColor: COLORS.primary}]}>
                  <Icon name={task.isCompleted ? "check" : "plus"} size={task.isCompleted ? 16 : 24} color={COLORS.white} />
                </View>
              </TouchableOpacity>
            ))
          )}
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
    gap: 8,
  },
  dayLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textGray,
  },
  dateSquare: {
    width: 40, 
    height: 40,
    borderRadius: 8, // Makes it a square with rounded corners
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  todayBorder: {
    borderWidth: 2,
  },
  dateText: {
    fontWeight: '800',
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
    opacity: 0.8,
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
    width: 35,
    height: 35,
    borderRadius: 17.5, 
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
});