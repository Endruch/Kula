// ═══════════════════════════════════════════════════════
// EVENT DETAIL SCREEN - ДЕТАЛИ СОБЫТИЯ
// ═══════════════════════════════════════════════════════
// Дизайн по темплейту: тёмная тема, система 4px, радиусы 12px
// ═══════════════════════════════════════════════════════

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { useNavigation, useRoute } from '@react-navigation/native';
import { eventsAPI } from '../../services/api';
import { getToken } from '../../services/auth';

interface Event {
  id: string;
  title: string;
  description: string;
  location: string;
  locationArea: string;
  latitude: number;
  longitude: number;
  exactLatitude?: number;
  exactLongitude?: number;
  dateTime: string;
  endDate: string;
  category: string;
  maxParticipants: number;
  participants: number;
  isParticipant: boolean;
  creator: {
    id: string;
    username: string;
    rating?: number;
  };
}

export default function EventDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const eventId = route.params?.eventId;

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [participating, setParticipating] = useState(false);

  useEffect(() => {
    loadEvent();
  }, [eventId]);

  const loadEvent = async () => {
    try {
      setLoading(true);
      const data = await eventsAPI.getById(eventId);
      
      const eventData = {
        ...data,
        participants: data.participants || 0,
        creator: {
          ...data.creator,
          rating: data.creator.rating || 4.5,
        },
      };

      setEvent(eventData);
    } catch (error) {
      console.error('Ошибка загрузки события:', error);
      Alert.alert('Ошибка', 'Не удалось загрузить событие');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleParticipate = async () => {
    try {
      setParticipating(true);
      const token = await getToken();
      
      const response = await fetch(`http://172.238.210.190:3001/api/events/${eventId}/participate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        Alert.alert('Успех! 🎉', 'Точный адрес теперь доступен', [
          { text: 'OK', onPress: () => loadEvent() }
        ]);
      } else {
        const error = await response.json();
        Alert.alert('Ошибка', error.error || 'Не удалось записаться');
      }
    } catch (error) {
      console.error('Ошибка записи:', error);
      Alert.alert('Ошибка', 'Не удалось записаться');
    } finally {
      setParticipating(false);
    }
  };

  const handleClose = () => {
    navigation.goBack();
  };

  const getMapHTML = () => {
    if (!event) return '';

    const lat = event.isParticipant && event.exactLatitude 
      ? event.exactLatitude 
      : event.latitude;
    const lng = event.isParticipant && event.exactLongitude 
      ? event.exactLongitude 
      : event.longitude;

    return `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    body { margin: 0; padding: 0; background: #000000; }
    #map { width: 100vw; height: 100vh; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    const map = L.map('map', {
      zoomControl: false,
      attributionControl: false,
      dragging: true,
      scrollWheelZoom: true,
      doubleClickZoom: true,
      touchZoom: true,
    }).setView([${lat}, ${lng}], 15);

    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 19,
      attribution: '© ArcGIS'
    }).addTo(map);

    const eventIcon = L.divIcon({
      html: '<div style="font-size: 40px;">⭐</div>',
      className: 'event-marker',
      iconSize: [50, 50],
      iconAnchor: [25, 25],
    });
    
    L.marker([${lat}, ${lng}], {
      icon: eventIcon
    }).addTo(map);

    ${!event.isParticipant ? `
    L.circle([${lat}, ${lng}], {
      radius: 700,
      fillColor: 'rgba(110, 71, 245, 0.2)',
      color: 'rgba(110, 71, 245, 0.5)',
      weight: 2,
    }).addTo(map);
    ` : ''}

    const zoomInButton = L.control({position: 'topright'});
    zoomInButton.onAdd = function() {
      const div = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
      div.innerHTML = '<a href="#" style="font-size: 24px; width: 48px; height: 48px; line-height: 48px; text-align: center; display: block; text-decoration: none; font-weight: bold; background: white; border-radius: 12px;">+</a>';
      div.onclick = () => {
        map.zoomIn();
        return false;
      };
      return div;
    };
    zoomInButton.addTo(map);

    const zoomOutButton = L.control({position: 'topright'});
    zoomOutButton.onAdd = function() {
      const div = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
      div.innerHTML = '<a href="#" style="font-size: 24px; width: 48px; height: 48px; line-height: 48px; text-align: center; display: block; text-decoration: none; font-weight: bold; background: white; border-radius: 12px; margin-top: 12px;">−</a>';
      div.onclick = () => {
        map.zoomOut();
        return false;
      };
      return div;
    };
    zoomOutButton.addTo(map);
  </script>
</body>
</html>
    `;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getCategoryEmoji = (category: string) => {
    const emojis: any = {
      sport: '⚽',
      party: '🍻',
      cafe: '☕',
      culture: '🎭',
      outdoor: '🏕️',
      games: '🎮',
    };
    return emojis[category] || '📍';
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6E47F5" />
        <Text style={styles.loadingText}>Загружаем событие...</Text>
      </View>
    );
  }

  if (!event) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* КАРТА - 40% экрана */}
      <View style={styles.mapContainer}>
        <WebView
          source={{ html: getMapHTML() }}
          style={styles.map}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          scrollEnabled={false}
        />

        {/* Кнопка закрытия */}
        <TouchableOpacity
          style={styles.closeButton}
          onPress={handleClose}
          activeOpacity={0.8}
        >
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>
      </View>

      {/* КОНТЕНТ */}
      <ScrollView 
        style={styles.content} 
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Бейдж категории */}
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryEmoji}>{getCategoryEmoji(event.category)}</Text>
          <Text style={styles.categoryText}>{event.category}</Text>
        </View>

        {/* Заголовок */}
        <Text style={styles.title}>{event.title}</Text>

        {/* Информационные блоки */}
        <View style={styles.infoSection}>
          {/* Дата и время */}
          <View style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <Text style={styles.infoIcon}>📅</Text>
              <Text style={styles.infoLabel}>Когда</Text>
            </View>
            <Text style={styles.infoValue}>{formatDate(event.dateTime)}</Text>
          </View>

          {/* Местоположение */}
          <View style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <Text style={styles.infoIcon}>📍</Text>
              <Text style={styles.infoLabel}>Где</Text>
            </View>
            <Text style={styles.infoValue}>{event.location}</Text>
            {!event.isParticipant && (
              <View style={styles.lockBadge}>
                <Text style={styles.lockText}>🔒 Точный адрес откроется после записи</Text>
              </View>
            )}
          </View>

          {/* Участники */}
          <View style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <Text style={styles.infoIcon}>👥</Text>
              <Text style={styles.infoLabel}>Участники</Text>
            </View>
            <Text style={styles.infoValue}>
              {event.participants} / {event.maxParticipants} человек
            </Text>
          </View>
        </View>

        {/* Описание */}
        {event.description && (
          <View style={styles.descriptionSection}>
            <Text style={styles.sectionLabel}>Описание</Text>
            <View style={styles.descriptionCard}>
              <Text style={styles.descriptionText}>{event.description}</Text>
            </View>
          </View>
        )}

        {/* Организатор */}
        <View style={styles.organizerSection}>
          <Text style={styles.sectionLabel}>Организатор</Text>
          <View style={styles.organizerCard}>
            <View style={styles.organizerAvatar}>
              <Text style={styles.organizerAvatarText}>
                {event.creator.username.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.organizerInfo}>
              <Text style={styles.organizerName}>@{event.creator.username}</Text>
              <View style={styles.ratingRow}>
                <Text style={styles.ratingStars}>⭐⭐⭐⭐⭐</Text>
                <Text style={styles.ratingValue}>
                  {event.creator.rating?.toFixed(1) || '4.5'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Кнопка участия */}
        <TouchableOpacity
          style={[
            styles.participateButton,
            event.isParticipant && styles.participateButtonDisabled
          ]}
          onPress={handleParticipate}
          activeOpacity={0.8}
          disabled={event.isParticipant || participating}
        >
          {participating ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.participateButtonText}>
              {event.isParticipant ? 'Вы участвуете ✓' : 'Участвовать'}
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  // ═══════════════════════════════════════════════════════
  // КОНТЕЙНЕРЫ
  // ═══════════════════════════════════════════════════════
  container: {
    flex: 1,
    backgroundColor: '#000000', // Основной фон приложения
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#FFFFFF', // Текст основной
    fontSize: 16, // Текст основной
    marginTop: 16,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'Roboto',
  },

  // ═══════════════════════════════════════════════════════
  // КАРТА
  // ═══════════════════════════════════════════════════════
  mapContainer: {
    height: '40%',
    position: 'relative',
    backgroundColor: '#000000',
  },
  map: {
    flex: 1,
  },
  closeButton: {
    position: 'absolute',
    top: 60, // Статус бар + 16
    left: 16, // Отступ от края
    width: 48, // Высота кнопки по темплейту
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EF5350', // Ошибка (темная тема)
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },

  // ═══════════════════════════════════════════════════════
  // КОНТЕНТ
  // ═══════════════════════════════════════════════════════
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16, // Отступы краёв экрана
    paddingBottom: 32,
  },

  // ═══════════════════════════════════════════════════════
  // БЕЙДЖ КАТЕГОРИИ
  // ═══════════════════════════════════════════════════════
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#1E1E1E', // Поверхности (темная тема)
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8, // Мини-элементы
    marginBottom: 16, // Расстояние между элементами
  },
  categoryEmoji: {
    fontSize: 20,
    marginRight: 8,
  },
  categoryText: {
    color: '#6E47F5', // Primary цвет
    fontSize: 14, // Текст второстепенный
    fontWeight: '600',
    textTransform: 'capitalize',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'Roboto',
  },

  // ═══════════════════════════════════════════════════════
  // ЗАГОЛОВОК
  // ═══════════════════════════════════════════════════════
  title: {
    fontSize: 28, // Заголовок 1
    fontWeight: '700',
    lineHeight: 32,
    color: '#FFFFFF', // Текст основной
    marginBottom: 24, // Расстояние между крупными секциями
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'Roboto',
  },

  // ═══════════════════════════════════════════════════════
  // ИНФОРМАЦИОННЫЕ КАРТОЧКИ
  // ═══════════════════════════════════════════════════════
  infoSection: {
    marginBottom: 24,
  },
  infoCard: {
    backgroundColor: '#1E1E1E', // Поверхности
    padding: 16, // Внутренние отступы блоков
    borderRadius: 12, // Радиус карточки
    marginBottom: 12, // Расстояние между элементами
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoIcon: {
    fontSize: 24, // Стандартный размер иконки
    marginRight: 8,
  },
  infoLabel: {
    fontSize: 12, // Мелкие подписи
    color: '#8D8D8D', // Подписи (темная тема)
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'Roboto',
  },
  infoValue: {
    fontSize: 16, // Текст основной
    lineHeight: 20,
    color: '#FFFFFF', // Текст основной
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'Roboto',
  },
  lockBadge: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#2A2A2A', // Границы и разделители
  },
  lockText: {
    fontSize: 12,
    color: '#6E47F5', // Primary
    fontStyle: 'italic',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'Roboto',
  },

  // ═══════════════════════════════════════════════════════
  // ОПИСАНИЕ
  // ═══════════════════════════════════════════════════════
  descriptionSection: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 12, // Мелкие подписи
    color: '#8D8D8D', // Подписи
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: '600',
    marginBottom: 12, // Расстояние между элементами
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'Roboto',
  },
  descriptionCard: {
    backgroundColor: '#1E1E1E',
    padding: 16,
    borderRadius: 12,
  },
  descriptionText: {
    fontSize: 16, // Текст основной
    lineHeight: 20,
    color: '#FFFFFF',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'Roboto',
  },

  // ═══════════════════════════════════════════════════════
  // ОРГАНИЗАТОР
  // ═══════════════════════════════════════════════════════
  organizerSection: {
    marginBottom: 24,
  },
  organizerCard: {
    backgroundColor: '#1E1E1E',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  organizerAvatar: {
    width: 56, // 56 = 14 * 4 (система 4px)
    height: 56,
    borderRadius: 28,
    backgroundColor: '#6E47F5', // Primary
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  organizerAvatarText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'Roboto',
  },
  organizerInfo: {
    flex: 1,
  },
  organizerName: {
    fontSize: 16, // Текст основной
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'Roboto',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingStars: {
    fontSize: 14,
    marginRight: 8,
  },
  ratingValue: {
    fontSize: 14, // Текст второстепенный
    color: '#6E47F5', // Primary
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'Roboto',
  },

  // ═══════════════════════════════════════════════════════
  // КНОПКА УЧАСТИЯ
  // ═══════════════════════════════════════════════════════
  participateButton: {
    backgroundColor: '#6E47F5', // Главная кнопка Primary
    height: 48, // Высота кнопки
    borderRadius: 12, // Радиус кнопки
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  participateButtonDisabled: {
    backgroundColor: '#2C2C2C', // Неактивная кнопка
  },
  participateButtonText: {
    color: '#FFFFFF', // Текст на акцентных кнопках
    fontSize: 17, // Размер текста кнопки
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro' : 'Roboto',
  },
});