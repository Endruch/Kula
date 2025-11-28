// ═══════════════════════════════════════════════════════
// APP.TSX - ГЛАВНАЯ ТОЧКА ВХОДА В ПРИЛОЖЕНИЕ
// ═══════════════════════════════════════════════════════
// Что делает этот файл:
// 1. Самый первый файл который запускается
// 2. Оборачивает всё в AuthProvider и NavigationContainer
//
// Структура:
// App
//  └─ GestureHandlerRootView (для свайпов)
//     └─ AuthProvider
//        └─ NavigationContainer
//           └─ RootNavigator
// ═══════════════════════════════════════════════════════

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider } from './src/context/AuthContext';
import RootNavigator from './src/navigation/RootNavigator';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}