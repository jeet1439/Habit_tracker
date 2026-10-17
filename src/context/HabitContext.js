import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

const HabitContext = createContext();

export const HabitProvider = ({ children }) => {
  const [habits, setHabits] = useState([]);
  const [dailyStatuses, setDailyStatuses] = useState({});
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const getTodayStr = useCallback(() => {
    const today = new Date();
    return [today.getFullYear(), String(today.getMonth() + 1).padStart(2, '0'), String(today.getDate()).padStart(2, '0')].join('-');
  }, []);
  const dailyStatus = useMemo(() => dailyStatuses[getTodayStr()] || { completed: [] }, [dailyStatuses, getTodayStr]);

  useEffect(() => auth().onAuthStateChanged((currentUser) => { setUser(currentUser); setLoading(false); }), []);
  useEffect(() => {
    if (!user?.uid) { setHabits([]); setDailyStatuses({}); return undefined; }
    const base = firestore().collection('users').doc(user.uid);
    const habitsUnsub = base.collection('habits').orderBy('createdAt', 'desc').onSnapshot(
      (snapshot) => setHabits(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))),
      (error) => console.error('Habits listener error:', error)
    );
    const statusUnsub = base.collection('daily_status').onSnapshot(
      (snapshot) => setDailyStatuses(snapshot.docs.reduce((statuses, doc) => ({ ...statuses, [doc.id]: doc.data() }), {})),
      (error) => console.error('Daily status listener error:', error)
    );
    return () => { habitsUnsub(); statusUnsub(); };
  }, [user]);

  const addHabit = useCallback(async (habitData) => {
    if (!user?.uid) return { success: false };
    try { await firestore().collection('users').doc(user.uid).collection('habits').add({ ...habitData, createdAt: firestore.FieldValue.serverTimestamp(), updatedAt: firestore.FieldValue.serverTimestamp() }); return { success: true }; }
    catch (error) { console.error('Error adding habit:', error); return { success: false, error: error.message }; }
  }, [user]);
  const updateHabit = useCallback(async (habitId, habitData) => {
    if (!user?.uid) return { success: false };
    try { await firestore().collection('users').doc(user.uid).collection('habits').doc(habitId).update({ ...habitData, updatedAt: firestore.FieldValue.serverTimestamp() }); return { success: true }; }
    catch (error) { console.error('Error updating habit:', error); return { success: false, error: error.message }; }
  }, [user]);
  const deleteHabit = useCallback(async (habitId) => {
    if (!user?.uid) return { success: false };
    try { await firestore().collection('users').doc(user.uid).collection('habits').doc(habitId).delete(); return { success: true }; }
    catch (error) { console.error('Error deleting habit:', error); return { success: false, error: error.message }; }
  }, [user]);
  const toggleHabitCompletion = useCallback(async (habitId) => {
    if (!user?.uid) return { success: false };
    const docRef = firestore().collection('users').doc(user.uid).collection('daily_status').doc(getTodayStr());
    try {
      if (dailyStatus.completed?.includes(habitId)) await docRef.update({ completed: firestore.FieldValue.arrayRemove(habitId), updatedAt: firestore.FieldValue.serverTimestamp() });
      else await docRef.set({ completed: firestore.FieldValue.arrayUnion(habitId), updatedAt: firestore.FieldValue.serverTimestamp() }, { merge: true });
      return { success: true };
    } catch (error) { console.error('Error toggling habit:', error); return { success: false, error: error.message }; }
  }, [dailyStatus, getTodayStr, user]);
  const getDailyStatusForDate = useCallback(async (dateStr) => dailyStatuses[dateStr] || { completed: [] }, [dailyStatuses]);

  return <HabitContext.Provider value={{ habits, dailyStatus, dailyStatuses, loading, user, getTodayStr, addHabit, updateHabit, deleteHabit, toggleHabitCompletion, getDailyStatusForDate }}>{children}</HabitContext.Provider>;
};
export const useHabits = () => {
  const context = useContext(HabitContext);
  if (!context) throw new Error('useHabits must be used within HabitProvider');
  return context;
};