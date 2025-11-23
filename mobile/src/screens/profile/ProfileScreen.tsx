// ═══════════════════════════════════════════════════════
// PROFILE SCREEN - ПРОФИЛЬ С СОБЫТИЯМИ
// ═══════════════════════════════════════════════════════
// Показывает созданные события пользователя
// Возможность редактировать и удалять
// ═══════════════════════════════════════════════════════

import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  Alert,
  ActivityIndicator,
  Image
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { eventsAPI } from '../../services/api';
import { getToken } from '../../services/auth';

export default function ProfileScreen() {
  const { userData, logout } = useAuth();
  const navigation = useNavigation();
  const [myEvents, setMyEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Загружаем события когда экран в фокусе
  useFocusEffect(
    React.useCallback(() => {
      loadMyEvents();
    }, [])
  );

  const loadMyEvents = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      if (!token) return;

      const events = await eventsAPI.getMy(token);
      console.log('✅ Мои события загружены:', events.length);
      setMyEvents(events);
    } catch (error) {
      console.error('Ошибка загрузки событий:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = () => {
    navigation.navigate('CreateEvent' as never);
  };

  const handleDeleteEvent = (eventId: string, eventTitle: string) => {
    Alert.alert(
      'Удалить событие?',
      `Вы уверены, что хотите удалить "${eventTitle}"?`,
      [
        { text: 'Отмена', style: 'cancel' },
        { 
          text: 'Удалить', 
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await getToken();
              if (!token) return;

              await eventsAPI.delete(token, eventId);
              Alert.alert('Успех', 'Событие удалено');
              loadMyEvents(); // Перезагружаем список
            } catch (error) {
              Alert.alert('Ошибка', 'Не удалось удалить событие');
            }
          }
        },
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      'Выход',
      'Вы уверены, что хотите выйти?',
      [
        { text: 'Отмена', style: 'cancel' },
        { 
          text: 'Выйти', 
          style: 'destructive',
          onPress: logout 
        },
      ]
    );
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
    <ScrollView style={styles.container}>
      {/* Шапка профиля */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {userData?.username?.charAt(0).toUpperCase() || '?'}
          </Text>
        </View>
        <Text style={styles.username}>@{userData?.username}</Text>
        <Text style={styles.email}>{userData?.email}</Text>
      </View>

      {/* Кнопка создания события */}
      <TouchableOpacity 
        style={styles.createButton}
        onPress={handleCreateEvent}
        activeOpacity={0.8}
      >
        <Text style={styles.createButtonIcon}>➕</Text>
        <Text style={styles.createButtonText}>Создать событие</Text>
      </TouchableOpacity>

      {/* Статистика */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statIcon}>📅</Text>
          <Text style={styles.statNumber}>{myEvents.length}</Text>
          <Text style={styles.statLabel}>Создано</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statIcon}>✅</Text>
          <Text style={styles.statNumber}>0</Text>
          <Text style={styles.statLabel}>Посещено</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statIcon}>👥</Text>
          <Text style={styles.statNumber}>0</Text>
          <Text style={styles.statLabel}>Друзей</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statIcon}>🤝</Text>
          <Text style={styles.statNumber}>0</Text>
          <Text style={styles.statLabel}>Встреч</Text>
        </View>
      </View>

      {/* Мои события */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Мои события</Text>
        
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#00D4AA" />
          </View>
        ) : myEvents.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📹</Text>
            <Text style={styles.emptyText}>Вы ещё не создали события</Text>
            <Text style={styles.emptySubtext}>
              Нажмите "Создать событие" выше!
            </Text>
          </View>
        ) : (
          <View style={styles.eventsList}>
            {myEvents.map((event) => (
              <View key={event.id} style={styles.eventCard}>
                {/* Превью видео */}
                <View style={styles.eventThumbnail}>
                  <Text style={styles.eventThumbnailIcon}>🎬</Text>
                </View>

                {/* Информация */}
                <View style={styles.eventInfo}>
                  <Text style={styles.eventTitle} numberOfLines={1}>
                    {event.title}
                  </Text>
                  <Text style={styles.eventLocation} numberOfLines={1}>
                    📍 {event.location}
                  </Text>
                  <Text style={styles.eventDate}>
                    📅 {formatDate(event.dateTime)}
                  </Text>
                  <Text style={styles.eventStats}>
                    👥 {event.participants}/{event.maxParticipants} участников
                  </Text>
                </View>

                {/* Кнопки действий */}
                <View style={styles.eventActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => Alert.alert('Скоро', 'Редактирование в разработке')}
                  >
                    <Text style={styles.actionIcon}>✏️</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={() => handleDeleteEvent(event.id, event.title)}
                  >
                    <Text style={styles.actionIcon}>🗑️</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Кнопка выхода */}
      <TouchableOpacity 
        style={styles.logoutButton}
        onPress={handleLogout}
        activeOpacity={0.8}
      >
        <Text style={styles.logoutText}>Выйти</Text>
      </TouchableOpacity>

      <Text style={styles.version}>KULA MVP v1.0.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#00D4AA',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#fff',
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: '#666',
  },
  createButton: {
    backgroundColor: '#00D4AA',
    marginHorizontal: 20,
    marginVertical: 20,
    paddingVertical: 16,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  createButtonIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#2d2d44',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 12,
    marginHorizontal: '1%',
  },
  statIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#00D4AA',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyState: {
    backgroundColor: '#2d2d44',
    padding: 40,
    borderRadius: 16,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 60,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  eventsList: {
    gap: 12,
  },
  eventCard: {
    backgroundColor: '#2d2d44',
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
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
  eventActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 40,
    height: 40,
    backgroundColor: '#1a1a2e',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButton: {
    backgroundColor: '#ff4757',
  },
  actionIcon: {
    fontSize: 18,
  },
  logoutButton: {
    backgroundColor: '#ff4757',
    marginHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  version: {
    textAlign: 'center',
    color: '#666',
    fontSize: 12,
    marginBottom: 40,
  },
});