// ═══════════════════════════════════════════════════════
// MAIN TAB NAVIGATOR - НАВИГАЦИЯ ПОВЕРХ КАРТЫ (НЕПРОЗРАЧНАЯ)
// ═══════════════════════════════════════════════════════
// Вкладки:
// 1. Лента (рилсы событий)
// 2. Поиск (поиск с фильтрами)
// 3. Карта (события на карте - НА ВЕСЬ ЭКРАН)
// 4. Избранное (сохраненные события)
// 5. Профиль (профиль пользователя)
// Навигация ПОВЕРХ контента (абсолютное позиционирование)
// Навигация НЕПРОЗРАЧНАЯ (как было)
// ═══════════════════════════════════════════════════════

import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import FeedScreen from '../screens/feed/FeedScreen';
import SearchScreen from '../screens/search/SearchScreen';
import MapScreen from '../screens/map/MapScreen';
import FavoritesScreen from '../screens/favorites/FavoritesScreen';
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
          backgroundColor: '#1a1a2e', // НЕПРОЗРАЧНЫЙ как было
          borderTopColor: '#2d2d44',
          borderTopWidth: 1,
          height: 65,
          paddingBottom: 8,
          position: 'absolute', // ВАЖНО: Абсолютное позиционирование
          bottom: 0,
          left: 0,
          right: 0,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          textTransform: 'none',
          marginTop: 0,
        },
        tabBarIndicatorStyle: {
          backgroundColor: '#00D4AA',
          height: 3,
          top: 0,
        },
        tabBarShowIcon: true,
        swipeEnabled: true,
        lazy: true,
        lazyPreloadDistance: 0,
      }}
    >
      {/* 1. Лента событий */}
      <Tab.Screen 
        name="FeedTab" 
        component={FeedScreen}
        options={{
          tabBarLabel: 'Лента',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 22, color, marginBottom: 2 }}>🏠</Text>
          ),
        }}
      />

      {/* 2. Поиск */}
      <Tab.Screen 
        name="SearchTab" 
        component={SearchScreen}
        options={{
          tabBarLabel: 'Поиск',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 22, color, marginBottom: 2 }}>🔍</Text>
          ),
        }}
      />

      {/* 3. Карта событий */}
      <Tab.Screen 
        name="MapTab" 
        component={MapScreen}
        options={{
          tabBarLabel: 'Карта',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 22, color, marginBottom: 2 }}>🗺️</Text>
          ),
        }}
      />

      {/* 4. Избранное */}
      <Tab.Screen 
        name="FavoritesTab" 
        component={FavoritesScreen}
        options={{
          tabBarLabel: 'Избранное',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 22, color, marginBottom: 2 }}>⭐</Text>
          ),
        }}
      />

      {/* 5. Профиль */}
      <Tab.Screen 
        name="ProfileTab" 
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Профиль',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 22, color, marginBottom: 2 }}>👤</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
}