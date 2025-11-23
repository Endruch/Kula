// ═══════════════════════════════════════════════════════
// MAIN TAB NAVIGATOR - НИЖНЯЯ НАВИГАЦИЯ
// ═══════════════════════════════════════════════════════
// Вкладки:
// 1. Лента (рилсы событий)
// 2. Карта (события на карте)
// 3. Профиль (профиль пользователя + создание события)
// ═══════════════════════════════════════════════════════

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import FeedScreen from '../screens/feed/FeedScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import { View, Text, StyleSheet } from 'react-native';

const Tab = createBottomTabNavigator();

// ВРЕМЕННЫЙ экран карты
function MapScreen() {
  return (
    <View style={styles.centerContainer}>
      <Text style={styles.placeholder}>🗺️</Text>
      <Text style={styles.placeholderText}>Карта событий</Text>
      <Text style={styles.placeholderSubtext}>Скоро добавим!</Text>
    </View>
  );
}

export default function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#00D4AA',
        tabBarInactiveTintColor: '#666',
        tabBarStyle: {
          backgroundColor: '#1a1a2e',
          borderTopColor: '#2d2d44',
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      {/* Лента событий */}
      <Tab.Screen 
        name="FeedTab" 
        component={FeedScreen}
        options={{
          tabBarLabel: 'Лента',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size, color }}>🏠</Text>
          ),
        }}
      />

      {/* Карта событий */}
      <Tab.Screen 
        name="MapTab" 
        component={MapScreen}
        options={{
          tabBarLabel: 'Карта',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size, color }}>🗺️</Text>
          ),
        }}
      />

      {/* Профиль */}
      <Tab.Screen 
        name="ProfileTab" 
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Профиль',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size, color }}>👤</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholder: {
    fontSize: 80,
    marginBottom: 20,
  },
  placeholderText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  placeholderSubtext: {
    fontSize: 16,
    color: '#666',
  },
});