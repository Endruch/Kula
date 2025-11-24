// ═══════════════════════════════════════════════════════
// FEED SCREEN - ЛЕНТА СОБЫТИЙ
// ═══════════════════════════════════════════════════════
// Загружает события из backend и показывает как рилсы
// Автообновляется при переходе на вкладку
// ═══════════════════════════════════════════════════════

import React, { useState, useRef } from 'react';
import { 
  View, 
  FlatList, 
  Dimensions, 
  StyleSheet,
  Alert,
  ActivityIndicator,
  Text
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import EventVideo from '../../components/feed/EventVideo';
import EventCard from '../../components/feed/EventCard';
import CommentsModal from '../../components/feed/CommentsModal';
import { eventsAPI, likesAPI } from '../../services/api';
import { getToken } from '../../services/auth';

// логгер
import { log } from "../../utils/logger";

const { height } = Dimensions.get('window');

export default function FeedScreen() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentsModalVisible, setCommentsModalVisible] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const flatListRef = useRef<FlatList>(null);

  // Загружаем события когда экран в фокусе
  useFocusEffect(
    React.useCallback(() => {
      loadEvents();
    }, [])
  );

  const loadEvents = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const data = await eventsAPI.getAll(token || undefined);
      console.log('✅ События загружены:', data.length);
      
      // Преобразуем данные для совместимости
      const formattedEvents = data.map((event: any) => ({
        id: event.id,
        title: event.title,
        location: event.location,
        dateTime: event.dateTime,
        participants: event.participants || 0,
        maxParticipants: event.maxParticipants,
        likes: event.likes || 0,
        comments: event.comments || 0,
        isLiked: event.isLiked || false,
        videoUrl: event.videoUrl,
        creator: {
          id: event.creator.id,
          name: event.creator.username,
        },
      }));

      setEvents(formattedEvents);
    } catch (error) {
      console.error('Ошибка загрузки событий:', error);
      Alert.alert('Ошибка', 'Не удалось загрузить события');
    } finally {
      setLoading(false);
    }
  };

  // Когда пользователь свайпнул
  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setActiveIndex(viewableItems[0].index || 0);
    }
  }).current;

  // Когда нажали "Участвовать"
  const handleParticipate = (eventId: string) => {
    Alert.alert(
      'Участие подтверждено! 🎉',
      'Скоро добавим запись в backend',
      [{ text: 'ОК' }]
    );
  };

  // Когда нажали "Лайк"
  const handleLike = async (eventId: string) => {
    try {
      const token = await getToken();
      if (!token) {
        Alert.alert('Ошибка', 'Нужно войти в аккаунт');
        return;
      }

      // Отправляем toggle запрос
      const result = await likesAPI.toggle(token, eventId);
      
      // Обновляем событие в списке
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

  // Когда нажали на профиль создателя
  const handleProfilePress = (creatorId: string) => {
    Alert.alert(
      'Профиль',
      `Скоро откроется профиль пользователя ${creatorId}`,
      [{ text: 'ОК' }]
    );
  };

  // Рендерим каждое событие
  const renderItem = ({ item, index }: any) => (
    <View style={styles.itemContainer}>
      {/* Видео на фоне */}
      <EventVideo 
        videoUrl={item.videoUrl} 
        isActive={index === activeIndex}
      />
      
      {/* Информация поверх видео */}
      <EventCard 
        event={item}
        onParticipate={() => handleParticipate(item.id)}
        onLike={() => handleLike(item.id)}
        onComment={() => handleComment(item.id)}
        onProfilePress={() => handleProfilePress(item.creator.id)}
      />
    </View>
  );

  // Пока загружаются события
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00D4AA" />
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
  loadingContainer: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 16,
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: '#1a1a2e',
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
    color: '#fff',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});