// ═══════════════════════════════════════════════════════
// EVENT VIDEO - КОМПОНЕНТ ВИДЕО СОБЫТИЯ
// ═══════════════════════════════════════════════════════
// Что делает:
// 1. Показывает вертикальное видео события на весь экран
// 2. Автоматически воспроизводит когда видимо
// 3. Останавливает когда пользователь свайпнул дальше
//
// Props:
// - videoUrl: string - ссылка на видео
// - isActive: boolean - видимо ли видео сейчас
//
// Простыми словами:
// - Это "плеер" для видео события
// - Как в TikTok - видео на весь экран
// ═══════════════════════════════════════════════════════

import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Video, ResizeMode } from 'expo-av';

const { width, height } = Dimensions.get('window');

interface EventVideoProps {
  videoUrl: string;
  isActive: boolean;
}

export default function EventVideo({ videoUrl, isActive }: EventVideoProps) {
  const videoRef = useRef<Video>(null);

  useEffect(() => {
    if (videoRef.current) {
      if (isActive) {
        // Видео активно - играем
        videoRef.current.playAsync();
      } else {
        // Видео неактивно - останавливаем
        videoRef.current.pauseAsync();
        videoRef.current.setPositionAsync(0); // Сбрасываем на начало
      }
    }
  }, [isActive]);

  return (
    <View style={styles.container}>
      <Video
        ref={videoRef}
        source={{ uri: videoUrl }}
        style={styles.video}
        resizeMode={ResizeMode.COVER}
        shouldPlay={isActive}
        isLooping
        isMuted={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: width,
    height: height,
    backgroundColor: '#000',
  },
  video: {
    width: '100%',
    height: '100%',
  },
});