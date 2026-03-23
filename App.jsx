import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import auth from '@react-native-firebase/auth';

import { HabitProvider } from './src/context/HabitContext';
import LoginScreen from './src/screens/LoginScreen';
import TabNavigation from './src/Navigation/TabNavigation';

const Stack = createNativeStackNavigator();

export default function App() {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged((firebaseUser) => {
      setUser(firebaseUser);
      if (initializing) setInitializing(false);
    });

    return unsubscribe;
  }, [initializing]);

  if (initializing) return null;

  return (
    <HabitProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {user ? (
            <Stack.Screen name="MainTabs" component={TabNavigation} />
          ) : (
            <Stack.Screen name="Auth" component={LoginScreen} />
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </HabitProvider>
  );
}
