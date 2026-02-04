import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  FlatList, Alert, KeyboardAvoidingView, Platform,
  StatusBar
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { SafeAreaView } from 'react-native-safe-area-context';

const COLORS = {
  bg: '#F8F9FE',
  primary: '#5E60CE',
  textDark: '#1E293B',
  textGray: '#64748B',
  white: '#FFFFFF',
  borderColor: '#E2E8F0',
  delete: '#EF4444',
};

export default function NotesScreen() {
  const [notes, setNotes] = useState([]);
  const [search, setSearch] = useState('');
  const [noteTitle, setNoteTitle] = useState('');
  const [noteBody, setNoteBody] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [isInputVisible, setIsInputVisible] = useState(false);

  const userId = auth().currentUser?.uid;

  useEffect(() => {
    if (!userId) return;

    const subscriber = firestore()
      .collection('users').doc(userId).collection('notes')
      .orderBy('updatedAt', 'desc')
      .onSnapshot(querySnapshot => {
        const notesData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setNotes(notesData);
      });

    return () => subscriber();
  }, [userId]);

  const handleSaveNote = async () => {
    if (!noteTitle.trim() && !noteBody.trim()) return;

    const noteRef = firestore().collection('users').doc(userId).collection('notes');
    const noteData = {
      title: noteTitle,
      content: noteBody,
      updatedAt: firestore.FieldValue.serverTimestamp(),
    };

    try {
      if (editingId) {
        await noteRef.doc(editingId).update(noteData);
      } else {
        await noteRef.add(noteData);
      }
      resetForm();
    } catch (error) {
      Alert.alert('Error', 'Failed to save note.');
    }
  };

  const resetForm = () => {
    setNoteTitle('');
    setNoteBody('');
    setEditingId(null);
    setIsInputVisible(false);
  };

  const deleteNote = (id) => {
    Alert.alert("Delete Note", "Move this note to trash?", [
      { text: "Cancel" },
      {
        text: "Delete", style: "destructive", onPress: () => {
          firestore().collection('users').doc(userId).collection('notes').doc(id).delete();
        }
      }
    ]);
  };

  const startEditing = (note) => {
    setNoteTitle(note.title);
    setNoteBody(note.content);
    setEditingId(note.id);
    setIsInputVisible(true);
  };

  const filteredNotes = notes.filter(n =>
    n.title.toLowerCase().includes(search.toLowerCase()) ||
    n.content.toLowerCase().includes(search.toLowerCase())
  );

  const renderNote = ({ item }) => (
    <TouchableOpacity style={styles.noteCard} onPress={() => startEditing(item)}>
      <View style={styles.noteHeader}>
        <Text style={styles.noteTitle} numberOfLines={1}>{item.title || "Untitled Note"}</Text>
        <TouchableOpacity onPress={() => deleteNote(item.id)}>
          <Icon name="trash-can-outline" size={20} color={COLORS.textGray} />
        </TouchableOpacity>
      </View>
      
      {/* UPDATED: Removed numberOfLines to show full content */}
      <Text style={styles.noteContent}>{item.content}</Text>
      
      <Text style={styles.noteDate}>
        {item.updatedAt?.toDate().toLocaleDateString() || 'Just now'}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#F8F9FE"
        translucent={false}
      />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Notes</Text>
        <View style={styles.searchContainer}>
          <Icon name="magnify" size={20} color={COLORS.textGray} />
          <TextInput
            placeholder="Search notes..."
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      <FlatList
        data={filteredNotes}
        renderItem={renderNote}
        keyExtractor={item => item.id}
        // UPDATED: Removed numColumns={2} for single column list
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={<Text style={styles.emptyText}>No notes found.</Text>}
      />
      {!isInputVisible && (
        <TouchableOpacity style={styles.fab} onPress={() => setIsInputVisible(true)}>
          <Icon name="plus" size={30} color={COLORS.white} />
        </TouchableOpacity>
      )}
      {isInputVisible && (
        <View style={styles.overlay}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={resetForm}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSaveNote} style={styles.doneBtn}>
                <Text style={styles.doneText}>Save</Text>
              </TouchableOpacity>
            </View>
            <TextInput
              placeholder="Title"
              style={styles.inputTitle}
              value={noteTitle}
              onChangeText={setNoteTitle}
              autoFocus
            />
            <TextInput
              placeholder="Start typing..."
              style={styles.inputBody}
              multiline
              value={noteBody}
              onChangeText={setNoteBody}
            />
          </KeyboardAvoidingView>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg
  },
  header: {
    padding: 20
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.textDark,
    marginBottom: 15
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.borderColor,
  },
  searchInput: { flex: 1, paddingVertical: 12, marginLeft: 10, fontSize: 16 },

  listContent: { padding: 10 },
  noteCard: {
    backgroundColor: COLORS.white,
    marginVertical: 8, 
    marginHorizontal: 4,
    padding: 15,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.borderColor,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textDark,
    flex: 1
  },
  noteContent: {
    fontSize: 13,
    color: COLORS.textGray,
    lineHeight: 18,
    marginBottom: 10
  },
  noteDate: {
    fontSize: 10,
    color: COLORS.textGray,
    fontWeight: '600'
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    color: COLORS.textGray
  },

  fab: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    backgroundColor: COLORS.primary,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },

  // Editor Overlay
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.bg,
    zIndex: 10
  },
  modalContent: {
    flex: 1,
    padding: 20
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20
  },
  cancelText: {
    color: COLORS.textGray,
    fontSize: 16
  },
  doneBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20
  },
  doneText: {
    color: COLORS.white,
    fontWeight: 'bold'
  },
  inputTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.textDark,
    marginBottom: 15
  },
  inputBody: {
    fontSize: 16,
    color: COLORS.textDark,
    flex: 1,
    textAlignVertical: 'top'
  },
});