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
import MapScreen from '../screens/map/MapScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import { Text } from 'react-native';

const Tab = createBottomTabNavigator();

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