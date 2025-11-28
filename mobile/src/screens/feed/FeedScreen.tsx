// ═══════════════════════════════════════════════════════
// FEED SCREEN - ЛЕНТА СОБЫТИЙ
// ═══════════════════════════════════════════════════════
// Загружает события из backend и показывает как рилсы
// Автообновляется при переходе на вкладку
// Сортировка по расстоянию + рандомизация
// Скрытие UI по тапу + двойной тап для лайка
// Скрытие нижних табов в чистом режиме
// ═══════════════════════════════════════════════════════

import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  FlatList, 
  Dimensions, 
  StyleSheet,
  Alert,
  ActivityIndicator,
  Text,
  TouchableWithoutFeedback,
  Animated,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import * as Location from 'expo-location';
import EventVideo from '../../components/feed/EventVideo';
import EventCard from '../../components/feed/EventCard';
import CommentsModal from '../../components/feed/CommentsModal';
import { eventsAPI, likesAPI } from '../../services/api';
import { getToken } from '../../services/auth';

const { height } = Dimensions.get('window');

// ═══════════════════════════════════════════════════════
// 🎬 ВРЕМЕННЫЕ ТЕСТОВЫЕ ВИДЕО (удалить когда загрузка на сервер будет работать)
// ═══════════════════════════════════════════════════════
const TEMP_TEST_VIDEOS = [
  "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
  "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
  "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
  "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
  "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
  "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
  "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
  "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4",
  "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
  "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4",
  "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4",
  "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4",
];

// Функция для случайного выбора видео
const getRandomTestVideo = () => {
  return TEMP_TEST_VIDEOS[Math.floor(Math.random() * TEMP_TEST_VIDEOS.length)];
};
// ═══════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════
// ФУНКЦИИ РАСЧЁТА РАССТОЯНИЯ И СОРТИРОВКИ
// ═══════════════════════════════════════════════════════

// Функция расчёта расстояния между двумя точками (формула Haversine)
const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Радиус Земли в км
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Расстояние в км
};

// Функция рандомизации с приоритетом по расстоянию
const shuffleEventsByDistance = (
  events: any[],
  userLat: number | null,
  userLon: number | null,
  radiusKm: number = 5 // Радиус приоритета (5 км)
) => {
  if (!userLat || !userLon) {
    console.log('🎲 Геолокации нет - полностью случайный порядок');
    return events.sort(() => Math.random() - 0.5);
  }

  const nearEvents: any[] = [];
  const farEvents: any[] = [];

  events.forEach(event => {
    if (event.latitude && event.longitude) {
      const distance = calculateDistance(userLat, userLon, event.latitude, event.longitude);
      if (distance <= radiusKm) {
        nearEvents.push({ ...event, distance });
      } else {
        farEvents.push({ ...event, distance });
      }
    } else {
      farEvents.push(event);
    }
  });

  const shuffledNear = nearEvents.sort(() => Math.random() - 0.5);
  const shuffledFar = farEvents.sort(() => Math.random() - 0.5);

  console.log(`🎲 Близких событий (≤${radiusKm}км): ${nearEvents.length}`);
  console.log(`🎲 Дальних событий (>${radiusKm}км): ${farEvents.length}`);

  return [...shuffledNear, ...shuffledFar];
};

// ═══════════════════════════════════════════════════════
// ОСНОВНОЙ КОМПОНЕНТ
// ═══════════════════════════════════════════════════════

