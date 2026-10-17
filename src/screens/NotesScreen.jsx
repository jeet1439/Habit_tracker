import React, { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { COLORS } from '../utils/constants';

export default function NotesScreen() {
  const [weeklyGoal, setWeeklyGoal] = useState('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const userId = auth().currentUser?.uid;

  useEffect(() => {
    if (!userId) return undefined;
    return firestore().collection('users').doc(userId).collection('notes').doc('weekly').onSnapshot(
      (snapshot) => {
        const data = snapshot.data();
        setWeeklyGoal(data?.weeklyGoal || '');
        setNote(data?.note || '');
      },
      (error) => console.error('Weekly note listener error:', error)
    );
  }, [userId]);

  const save = async () => {
    if (!userId) return;
    setSaving(true);
    try {
      await firestore().collection('users').doc(userId).collection('notes').doc('weekly').set({
        weeklyGoal: weeklyGoal.trim(),
        note,
        updatedAt: firestore.FieldValue.serverTimestamp(),
      }, { merge: true });
    } catch (error) {
      console.error('Error saving weekly note:', error);
      Alert.alert('Could not save', 'Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} translucent={false} />
      <KeyboardAvoidingView style={styles.keyboardContainer} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.header}>
          <View><Text style={styles.title}>Weekly Notes</Text><Text style={styles.subtitle}>Set one focus, then write freely.</Text></View>
          <TouchableOpacity accessibilityLabel="Save weekly notes" disabled={saving} onPress={save} style={styles.saveButton}><Text style={styles.saveButtonText}>{saving ? 'Saving' : 'Save'}</Text></TouchableOpacity>
        </View>
        <View style={styles.content}>
          <Text style={styles.label}>WEEKLY GOAL</Text>
          <TextInput style={styles.goalInput} value={weeklyGoal} onChangeText={setWeeklyGoal} placeholder="What would make this week a win?" placeholderTextColor={COLORS.textGray} maxLength={180} returnKeyType="done" onSubmitEditing={save} />
          <Text style={styles.label}>NOTEPAD</Text>
          <TextInput style={styles.noteInput} value={note} onChangeText={setNote} placeholder="Write anything you want to remember..." placeholderTextColor={COLORS.textGray} multiline textAlignVertical="top" />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg }, keyboardContainer: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  title: { fontSize: 28, fontWeight: '800', color: COLORS.textDark }, subtitle: { fontSize: 13, color: COLORS.textGray, marginTop: 4 },
  saveButton: { backgroundColor: COLORS.primary, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 10 }, saveButtonText: { color: COLORS.white, fontSize: 14, fontWeight: '700' },
  content: { flex: 1, paddingHorizontal: 16, paddingBottom: 16 }, label: { fontSize: 12, fontWeight: '800', color: COLORS.textDark, letterSpacing: 1, marginTop: 12, marginBottom: 8 },
  goalInput: { backgroundColor: COLORS.surface, borderRadius: 12, borderWidth: 1, borderColor: COLORS.borderColor, color: COLORS.textDark, fontSize: 16, padding: 14 },
  noteInput: { flex: 1, minHeight: 240, backgroundColor: COLORS.surface, borderRadius: 12, borderWidth: 1, borderColor: COLORS.borderColor, color: COLORS.textDark, fontSize: 16, lineHeight: 24, padding: 14 },
});