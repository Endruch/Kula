// ═══════════════════════════════════════════════════════
// ANIMATED SPLASH - ПРОСТАЯ АНИМИРОВАННАЯ ЗАСТАВКА
// ═══════════════════════════════════════════════════════
// Что делает:
// 1. Скрывает встроенный Expo splash сразу
// 2. Показывает твой логотип с плавной анимацией
// 3. Через 2 секунды переходит в приложение
//
// Простая версия БЕЗ Lottie - работает стабильно!
// ═══════════════════════════════════════════════════════

import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Animated, Image } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';

// Держим встроенный splash
SplashScreen.preventAutoHideAsync();

interface AnimatedSplashProps {
  onFinish: () => void;
}

export default function AnimatedSplash({ onFinish }: AnimatedSplashProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const [isReady, setIsReady] = useState(false);

    useEffect(() => {
    // Даём время Expo splash скрыться
    const prepare = async () => {
      try {
        // Скрываем встроенный Expo splash
        await SplashScreen.hideAsync();
        setIsReady(true);
        
        // Сразу запускаем нашу анимацию
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 5,
            tension: 50,
            useNativeDriver: true,
          }),
        ]).start();

        // Закрываем нашу анимацию через 2.5 секунды
        setTimeout(() => {
          onFinish();
        }, 1300);
      } catch (e) {
        console.warn('Splash error:', e);
        setIsReady(true);
      }
    };

    prepare();
  }, []);

  if (!isReady) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
          alignItems: 'center',
        }}
      >
        <Image
          source={require('../../assets/icon.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 200,
    height: 200,
  },
});