// ═══════════════════════════════════════════════════════
// MAIN TAB NAVIGATOR - НИЖНЯЯ НАВИГАЦИЯ СО СВАЙПОМ
// ═══════════════════════════════════════════════════════
// Вкладки:
// 1. Лента (рилсы событий)
// 2. Карта (события на карте)
// 3. Профиль (профиль пользователя + создание события)
// Свайп влево/вправо между вкладками
// ═══════════════════════════════════════════════════════

import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import FeedScreen from '../screens/feed/FeedScreen';
import MapScreen from '../screens/map/MapScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import { Text } from 'react-native';

const Tab = createMaterialTopTabNavigator();

export default function MainTabNavigator() {
  return (
    <Tab.Navigator
      initialRouteName="FeedTab"
      tabBarPosition="bottom"
      screenOptions={{
        tabBarActiveTintColor: '#00D4AA',
        tabBarInactiveTintColor: '#666',
        tabBarStyle: {
          backgroundColor: '#1a1a2e',
          borderTopColor: '#2d2d44',
          borderTopWidth: 1,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          textTransform: 'none',
        },
        tabBarIndicatorStyle: {
          backgroundColor: '#00D4AA',
          height: 3,
          top: 0,
        },
        tabBarShowIcon: true, // ← ДОБАВЬ ЭТО
        swipeEnabled: true,
        lazy: true,
        lazyPreloadDistance: 0,
      }}
    >
      {/* Лента событий */}
      <Tab.Screen 
        name="FeedTab" 
        component={FeedScreen}
        options={{
          tabBarLabel: 'Лента',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 24, color, marginBottom: 4 }}>🏠</Text>
          ),
        }}
      />

      {/* Карта событий */}
      <Tab.Screen 
        name="MapTab" 
        component={MapScreen}
        options={{
          tabBarLabel: 'Карта',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 24, color, marginBottom: 4 }}>🗺️</Text>
          ),
        }}
      />

      {/* Профиль */}
      <Tab.Screen 
        name="ProfileTab" 
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Профиль',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 24, color, marginBottom: 4 }}>👤</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
}