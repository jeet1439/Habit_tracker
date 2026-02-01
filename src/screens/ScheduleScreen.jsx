import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, FlatList, KeyboardAvoidingView, Platform, Alert, Keyboard
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

const COLORS = {
  bg: '#F8F9FE',
  primary: '#5E60CE',
  primaryLight: '#E0E0FF',
  textDark: '#1E293B',
  textGray: '#64748B',
  white: '#FFFFFF',
  borderColor: '#E2E8F0',
  delete: '#EF4444',
  edit: '#3B82F6'
};

export default function ScheduleScreen() {
  const [habitName, setHabitName] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [habits, setHabits] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const userId = auth().currentUser?.uid;

  useEffect(() => {
    if (!userId) return;

    const subscriber = firestore()
      .collection('users')
      .doc(userId)
      .collection('habits') 
      .orderBy('createdAt', 'desc')
      .onSnapshot(querySnapshot => {
        const habitsData = [];
        querySnapshot.forEach(documentSnapshot => {
          habitsData.push({
            ...documentSnapshot.data(),
            key: documentSnapshot.id,
          });
        });
        setHabits(habitsData);
      }, error => {
        console.error("Snapshot error: ", error);
      });

    return () => subscriber();
  }, [userId]);

  const handleSaveHabit = async () => {
    if (!userId) {
      Alert.alert('Error', 'You must be logged in to save habits.');
      return;
    }

    if (habitName.trim() === '' || startTime.trim() === '' || endTime.trim() === '') {
      Alert.alert('Missing Fields', 'Please fill in all fields.');
      return;
    }

    const userHabitsRef = firestore()
      .collection('users')
      .doc(userId)
      .collection('habits');

    try {
      if (editingId) {
        await userHabitsRef.doc(editingId).update({
          name: habitName,
          startTime: startTime,
          endTime: endTime,
        });
        Alert.alert('Success', 'Habit updated');
      } else {
        await userHabitsRef.add({
          name: habitName,
          startTime: startTime,
          endTime: endTime,
          createdAt: firestore.FieldValue.serverTimestamp(),
        });
      }
      resetForm();
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Could not save data.');
    }
  };

  const handleEditPress = (item) => {
    setHabitName(item.name);
    setStartTime(item.startTime);
    setEndTime(item.endTime);
    setEditingId(item.key);
  };

  const handleDeletePress = (id) => {
    Alert.alert(
      "Delete Habit",
      "Are you sure?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            firestore()
              .collection('users')
              .doc(userId)
              .collection('habits')
              .doc(id)
              .delete();
            if (editingId === id) resetForm();
          }
        }
      ]
    );
  };

  const resetForm = () => {
    setHabitName('');
    setStartTime('');
    setEndTime('');
    setEditingId(null);
    Keyboard.dismiss();
  };

  const renderHabit = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardInfo}>
        <Text style={styles.habitTitle}>{item.name}</Text>
        <View style={styles.timeContainer}>
          <Text style={styles.timeLabel}>Start: <Text style={styles.timeValue}>{item.startTime}</Text></Text>
          <Text style={styles.timeDivider}>|</Text>
          <Text style={styles.timeLabel}>End: <Text style={styles.timeValue}>{item.endTime}</Text></Text>
        </View>
      </View>

      <View style={styles.actionGroup}>
        <TouchableOpacity
          onPress={() => handleEditPress(item)}
          style={[styles.iconBtn, { backgroundColor: COLORS.edit + '20' }]}
        >
          <Text style={{ color: COLORS.edit, fontWeight: 'bold' }}>Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleDeletePress(item.key)}
          style={[styles.iconBtn, { backgroundColor: COLORS.delete + '20', marginLeft: 8 }]}
        >
          <Text style={{ color: COLORS.delete, fontWeight: 'bold' }}>✕</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Daily Schedule</Text>
        <Text style={styles.headerSub}>Personalized for your account</Text>
      </View>

      <FlatList
        data={habits}
        renderItem={renderHabit}
        contentContainerStyle={styles.listPadding}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No habits yet. Start building one!</Text>
        }
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inputWrapper}
      >
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Habit Name (e.g. Gym)"
            value={habitName}
            onChangeText={setHabitName}
          />

          <View style={styles.timeRow}>
            <TextInput
              style={[styles.input, { flex: 1, marginRight: 10 }]}
              placeholder="Start (e.g. 9:00 AM)"
              value={startTime}
              onChangeText={setStartTime}
            />
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="End (e.g. 10:00 AM)"
              value={endTime}
              onChangeText={setEndTime}
            />
          </View>

          <View style={styles.btnRow}>
            {editingId && (
              <TouchableOpacity style={styles.cancelBtn} onPress={resetForm}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.saveBtn} onPress={handleSaveHabit}>
              <Text style={styles.saveBtnText}>
                {editingId ? 'Update Habit' : 'Add Habit'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: COLORS.bg 
  },
  header: {
    paddingHorizontal: 25,
     paddingTop: 10, 
     paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderColor
  },
  headerTitle: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    color: COLORS.textDark 
  },
  headerSub: { 
    fontSize: 14, 
    color: COLORS.textGray, 
    marginTop: 4 
  },
  listPadding: { 
    padding: 20, 
    paddingBottom: 250 
  },
  emptyText: { 
    textAlign: 'center', 
    color: COLORS.textGray, 
    marginTop: 50, 
    fontSize: 16 
  },
  card: {
    backgroundColor: COLORS.white,
     padding: 18, 
     borderRadius: 16,
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 12,
    borderWidth: 1, 
    borderColor: COLORS.borderColor,
     elevation: 2,
  },
  cardInfo: { flex: 1 },
  habitTitle: { 
    fontSize: 18, 
    fontWeight: '700', 
    color: COLORS.textDark, 
    marginBottom: 6 
  
  },
  timeContainer: { 
    flexDirection: 'row', 
    alignItems: 'center' 

  },
  timeLabel: { 
    fontSize: 13,
     color: COLORS.textGray 

  },
  timeValue: { 
    color: COLORS.primary,
     fontWeight: '600' 

  },
  timeDivider: { 
    marginHorizontal: 8, 
    color: COLORS.borderColor 

  },
  actionGroup: { 
    flexDirection: 'row', 
    alignItems: 'center' 

  },
  iconBtn: { 
    paddingHorizontal: 12, 
    paddingVertical: 8, 
    borderRadius: 8 

  },
  inputWrapper: {
    position: 'absolute', bottom: 0, width: '100%',
    backgroundColor: COLORS.white, borderTopLeftRadius: 25, borderTopRightRadius: 25,
    padding: 20, elevation: 20,
  },
  inputContainer: { 
    flexDirection: 'column' 
  },
  input: {
    backgroundColor: COLORS.bg, 
    padding: 14, 
    borderRadius: 12,
    color: COLORS.textDark, 
    fontSize: 15, borderWidth: 1,
    borderColor: COLORS.borderColor, 
    marginBottom: 10
  },
  timeRow: { 
    flexDirection: 'row', 
    marginBottom: 15 
  },
  btnRow: { 
    flexDirection: 'row' 
  },
  saveBtn: {
    flex: 1, 
    backgroundColor: COLORS.primary, 
    padding: 16,
    borderRadius: 12, 
    alignItems: 'center',
  },
  saveBtnText: { 
    color: COLORS.white, 
    fontWeight: 'bold', 
    fontSize: 16
  },
  cancelBtn: {
    marginRight: 10, 
    padding: 16, 
    borderRadius: 12,
    alignItems: 'center', 
    backgroundColor: COLORS.bg,
    borderWidth: 1, 
    borderColor: COLORS.borderColor
  },
  cancelBtnText: { 
    color: COLORS.textGray, 
    fontWeight: '600' }
});