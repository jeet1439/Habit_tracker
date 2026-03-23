import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS, getIconForHabit } from '../utils/constants';

const HabitItem = ({
  habit,
  isCompleted,
  onToggle,
  onEdit,
  onDelete,
  showActions = true,
}) => {
  const handleDelete = () => {
    Alert.alert(
      'Delete Habit',
      `Are you sure you want to delete "${habit.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => onDelete(habit.id),
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.habitContent}
        onPress={() => onToggle && onToggle(habit.id)}
        activeOpacity={0.7}
      >
        {/* Checkbox or Completion Status */}
        <View
          style={[
            styles.checkbox,
            isCompleted && { backgroundColor: COLORS.green500 },
          ]}
        >
          {isCompleted && (
            <Icon name="check" size={18} color={COLORS.white} />
          )}
        </View>

        {/* Habit Icon and Text */}
        <View style={styles.habitInfo}>
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: isCompleted ? COLORS.green100 : COLORS.primaryLight },
            ]}
          >
            <Icon
              name={getIconForHabit(habit.name)}
              size={20}
              color={isCompleted ? COLORS.green500 : COLORS.primary}
            />
          </View>
          <View style={styles.textContainer}>
            <Text
              style={[
                styles.habitName,
                isCompleted && { color: COLORS.textGray, textDecorationLine: 'line-through' },
              ]}
            >
              {habit.name}
            </Text>
            {habit.startTime && (
              <Text style={styles.habitTime}>{habit.startTime}</Text>
            )}
          </View>
        </View>
      </TouchableOpacity>

      {/* Action Buttons */}
      {showActions && (onEdit || onDelete) && (
        <View style={styles.actions}>
          {onEdit && (
            <TouchableOpacity
              style={[styles.actionButton, styles.editButton]}
              onPress={() => onEdit(habit.id)}
            >
              <Icon name="pencil" size={16} color={COLORS.blue500} />
            </TouchableOpacity>
          )}
          {onDelete && (
            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              onPress={handleDelete}
            >
              <Icon name="trash-can" size={16} color={COLORS.danger} />
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    marginVertical: 6,
    paddingVertical: 12,
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  habitContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.borderColor,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  habitInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  habitName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textDark,
    marginBottom: 4,
  },
  habitTime: {
    fontSize: 12,
    color: COLORS.textGray,
  },
  actions: {
    flexDirection: 'row',
    marginLeft: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 6,
  },
  editButton: {
    backgroundColor: COLORS.primaryLight,
  },
  deleteButton: {
    backgroundColor: COLORS.red100,
  },
});

export default HabitItem;
