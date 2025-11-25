// src/navigation/RootNavigator.tsx
import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';

import WelcomeScreen from '../screens/auth/WelcomeScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import MainTabNavigator from './MainTabNavigator';
import ProfileScreen from '../screens/profile/ProfileScreen';
import CreateEventScreen from '../screens/create/CreateEventScreen';
import EventDetailScreen from '../screens/event/EventDetailScreen';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const { isLoading, isLoggedIn, userData } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4ecca3" />
      </View>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      {isLoggedIn ? (
        <>
          <Stack.Screen 
            name="Main" 
            component={MainTabNavigator}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="CreateEvent" 
            component={CreateEventScreen}
            options={{ 
              headerShown: false,
              presentation: 'modal',
            }}
          />
          {/* ← ДОБАВЬ ЭТО */}
          <Stack.Screen 
            name="EventDetail" 
            component={EventDetailScreen}
            options={{ 
              headerShown: false,
              presentation: 'card', // Обычный переход
            }}
          />
        </>
      ) : (
        <>
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    alignItems: 'center',
    justifyContent: 'center',
  },
});