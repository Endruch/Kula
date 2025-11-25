
// ═══════════════════════════════════════════════════════
// EVENT DETAIL SCREEN - ДЕТАЛИ СОБЫТИЯ
// ═══════════════════════════════════════════════════════
// Показывает полную информацию о событии:
// - Карта с приблизительным местоположением (радиус 700м)
// - Точный адрес только для участников
// - Кнопка "Участвовать" для получения точных данных
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
} from 'react-native';
import MapView, { Marker, Circle, PROVIDER_DEFAULT, MapType } from 'react-native-maps';
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
  const fromFeedIndex = route.params?.fromFeedIndex;

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [participating, setParticipating] = useState(false);
  const [mapType, setMapType] = useState<MapType>('standard');

  useEffect(() => {
    loadEvent();
  }, [eventId]);

const loadEvent = async () => {
  try {
    setLoading(true);
    
    // ✅ Используем новый API
    const data = await eventsAPI.getById(eventId);
    
    setEvent({
      ...data,
      participants: data.participants || 0,
      creator: {
        ...data.creator,
        rating: data.creator.rating || 4.5,
      },
    });
  } catch (error) {
    console.error('Ошибка загрузки события:', error);
    Alert.alert('Ошибка', 'Не удалось загрузить событие');
    navigation.goBack();
  } finally {
    setLoading(false);
  }
};

  const handleParticipate = async () => {
      // TODO: Нужно добавить endpoint в backend:
  // POST /api/events/:id/participate
    try {
      setParticipating(true);
      const token = await getToken();
      
      const response = await fetch(`http://192.168.1.100:3000/api/events/${eventId}/participate`, {
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

  const toggleMapType = () => {
    setMapType(prev => prev === 'standard' ? 'satellite' : 'standard');
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
        <ActivityIndicator size="large" color="#00D4AA" />
        <Text style={styles.loadingText}>Загружаем событие...</Text>
      </View>
    );
  }

  if (!event) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          provider={PROVIDER_DEFAULT}
          initialRegion={{
            latitude: event.latitude,
            longitude: event.longitude,
            latitudeDelta: 0.02,
            longitudeDelta: 0.02,
          }}
          scrollEnabled={true}
          zoomEnabled={true}
          rotateEnabled={true}
          pitchEnabled={true}
          mapType={mapType}
        >
          <Marker
            coordinate={{
              latitude: event.latitude,
              longitude: event.longitude,
            }}
          >
            <View style={styles.markerContainer}>
              <Text style={styles.markerEmoji}>⭐</Text>
            </View>
          </Marker>
          
          
{/* Радиус приблизительности (если НЕ участник) */}
          {!event.isParticipant && (
            <Circle
              center={{
                latitude: event.latitude,
                longitude: event.longitude,
              }}
              radius={700} // 700 метров
              fillColor="rgba(0, 212, 170, 0.2)" // Прозрачный бирюзовый
              strokeColor="rgba(0, 212, 170, 0.5)"
              strokeWidth={2}
            />
          )}
        </MapView>

        <TouchableOpacity
          style={styles.closeButton}
          onPress={handleClose}
          activeOpacity={0.8}
        >
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.mapTypeButton}
          onPress={toggleMapType}
          activeOpacity={0.8}
        >
          <Text style={styles.mapTypeButtonText}>
            {mapType === 'standard' ? '🛰️' : '🗺️'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryEmoji}>{getCategoryEmoji(event.category)}</Text>
          <Text style={styles.categoryText}>{event.category}</Text>
        </View>

        <Text style={styles.title}>{event.title}</Text>

        <View style={styles.infoRow}>
          <Text style={styles.infoIcon}>📅</Text>
          <View style={styles.infoTextContainer}>
            <Text style={styles.infoLabel}>Когда</Text>
            <Text style={styles.infoValue}>{formatDate(event.dateTime)}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoIcon}>📍</Text>
          <View style={styles.infoTextContainer}>
            <Text style={styles.infoLabel}>Где</Text>
            <Text style={styles.infoValue}>
              {event.location}
            </Text>
            {!event.isParticipant && (
              <Text style={styles.infoHint}>
                🔒 Точный адрес откроется после записи
              </Text>
            )}
          </View>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoIcon}>👥</Text>
          <View style={styles.infoTextContainer}>
            <Text style={styles.infoLabel}>Участники</Text>
            <Text style={styles.infoValue}>
              {event.participants}/{event.maxParticipants} человек
            </Text>
          </View>
        </View>

        {event.description && (
          <View style={styles.descriptionContainer}>
            <Text style={styles.descriptionLabel}>Описание</Text>
            <Text style={styles.descriptionText}>{event.description}</Text>
          </View>
        )}

        <View style={styles.creatorContainer}>
          <Text style={styles.creatorLabel}>Организатор</Text>
          
          <View style={styles.creatorCard}>
            <View style={styles.creatorAvatar}>
              <Text style={styles.creatorAvatarText}>
                {event.creator.username.charAt(0).toUpperCase()}
              </Text>
            </View>

            <View style={styles.creatorInfo}>
              <Text style={styles.creatorName}>@{event.creator.username}</Text>
              
              <View style={styles.ratingContainer}>
                <Text style={styles.ratingStars}>⭐⭐⭐⭐⭐</Text>
                <Text style={styles.ratingText}>
                  {event.creator.rating?.toFixed(1) || '4.5'} / 5.0
                </Text>
              </View>
            </View>
          </View>
        </View>

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
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.participateText}>
              {event.isParticipant ? 'Вы участвуете ✓' : 'Участвовать'}
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
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
  mapContainer: {
    height: '40%',
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 50,
    height: 50,
  },
  markerEmoji: {
    fontSize: 40,
  },
  closeButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    backgroundColor: '#FF4444',
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  mapTypeButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    backgroundColor: '#00D4AA',
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  mapTypeButtonText: {
    fontSize: 24,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#2d2d44',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginBottom: 16,
  },
  categoryEmoji: {
    fontSize: 20,
    marginRight: 8,
  },
  categoryText: {
    color: '#00D4AA',
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  infoIcon: {
    fontSize: 24,
    marginRight: 12,
    marginTop: 4,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  infoValue: {
    fontSize: 16,
    color: '#fff',
    lineHeight: 22,
  },
  infoHint: {
    fontSize: 12,
    color: '#00D4AA',
    marginTop: 4,
    fontStyle: 'italic',
  },
  descriptionContainer: {
    marginTop: 8,
    marginBottom: 24,
  },
  descriptionLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  descriptionText: {
    fontSize: 16,
    color: '#fff',
    lineHeight: 24,
  },
  creatorContainer: {
    marginTop: 8,
    marginBottom: 24,
  },
  creatorLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  creatorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2d2d44',
    padding: 16,
    borderRadius: 16,
  },
  creatorAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#00D4AA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  creatorAvatarText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  creatorInfo: {
    flex: 1,
  },
  creatorName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingStars: {
    fontSize: 16,
    marginRight: 8,
  },
  ratingText: {
    fontSize: 14,
    color: '#00D4AA',
    fontWeight: '600',
  },
  participateButton: {
    backgroundColor: '#00D4AA',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 40,
  },
  participateButtonDisabled: {
    backgroundColor: '#666',
  },
  participateText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});