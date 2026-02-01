import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Image, Alert, ScrollView,
  StatusBar
} from 'react-native';
import auth from '@react-native-firebase/auth';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { SafeAreaView } from 'react-native-safe-area-context';

const COLORS = {
  bg: '#F8F9FE',
  primary: '#5E60CE',
  textDark: '#1E293B',
  textGray: '#64748B',
  white: '#ffffff',
  danger: '#FF4D4D',
  borderColor: '#E2E8F0',
};

export default function SettingsScreen() {
  const user = auth().currentUser;

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to sign out?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: () => auth().signOut()
        }
      ]
    );
  };

  const SettingItem = ({ icon, title, color = COLORS.textDark, onPress }) => (
    <TouchableOpacity style={styles.item} onPress={onPress}>
      <View style={styles.itemLeft}>
        <View style={[styles.iconContainer, { backgroundColor: color + '15' }]}>
          <Icon name={icon} size={22} color={color} />
        </View>
        <Text style={[styles.itemText, { color }]}>{title}</Text>
      </View>
      <Icon name="chevron-right" size={20} color={COLORS.textGray} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#FFF"
        translucent={false}
      />
      <ScrollView>
        {/* Profile Header */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            {user?.photoURL ? (
              <Image source={{ uri: user.photoURL }} style={styles.avatar} />
            ) : (
              <View style={styles.placeholderAvatar}>
                <Text style={styles.avatarLetter}>
                  {user?.email?.charAt(0).toUpperCase() || 'U'}
                </Text>
              </View>
            )}
            <TouchableOpacity style={styles.editBadge}>
              <Icon name="camera" size={14} color={COLORS.white} />
            </TouchableOpacity>
          </View>

          <Text style={styles.userName}>{user?.displayName || 'User Name'}</Text>
          <Text style={styles.userEmail}>{user?.email || 'user@example.com'}</Text>
        </View>

        {/* Settings Sections */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.card}>
            <SettingItem icon="account-outline" title="Edit Profile" />
            <SettingItem icon="bell-outline" title="Notifications" />
            <SettingItem icon="shield-check-outline" title="Privacy" />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>More</Text>
          <View style={styles.card}>
            <SettingItem icon="help-circle-outline" title="Help Support" />
            <SettingItem icon="information-outline" title="About App" />
            <SettingItem
              icon="logout"
              title="Logout"
              color={COLORS.danger}
              onPress={handleLogout}
            />
          </View>
        </View>

        <Text style={styles.versionText}>Version 1.0.2</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 30,
    backgroundColor: COLORS.white,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  placeholderAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarLetter: {
    fontSize: 40,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.primary,
    padding: 8,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: COLORS.white,
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.textDark,
  },
  userEmail: {
    fontSize: 14,
    color: COLORS.textGray,
    marginTop: 4,
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 25,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textGray,
    marginBottom: 10,
    marginLeft: 5,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    paddingVertical: 5,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 5,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 15,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  itemText: {
    fontSize: 16,
    fontWeight: '600',
  },
  versionText: {
    textAlign: 'center',
    color: COLORS.textGray,
    fontSize: 12,
    marginTop: 30,
    marginBottom: 20,
  },
});