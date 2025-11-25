// ═══════════════════════════════════════════════════════
// APP.TSX - ГЛАВНАЯ ТОЧКА ВХОДА В ПРИЛОЖЕНИЕ
// ═══════════════════════════════════════════════════════
// Что делает этот файл:
// 1. Самый первый файл который запускается
// 2. Показывает AnimatedSplash при запуске (Lottie анимация)
// 3. Потом показывает основное приложение
// 4. Оборачивает всё в AuthProvider и NavigationContainer
//
// Структура:
// App
//  ├─ AnimatedSplash (показывается первым)
//  └─ После анимации:
//     └─ GestureHandlerRootView (для свайпов)
//        └─ AuthProvider
//           └─ NavigationContainer
//              └─ RootNavigator
//
// Простыми словами:
// - Открыл приложение → видишь Lottie анимацию
// - Анимация закончилась → основное приложение
// ═══════════════════════════════════════════════════════

import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider } from './src/context/AuthContext';
import RootNavigator from './src/navigation/RootNavigator';
import AnimatedSplash from './src/components/AnimatedSplash';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  // Пока показываем анимацию
  if (showSplash) {
    return <AnimatedSplash onFinish={() => setShowSplash(false)} />;
  }

  // После анимации - основное приложение
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