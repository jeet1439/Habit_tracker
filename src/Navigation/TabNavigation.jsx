import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';

// Import screens
import TodayScreen from '../screens/TodayScreen';
import ScheduleScreen from '../screens/ScheduleScreen';
import NotesScreen from '../screens/NotesScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Tab = createBottomTabNavigator();

export default function TabNavigation() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#1E90FF',
        tabBarInactiveTintColor: '#A0A0A0',
        tabBarIcon: ({ color, focused }) => {
          let iconName;

          if (route.name === 'Today') iconName = focused ? 'calendar' : 'calendar-outline';
          else if (route.name === 'Schedule') iconName = focused ? 'stats-chart' : 'stats-chart-outline';
          else if (route.name === 'Notes') iconName = focused ? 'people' : 'people-outline';
          else if (route.name === 'Settings') iconName = focused ? 'settings' : 'settings-outline';

          return <Ionicons name={iconName} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Today" component={TodayScreen} />
      <Tab.Screen name="Schedule" component={ScheduleScreen} />
      <Tab.Screen name="Notes" component={NotesScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}
