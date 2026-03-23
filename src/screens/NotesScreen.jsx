import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StatusBar,
  FlatList,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { COLORS } from '../utils/constants';

export default function NotesScreen() {
  const [notes, setNotes] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState('');

  const userId = auth().currentUser?.uid;

  // Fetch notes from Firestore
  useEffect(() => {
    if (!userId) return;

    const unsub = firestore()
      .collection('users')
      .doc(userId)
      .collection('notes')
      .orderBy('updatedAt', 'desc')
      .onSnapshot(
        (snapshot) => {
          const notesData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setNotes(notesData);
        },
        (error) => console.error('Error fetching notes:', error)
      );

    return () => unsub();
  }, [userId]);

  const handleSaveNote = async () => {
    if (!title.trim() || !content.trim()) {
      alert('Please fill in both title and content');
      return;
    }

    try {
      const docRef = firestore()
        .collection('users')
        .doc(userId)
        .collection('notes');

      if (editingId) {
        await docRef.doc(editingId).update({
          title,
          content,
          updatedAt: firestore.FieldValue.serverTimestamp(),
        });
      } else {
        await docRef.add({
          title,
          content,
          createdAt: firestore.FieldValue.serverTimestamp(),
          updatedAt: firestore.FieldValue.serverTimestamp(),
        });
      }

      resetForm();
    } catch (error) {
      console.error('Error saving note:', error);
      alert('Failed to save note');
    }
  };

  const handleDeleteNote = (noteId) => {
    Alert.alert('Delete Note', 'Are you sure you want to delete this note?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await firestore()
              .collection('users')
              .doc(userId)
              .collection('notes')
              .doc(noteId)
              .delete();
          } catch (error) {
            console.error('Error deleting note:', error);
          }
        },
      },
    ]);
  };

  const handleEditNote = (note) => {
    setTitle(note.title);
    setContent(note.content);
    setEditingId(note.id);
    setShowForm(true);
  };

  const resetForm = () => {
    setTitle('');
    setContent('');
    setEditingId(null);
    setShowForm(false);
  };

  const filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(search.toLowerCase()) ||
      note.content.toLowerCase().includes(search.toLowerCase())
  );

  const renderNoteItem = ({ item }) => (
    <TouchableOpacity
      style={styles.noteCard}
      onPress={() => handleEditNote(item)}
    >
      <View style={styles.noteContent}>
        <Text style={styles.noteTitle}>{item.title}</Text>
        <Text style={styles.notePreview} numberOfLines={2}>
          {item.content}
        </Text>
        <Text style={styles.noteDate}>
          {item.updatedAt?.toDate?.()?.toLocaleDateString() || 'Just now'}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.deleteBtn}
        onPress={() => handleDeleteNote(item.id)}
      >
        <Icon name="trash-can" size={18} color={COLORS.danger} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  if (showForm) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} translucent={false} />
        <View style={styles.formHeader}>
          <TouchableOpacity onPress={resetForm}>
            <Icon name="arrow-left" size={24} color={COLORS.textDark} />
          </TouchableOpacity>
          <Text style={styles.formTitle}>
            {editingId ? 'Edit Note' : 'New Note'}
          </Text>
          <TouchableOpacity onPress={handleSaveNote}>
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.formContent}>
          <TextInput
            style={styles.titleInput}
            placeholder="Note Title"
            placeholderTextColor={COLORS.textGray}
            value={title}
            onChangeText={setTitle}
            maxLength={100}
          />
          <TextInput
            style={styles.contentInput}
            placeholder="Write your note here..."
            placeholderTextColor={COLORS.textGray}
            value={content}
            onChangeText={setContent}
            multiline
            textAlignVertical="top"
          />
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} translucent={false} />

      <View style={styles.header}>
        <Text style={styles.title}>My Notes</Text>
        <Text style={styles.subtitle}>{notes.length} notes</Text>
      </View>

      <View style={styles.searchContainer}>
        <Icon name="magnify" size={20} color={COLORS.textGray} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search notes..."
          placeholderTextColor={COLORS.textGray}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {notes.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="note-outline" size={64} color={COLORS.primaryLight} />
          <Text style={styles.emptyTitle}>No notes yet</Text>
          <Text style={styles.emptySubtitle}>
            Create a note to keep track of your habit progress!
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredNotes}
          renderItem={renderNoteItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No notes match your search</Text>
          }
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => {
          setTitle('');
          setContent('');
          setEditingId(null);
          setShowForm(true);
        }}
      >
        <Icon name="plus" size={28} color={COLORS.white} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.borderColor,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: COLORS.textDark,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  noteCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 12,
    marginVertical: 6,
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  noteContent: {
    flex: 1,
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: 4,
  },
  notePreview: {
    fontSize: 13,
    color: COLORS.textGray,
    marginBottom: 6,
  },
  noteDate: {
    fontSize: 11,
    color: COLORS.textGray,
    fontStyle: 'italic',
  },
  deleteBtn: {
    padding: 8,
    marginLeft: 8,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 16,
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
    marginTop: 80,
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
  emptyText: {
    fontSize: 14,
    color: COLORS.textGray,
    textAlign: 'center',
    marginTop: 40,
  },
  formHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderColor,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  formContent: {
    flex: 1,
    padding: 16,
  },
  titleInput: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: 16,
    paddingHorizontal: 0,
  },
  contentInput: {
    fontSize: 16,
    color: COLORS.textDark,
    minHeight: 200,
  },
});