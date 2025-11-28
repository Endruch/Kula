// ═══════════════════════════════════════════════════════
// FAVORITES SCREEN - ИЗБРАННЫЕ СОБЫТИЯ
// ═══════════════════════════════════════════════════════
// Показывает события, которые пользователь добавил в избранное
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
          События, которые вас интересуют
        </Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00D4AA" />
        </View>
      ) : favoriteEvents.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>⭐</Text>
          <Text style={styles.emptyText}>Нет избранных событий</Text>
          <Text style={styles.emptySubtext}>
            Добавляйте события в избранное, чтобы не потерять их!
          </Text>
          <TouchableOpacity
            style={styles.exploreButton}
            onPress={() => navigation.navigate('FeedTab' as never)}
          >
            <Text style={styles.exploreButtonText}>Искать события</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView style={styles.eventsList} showsVerticalScrollIndicator={false}>
          {favoriteEvents.map((event) => (
            <TouchableOpacity
              key={event.id}
              style={styles.eventCard}
              onPress={() => handleEventPress(event)}
              activeOpacity={0.8}
            >
              {/* Превью */}
              <View style={styles.eventThumbnail}>
                <Text style={styles.eventThumbnailIcon}>🎬</Text>
              </View>

              {/* Информация */}
              <View style={styles.eventInfo}>
                <Text style={styles.eventTitle} numberOfLines={1}>
                  {event.title}
                </Text>
                <Text style={styles.eventLocation} numberOfLines={1}>
                  📍 {event.locationArea}
                </Text>
                <Text style={styles.eventDate}>
                  📅 {formatDate(event.dateTime)}
                </Text>
                <Text style={styles.eventStats}>
                  👥 {event.participants}/{event.maxParticipants} участников
                </Text>
              </View>

              {/* Кнопка удалить из избранного */}
              <TouchableOpacity
                style={styles.favoriteButton}
                onPress={(e) => {
                  e.stopPropagation();
                  // TODO: Убрать из избранного
                }}
              >
                <Text style={styles.favoriteIcon}>⭐</Text>
              </TouchableOpacity>
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
    backgroundColor: '#1a1a2e',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#2d2d44',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#999',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 100,
    marginBottom: 24,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 20,
  },
  exploreButton: {
    backgroundColor: '#00D4AA',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  exploreButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  eventsList: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  eventCard: {
    backgroundColor: '#2d2d44',
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  eventThumbnail: {
    width: 80,
    height: 80,
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  eventThumbnailIcon: {
    fontSize: 32,
  },
  eventInfo: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  eventLocation: {
    fontSize: 13,
    color: '#999',
    marginBottom: 2,
  },
  eventDate: {
    fontSize: 13,
    color: '#999',
    marginBottom: 2,
  },
  eventStats: {
    fontSize: 13,
    color: '#00D4AA',
  },
  favoriteButton: {
    width: 44,
    height: 44,
    backgroundColor: '#1a1a2e',
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  favoriteIcon: {
    fontSize: 24,
  },
});