export default function FeedScreen({ route }: any) {
  const navigation = useNavigation<any>();
  const [activeIndex, setActiveIndex] = useState(0);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentsModalVisible, setCommentsModalVisible] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [isUIVisible, setIsUIVisible] = useState(true);
  const [showLikeHeart, setShowLikeHeart] = useState(false);
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  
  const flatListRef = useRef<FlatList>(null);
  const uiOpacity = useRef(new Animated.Value(1)).current;
  const heartOpacity = useRef(new Animated.Value(0)).current;
  const heartScale = useRef(new Animated.Value(0)).current;
  const lastTap = useRef<number>(0);

  // Получаем геолокацию пользователя
  useEffect(() => {
    const getUserLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          setUserLocation({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          });
          console.log('📍 Геолокация пользователя получена:', location.coords.latitude, location.coords.longitude);
        } else {
          console.log('⚠️ Геолокация не разрешена');
        }
      } catch (error) {
        console.error('Ошибка получения геолокации:', error);
      }
    };

    getUserLocation();
  }, []);

  // Скрываем/показываем табы в зависимости от UI
  useEffect(() => {
    navigation.setOptions({
      tabBarStyle: isUIVisible
        ? {
            backgroundColor: '#1a1a2e',
            borderTopColor: '#2d2d44',
            height: 65,
            paddingBottom: 8,
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
          }
        : { display: 'none' }, // Скрываем табы
    });
  }, [isUIVisible, navigation]);

  // Загружаем события когда экран в фокусе
  useFocusEffect(
    React.useCallback(() => {
      loadEvents();
      
      // ПОКАЗЫВАЕМ UI при возврате на экран
      console.log('🔄 Возврат на экран рилсов - показываем UI');
      setIsUIVisible(true);
      uiOpacity.setValue(1);
      
      // Останавливаем видео при уходе с экрана
      return () => {
        setActiveIndex(-1);
      };
    }, [userLocation])
  );

  // Обрабатываем возврат с карты
  useEffect(() => {
    if (route?.params?.scrollToIndex !== undefined) {
      const index = route.params.scrollToIndex;
      
      setTimeout(() => {
        flatListRef.current?.scrollToIndex({
          index,
          animated: false,
        });
        setActiveIndex(index);
      }, 100);
      
      navigation.setParams({ scrollToIndex: undefined });
    }
  }, [route?.params?.scrollToIndex]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const data = await eventsAPI.getAll();
      console.log('✅ События загружены:', data.length);
      
      const formattedEvents = data.map((event: any) => ({
        id: event.id,
        title: event.title,
        location: event.location,
        latitude: event.latitude,
        longitude: event.longitude,
        dateTime: event.dateTime,
        participants: event.participants || 0,
        maxParticipants: event.maxParticipants,
        likes: event.likes || 0,
        comments: event.comments || 0,
        isLiked: event.isLiked || false,
        // 🎬 ВРЕМЕННО: Если нет videoUrl, подставляем случайное тестовое видео
        videoUrl: event.videoUrl || getRandomTestVideo(),
        creator: {
          id: event.creator.id,
          name: event.creator.username,
        },
      }));

      const sortedEvents = shuffleEventsByDistance(
        formattedEvents,
        userLocation?.latitude || null,
        userLocation?.longitude || null,
        5
      );

      console.log('🎲 События отсортированы по расстоянию и перемешаны');
      console.log('🎬 Тестовые видео подставлены для событий без videoUrl');
      setEvents(sortedEvents);
    } catch (error) {
      console.error('Ошибка загрузки событий:', error);
      Alert.alert('Ошибка', 'Не удалось загрузить события');
    } finally {
      setLoading(false);
    }
  };

  // Когда пользователь свайпнул (НЕ меняем UI!)
  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setActiveIndex(viewableItems[0].index || 0);
    }
  }).current;

  // Когда нажали "Лайк"
  const handleLike = async (eventId: string) => {
    try {
      const result = await likesAPI.toggle(eventId);
      
      setEvents(prevEvents => 
        prevEvents.map(event => 
          event.id === eventId 
            ? { 
                ...event, 
                likes: result.likesCount,
                isLiked: result.isLiked
              }
            : event
        )
      );

      console.log(result.isLiked ? '❤️ Лайк добавлен' : '🤍 Лайк убран');
    } catch (error) {
      console.error('Ошибка лайка:', error);
      Alert.alert('Ошибка', 'Не удалось поставить лайк');
    }
  };

  // Анимация сердечка при двойном тапе
  const showHeartAnimation = () => {
    setShowLikeHeart(true);
    
    // Анимация появления
    Animated.parallel([
      Animated.timing(heartOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.spring(heartScale, {
        toValue: 1,
        friction: 3,
        useNativeDriver: true,
      }),
    ]).start();

    // Анимация исчезновения
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(heartOpacity, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(heartScale, {
          toValue: 1.5,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setShowLikeHeart(false);
        heartScale.setValue(0);
      });
    }, 300);
  };

  // Когда нажали "Комментарии"
  const handleComment = (eventId: string) => {
    setSelectedEventId(eventId);
    setCommentsModalVisible(true);
  };

  // Когда изменилось количество комментариев
  const handleCommentCountChange = (count: number) => {
    if (selectedEventId) {
      setEvents(prevEvents =>
        prevEvents.map(event =>
          event.id === selectedEventId
            ? { ...event, comments: count }
            : event
        )
      );
    }
  };

  // Когда нажали на карту
  const handleMapPress = (eventId: string) => {
    setActiveIndex(-1);
    
    navigation.navigate('EventDetail', { 
      eventId,
      fromFeedIndex: activeIndex
    });
  };

  // Переключение видимости UI + двойной тап
  const handleTap = () => {
    const now = Date.now();
    const DOUBLE_PRESS_DELAY = 300;

    if (now - lastTap.current < DOUBLE_PRESS_DELAY) {
      // Двойной тап - лайк (только если ещё не лайкнуто!)
      const currentEvent = events[activeIndex];
      if (currentEvent && !currentEvent.isLiked) {
        console.log('❤️ Двойной тап - ставим лайк!');
        handleLike(currentEvent.id);
        showHeartAnimation();
      } else if (currentEvent && currentEvent.isLiked) {
        console.log('❤️ Лайк уже стоит - ничего не делаем');
      }
      
      // Сбрасываем lastTap чтобы не считалось как одинарный тап
      lastTap.current = 0;
      return; // ← ВАЖНО! Выходим и НЕ меняем UI
    }

    // Запускаем таймер для одинарного тапа
    setTimeout(() => {
      if (now === lastTap.current) {
        // Одинарный тап - переключение UI
        const toValue = isUIVisible ? 0 : 1;
        
        Animated.timing(uiOpacity, {
          toValue,
          duration: 500,
          useNativeDriver: true,
        }).start();
        
        setIsUIVisible(!isUIVisible);
        console.log(isUIVisible ? '👁️ Скрываем UI' : '👁️ Показываем UI');
      }
    }, DOUBLE_PRESS_DELAY);

    lastTap.current = now;
  };

  // Обработчик для scrollToIndex
  const getItemLayout = (_data: any, index: number) => ({
    length: height,
    offset: height * index,
    index,
  });

  const onScrollToIndexFailed = (info: any) => {
    console.warn('Scroll to index failed:', info);
    setTimeout(() => {
      flatListRef.current?.scrollToIndex({
        index: info.index,
        animated: false,
      });
    }, 100);
  };

  // Рендерим каждое событие
  const renderItem = ({ item, index }: any) => (
    <TouchableWithoutFeedback onPress={handleTap}>
      <View style={styles.itemContainer}>
        {/* Видео на фоне */}
        <EventVideo 
          videoUrl={item.videoUrl} 
          isActive={index === activeIndex}
        />
        
        {/* Сердечко для лайка (по центру) */}
        {showLikeHeart && index === activeIndex && (
          <Animated.View
            style={[
              styles.likeHeartContainer,
              {
                opacity: heartOpacity,
                transform: [{ scale: heartScale }],
              },
            ]}
          >
            <Text style={styles.likeHeart}>❤️</Text>
          </Animated.View>
        )}
        
        {/* Информация поверх видео - с анимацией */}
        <Animated.View 
          style={{ 
            opacity: uiOpacity,
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
          }}
          pointerEvents={isUIVisible ? 'auto' : 'none'}
        >
          <EventCard 
            event={item}
            onLike={() => handleLike(item.id)}
            onComment={() => handleComment(item.id)}
            onMapPress={() => handleMapPress(item.id)}
          />
        </Animated.View>
      </View>
    </TouchableWithoutFeedback>
  );

  // Пока загружаются события
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6E47F5" />
        <Text style={styles.loadingText}>Загружаем события...</Text>
      </View>
    );
  }

  // Если событий нет
  if (events.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>📅</Text>
        <Text style={styles.emptyText}>Пока нет событий</Text>
        <Text style={styles.emptySubtext}>Создай первое событие!</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={events}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={height}
        snapToAlignment="start"
        decelerationRate="fast"
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{
          itemVisiblePercentThreshold: 50,
        }}
        getItemLayout={getItemLayout}
        onScrollToIndexFailed={onScrollToIndexFailed}
      />

      {/* Модальное окно комментариев */}
      {selectedEventId && (
        <CommentsModal
          visible={commentsModalVisible}
          eventId={selectedEventId}
          onClose={() => setCommentsModalVisible(false)}
          onCommentCountChange={handleCommentCountChange}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  itemContainer: {
    height: height,
    width: '100%',
  },
  likeHeartContainer: {
    position: 'absolute',
    top: '45%',
    left: '50%',
    marginLeft: -75,
    marginTop: -75,
    zIndex: 100,
  },
  likeHeart: {
    fontSize: 150,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginTop: 16,
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyIcon: {
    fontSize: 80,
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#BDBDBD',
    textAlign: 'center',
  },
});