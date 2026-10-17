import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useHabits } from '../context/HabitContext';
import HabitForm from '../components/HabitForm';
import HabitItem from '../components/HabitItem';
import { COLORS } from '../utils/constants';

export default function ScheduleScreen() {
  const { habits, addHabit, updateHabit, deleteHabit } = useHabits();
  const [formVisible, setFormVisible] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);

  const handleAddHabit = async (habitData) => {
    const result = await addHabit(habitData);
    if (result.success) {
      setFormVisible(false);
    }
  };

  const handleEditHabit = (habitId) => {
    const habit = habits.find(h => h.id === habitId);
    setEditingHabit(habit);
    setFormVisible(true);
  };

  const handleUpdateHabit = async (habitData) => {
    if (!editingHabit) return;
    const result = await updateHabit(editingHabit.id, habitData);
    if (result.success) {
      setFormVisible(false);
      setEditingHabit(null);
    }
  };

  const handleDeleteHabit = async (habitId) => {
    await deleteHabit(habitId);
  };

  const handleFormSave = editingHabit ? handleUpdateHabit : handleAddHabit;

  const handleFormCancel = () => {
    setFormVisible(false);
    setEditingHabit(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} translucent={false} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>My Habits</Text>
            <Text style={styles.subtitle}>{habits.length} active habits</Text>
          </View>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => {
              setEditingHabit(null);
              setFormVisible(true);
            }}
          >
            <Icon name="plus" size={24} color={COLORS.white} />
          </TouchableOpacity>
        </View>

        {/* Habits List */}
        {habits.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon name="target-outline" size={64} color={COLORS.primaryLight} />
            <Text style={styles.emptyTitle}>No habits yet</Text>
            <Text style={styles.emptySubtitle}>
              Create your first habit to start tracking your progress!
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => {
                setEditingHabit(null);
                setFormVisible(true);
              }}
            >
              <Icon name="plus" size={20} color={COLORS.white} />
              <Text style={styles.emptyButtonText}>Create Habit</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            {habits.map((habit) => (
              <HabitItem
                key={habit.id}
                habit={habit}
                isCompleted={false}
                onEdit={handleEditHabit}
                onDelete={handleDeleteHabit}
                showActions={true}
              />
            ))}
          </View>
        )}
      </ScrollView>

      {/* Form Modal */}
      <HabitForm
        visible={formVisible}
        habit={editingHabit}
        onSave={handleFormSave}
        onCancel={handleFormCancel}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  addButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textDark,
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.textGray,
    textAlign: 'center',
    marginTop: 8,
    marginHorizontal: 20,
  },
  emptyButton: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 24,
    alignItems: 'center',
    gap: 8,
  },
  emptyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.white,
  },
});