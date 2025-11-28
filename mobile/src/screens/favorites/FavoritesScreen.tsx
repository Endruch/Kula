// ═══════════════════════════════════════════════════════
// FAVORITES SCREEN - ИЗБРАННЫЕ СОБЫТИЯ
// ═══════════════════════════════════════════════════════
// Показывает события, которые пользователь добавил в избранное
// Обновлено: верстка по дизайн-системе KULA
// ═══════════════════════════════════════════════════════

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { eventsAPI } from '../../services/api';

export default function FavoritesScreen() {
  const navigation = useNavigation();
  const [favoriteEvents, setFavoriteEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Загружаем избранное когда экран в фокусе
  useFocusEffect(
    React.useCallback(() => {
      loadFavorites();
    }, [])
  );

  const loadFavorites = async () => {
    try {
      setLoading(true);
      // TODO: Реализовать API endpoint для избранного
      // Пока показываем пустой список
      setFavoriteEvents([]);
    } catch (error) {
      console.error('Ошибка загрузки избранного:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEventPress = (event: any) => {
    navigation.navigate('EventDetail' as never, { eventId: event.id } as never);
  };

  const handleRemoveFromFavorites = async (eventId: string) => {
    // TODO: Реализовать удаление из избранного
    console.log('Remove from favorites:', eventId);
    // Оптимистичное обновление UI
    setFavoriteEvents(prev => prev.filter(e => e.id !== eventId));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <View style={styles.container}>
      {/* Заголовок */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Избранное</Text>
        <Text style={styles.headerSubtitle}>
          {favoriteEvents.length > 0 
            ? `${favoriteEvents.length} ${favoriteEvents.length === 1 ? 'событие' : 'событий'}`
            : 'Сохраняйте интересные события'
          }
        </Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6E47F5" />
        </View>
      ) : favoriteEvents.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIconContainer}>
            <Text style={styles.emptyIcon}>⭐</Text>
          </View>
          <Text style={styles.emptyTitle}>Пока пусто</Text>
          <Text style={styles.emptyText}>
            Добавляйте события в избранное{'\n'}
            чтобы не потерять их
          </Text>
          <TouchableOpacity
            style={styles.exploreButton}
            onPress={() => navigation.navigate('FeedTab' as never)}
            activeOpacity={0.8}
          >
            <Text style={styles.exploreButtonText}>Открыть ленту</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView 
          style={styles.eventsList} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.eventsListContent}
        >
          {favoriteEvents.map((event) => (
            <TouchableOpacity
              key={event.id}
              style={styles.eventCard}
              onPress={() => handleEventPress(event)}
              activeOpacity={0.9}
            >
              {/* Превью видео */}
              <View style={styles.eventThumbnail}>
                <View style={styles.playIconContainer}>
                  <Text style={styles.playIcon}>▶</Text>
                </View>
                {/* TODO: Добавить реальное превью видео */}
              </View>

              {/* Информация о событии */}
              <View style={styles.eventInfo}>
                <View style={styles.eventHeader}>
                  <Text style={styles.eventTitle} numberOfLines={2}>
                    {event.title}
                  </Text>
                  
                  {/* Кнопка избранного */}
                  <TouchableOpacity
                    style={styles.favoriteButton}
                    onPress={(e) => {
                      e.stopPropagation();
                      handleRemoveFromFavorites(event.id);
                    }}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Text style={styles.favoriteIconActive}>⭐</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.eventDetails}>
                  <View style={styles.eventDetailRow}>
                    <Text style={styles.eventDetailIcon}>📍</Text>
                    <Text style={styles.eventDetailText} numberOfLines={1}>
                      {event.locationArea}
                    </Text>
                  </View>

                  <View style={styles.eventDetailRow}>
                    <Text style={styles.eventDetailIcon}>📅</Text>
                    <Text style={styles.eventDetailText}>
                      {formatDate(event.dateTime)}
                    </Text>
                  </View>

                  <View style={styles.eventDetailRow}>
                    <Text style={styles.eventDetailIcon}>👥</Text>
                    <Text style={[
                      styles.eventDetailText,
                      styles.participantsText
                    ]}>
                      {event.participants}/{event.maxParticipants}
                    </Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000', // Основной фон
  },
  
  // ═══════════════════════════════════════════════════════
  // HEADER
  // ═══════════════════════════════════════════════════════
  header: {
    paddingTop: 60, // Статус бар + 16
    paddingBottom: 24,
    paddingHorizontal: 16, // По дизайн-системе
    backgroundColor: '#000000',
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
  },
  headerTitle: {
    fontSize: 28, // Заголовок 1
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
    lineHeight: 32,
  },
  headerSubtitle: {
    fontSize: 14, // Текст второстепенный
    color: '#8D8D8D',
    lineHeight: 18,
  },

  // ═══════════════════════════════════════════════════════
  // LOADING
  // ═══════════════════════════════════════════════════════
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },

  // ═══════════════════════════════════════════════════════
  // EMPTY STATE
  // ═══════════════════════════════════════════════════════
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    backgroundColor: '#000000',
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#1E1E1E',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyIcon: {
    fontSize: 56,
  },
  emptyTitle: {
    fontSize: 22, // Заголовок 2
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
    lineHeight: 28,
  },
  emptyText: {
    fontSize: 14,
    color: '#8D8D8D',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 20,
  },
  exploreButton: {
    backgroundColor: '#6E47F5', // Primary цвет
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#6E47F5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  exploreButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 20,
  },

  // ═══════════════════════════════════════════════════════
  // EVENTS LIST
  // ═══════════════════════════════════════════════════════
  eventsList: {
    flex: 1,
    backgroundColor: '#000000',
  },
  eventsListContent: {
    padding: 16,
  },
  eventCard: {
    backgroundColor: '#1E1E1E', // Поверхности
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  
  // ═══════════════════════════════════════════════════════
  // EVENT THUMBNAIL
  // ═══════════════════════════════════════════════════════
  eventThumbnail: {
    width: '100%',
    height: 180,
    backgroundColor: '#121212',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(110, 71, 245, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIcon: {
    fontSize: 20,
    color: '#FFFFFF',
    marginLeft: 4, // Визуальное центрирование треугольника
  },

  // ═══════════════════════════════════════════════════════
  // EVENT INFO
  // ═══════════════════════════════════════════════════════
  eventInfo: {
    padding: 16,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  eventTitle: {
    flex: 1,
    fontSize: 16, // Текст основной
    fontWeight: '600',
    color: '#FFFFFF',
    lineHeight: 22,
    marginRight: 8,
  },
  
  // ═══════════════════════════════════════════════════════
  // FAVORITE BUTTON
  // ═══════════════════════════════════════════════════════
  favoriteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#121212',
    justifyContent: 'center',
    alignItems: 'center',
  },
  favoriteIconActive: {
    fontSize: 20,
  },

  // ═══════════════════════════════════════════════════════
  // EVENT DETAILS
  // ═══════════════════════════════════════════════════════
  eventDetails: {
    gap: 8, // Расстояние между строками
  },
  eventDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventDetailIcon: {
    fontSize: 16,
    marginRight: 8,
    width: 20, // Фиксированная ширина для выравнивания
  },
  eventDetailText: {
    fontSize: 14,
    color: '#BDBDBD',
    lineHeight: 18,
    flex: 1,
  },
  participantsText: {
    color: '#6E47F5', // Акцент на количестве участников
    fontWeight: '600',
  },
});