import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

const HabitContext = createContext();

export const HabitProvider = ({ children }) => {
  const [habits, setHabits] = useState([]);
  const [dailyStatus, setDailyStatus] = useState({});
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  // Helper function to get today's date string
  const getTodayStr = useCallback(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }, []);

  // Initialize and listen to user changes
  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // Listen to habits and daily status
  useEffect(() => {
    if (!user?.uid) return;

    const userId = user.uid;
    const todayStr = getTodayStr();

    // Listen to habits collection
    const habitsUnsub = firestore()
      .collection('users')
      .doc(userId)
      .collection('habits')
      .orderBy('createdAt', 'desc')
      .onSnapshot(
        (snapshot) => {
          const habitsData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setHabits(habitsData);
        },
        (error) => console.error('Habits listener error:', error)
      );

    // Listen to today's daily status
    const statusUnsub = firestore()
      .collection('users')
      .doc(userId)
      .collection('daily_status')
      .doc(todayStr)
      .onSnapshot(
        (snapshot) => {
          setDailyStatus(snapshot.data() || { completed: [] });
        },
        (error) => console.error('Daily status listener error:', error)
      );

    return () => {
      habitsUnsub();
      statusUnsub();
    };
  }, [user, getTodayStr]);

  // Add a new habit
  const addHabit = useCallback(
    async (habitData) => {
      if (!user?.uid) return;
      
      try {
        await firestore()
          .collection('users')
          .doc(user.uid)
          .collection('habits')
          .add({
            ...habitData,
            createdAt: firestore.FieldValue.serverTimestamp(),
            updatedAt: firestore.FieldValue.serverTimestamp(),
          });
        return { success: true };
      } catch (error) {
        console.error('Error adding habit:', error);
        return { success: false, error: error.message };
      }
    },
    [user]
  );

  // Update an existing habit
  const updateHabit = useCallback(
    async (habitId, habitData) => {
      if (!user?.uid) return;
      
      try {
        await firestore()
          .collection('users')
          .doc(user.uid)
          .collection('habits')
          .doc(habitId)
          .update({
            ...habitData,
            updatedAt: firestore.FieldValue.serverTimestamp(),
          });
        return { success: true };
      } catch (error) {
        console.error('Error updating habit:', error);
        return { success: false, error: error.message };
      }
    },
    [user]
  );

  // Delete a habit
  const deleteHabit = useCallback(
    async (habitId) => {
      if (!user?.uid) return;
      
      try {
        await firestore()
          .collection('users')
          .doc(user.uid)
          .collection('habits')
          .doc(habitId)
          .delete();
        return { success: true };
      } catch (error) {
        console.error('Error deleting habit:', error);
        return { success: false, error: error.message };
      }
    },
    [user]
  );

  // Toggle habit completion for today
  const toggleHabitCompletion = useCallback(
    async (habitId) => {
      if (!user?.uid) return;

      const todayStr = getTodayStr();
      const isCompleted = dailyStatus.completed?.includes(habitId);

      try {
        const docRef = firestore()
          .collection('users')
          .doc(user.uid)
          .collection('daily_status')
          .doc(todayStr);

        if (isCompleted) {
          await docRef.update({
            completed: firestore.FieldValue.arrayRemove(habitId),
          });
        } else {
          await docRef.set(
            {
              completed: firestore.FieldValue.arrayUnion(habitId),
              updatedAt: firestore.FieldValue.serverTimestamp(),
            },
            { merge: true }
          );
        }
        return { success: true };
      } catch (error) {
        console.error('Error toggling habit:', error);
        return { success: false, error: error.message };
      }
    },
    [user, dailyStatus, getTodayStr]
  );

  // Get completion status for a specific date
  const getDailyStatusForDate = useCallback(
    async (dateStr) => {
      if (!user?.uid) return null;

      try {
        const snapshot = await firestore()
          .collection('users')
          .doc(user.uid)
          .collection('daily_status')
          .doc(dateStr)
          .get();
        return snapshot.data() || { completed: [] };
      } catch (error) {
        console.error('Error fetching daily status:', error);
        return { completed: [] };
      }
    },
    [user]
  );

  const value = {
    habits,
    dailyStatus,
    loading,
    user,
    getTodayStr,
    addHabit,
    updateHabit,
    deleteHabit,
    toggleHabitCompletion,
    getDailyStatusForDate,
  };

  return (
    <HabitContext.Provider value={value}>{children}</HabitContext.Provider>
  );
};

export const useHabits = () => {
  const context = useContext(HabitContext);
  if (!context) {
    throw new Error('useHabits must be used within HabitProvider');
  }
  return context;
};
