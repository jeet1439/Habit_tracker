import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS } from '../utils/constants';

const HabitForm = ({ visible, habit, onSave, onCancel }) => {
  const [habitName, setHabitName] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [description, setDescription] = useState('');
  const [frequency, setFrequency] = useState('daily');

  useEffect(() => {
    if (habit) {
      setHabitName(habit.name || '');
      setStartTime(habit.startTime || '');
      setEndTime(habit.endTime || '');
      setDescription(habit.description || '');
      setFrequency(habit.frequency || 'daily');
    } else {
      resetForm();
    }
  }, [habit, visible]);

  const resetForm = () => {
    setHabitName('');
    setStartTime('');
    setEndTime('');
    setDescription('');
    setFrequency('daily');
  };

  const handleSave = () => {
    if (!habitName.trim()) {
      alert('Please enter a habit name');
      return;
    }

    onSave({
      name: habitName.trim(),
      startTime,
      endTime,
      description,
      frequency,
    });

    resetForm();
  };

  const handleCancel = () => {
    resetForm();
    onCancel();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.overlay}>
          <View style={styles.modal}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>
                {habit ? 'Edit Habit' : 'New Habit'}
              </Text>
              <TouchableOpacity
                onPress={handleCancel}
                style={styles.closeButton}
              >
                <Icon name="close" size={24} color={COLORS.textDark} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
              {/* Habit Name */}
              <View style={styles.section}>
                <Text style={styles.label}>Habit Name *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Morning Workout"
                  placeholderTextColor={COLORS.textGray}
                  value={habitName}
                  onChangeText={setHabitName}
                  maxLength={50}
                />
              </View>

              {/* Start Time */}
              <View style={styles.section}>
                <Text style={styles.label}>Start Time</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., 06:00 AM (optional)"
                  placeholderTextColor={COLORS.textGray}
                  value={startTime}
                  onChangeText={setStartTime}
                  maxLength={10}
                />
              </View>

              {/* End Time */}
              <View style={styles.section}>
                <Text style={styles.label}>End Time</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., 07:00 AM (optional)"
                  placeholderTextColor={COLORS.textGray}
                  value={endTime}
                  onChangeText={setEndTime}
                  maxLength={10}
                />
              </View>

              {/* Frequency */}
              <View style={styles.section}>
                <Text style={styles.label}>Frequency</Text>
                <View style={styles.frequencyContainer}>
                  {['daily', 'weekly', 'custom'].map((freq) => (
                    <TouchableOpacity
                      key={freq}
                      style={[
                        styles.frequencyButton,
                        frequency === freq && styles.frequencyButtonActive,
                      ]}
                      onPress={() => setFrequency(freq)}
                    >
                      <Text
                        style={[
                          styles.frequencyButtonText,
                          frequency === freq && styles.frequencyButtonTextActive,
                        ]}
                      >
                        {freq.charAt(0).toUpperCase() + freq.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Description */}
              <View style={styles.section}>
                <Text style={styles.label}>Description (optional)</Text>
                <TextInput
                  style={[styles.input, styles.descriptionInput]}
                  placeholder="Why is this habit important to you?"
                  placeholderTextColor={COLORS.textGray}
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  maxLength={200}
                />
              </View>
            </ScrollView>

            {/* Action Buttons */}
            <View style={styles.footer}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={handleCancel}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.saveButton]}
                onPress={handleSave}
              >
                <Text style={styles.saveButtonText}>
                  {habit ? 'Update' : 'Create'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderColor,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  closeButton: {
    padding: 8,
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textDark,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.borderColor,
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: COLORS.textDark,
    backgroundColor: COLORS.bg,
  },
  descriptionInput: {
    height: 100,
  },
  frequencyContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  frequencyButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.borderColor,
    marginHorizontal: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  frequencyButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  frequencyButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textGray,
  },
  frequencyButtonTextActive: {
    color: COLORS.white,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderColor,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 6,
  },
  cancelButton: {
    backgroundColor: COLORS.bg,
    borderWidth: 1,
    borderColor: COLORS.borderColor,
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.white,
  },
});

export default HabitForm;
