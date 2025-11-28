// ═══════════════════════════════════════════════════════
// EVENT DETAIL SCREEN - ДЕТАЛИ СОБЫТИЯ
// ═══════════════════════════════════════════════════════

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import MapView, { Marker, Circle, UrlTile, Region } from 'react-native-maps';
import { useNavigation, useRoute } from '@react-navigation/native';
import { eventsAPI } from '../../services/api';
import { getToken } from '../../services/auth';

// OSM Tile servers
const OSM_STANDARD = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
const OSM_SATELLITE = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';

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
  const mapRef = useRef<MapView>(null);

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [participating, setParticipating] = useState(false);
  const [tileUrl, setTileUrl] = useState(OSM_STANDARD);
  const [region, setRegion] = useState<Region | null>(null);

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
      setRegion({
        latitude: eventData.latitude,
        longitude: eventData.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
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

  const handleZoomIn = () => {
    if (region) {
      const newRegion = {
        ...region,
        latitudeDelta: region.latitudeDelta / 2,
        longitudeDelta: region.longitudeDelta / 2,
      };
      setRegion(newRegion);
      mapRef.current?.animateToRegion(newRegion, 300);
    }
  };

  const handleZoomOut = () => {
    if (region) {
      const newRegion = {
        ...region,
        latitudeDelta: region.latitudeDelta * 2,
        longitudeDelta: region.longitudeDelta * 2,
      };
      setRegion(newRegion);
      mapRef.current?.animateToRegion(newRegion, 300);
    }
  };

  const toggleMapType = () => {
    setTileUrl(prev => prev === OSM_STANDARD ? OSM_SATELLITE : OSM_STANDARD);
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

  if (!event || !region) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          region={region}
          onRegionChangeComplete={setRegion}
          scrollEnabled={true}
          zoomEnabled={true}
          rotateEnabled={false}
          pitchEnabled={false}
          showsUserLocation={false}
          showsMyLocationButton={false}
          showsCompass={false}
          showsScale={false}
          showsBuildings={false}
          showsTraffic={false}
          showsIndoors={false}
          toolbarEnabled={false}
          mapType="none"
          liteMode={false}
          loadingEnabled={false}
          loadingIndicatorColor="#00D4AA"
          loadingBackgroundColor="#1a1a2e"
        >
          <UrlTile
            urlTemplate={tileUrl}
            maximumZ={19}
            flipY={false}
          />

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
          
          {!event.isParticipant && (
            <Circle
              center={{
                latitude: event.latitude,
                longitude: event.longitude,
              }}
              radius={700}
              fillColor="rgba(0, 212, 170, 0.2)"
              strokeColor="rgba(0, 212, 170, 0.5)"
              strokeWidth={2}
            />
          )}
        </MapView>

        {/* Скрываем Legal на iOS */}
        <View style={styles.legalBlocker} pointerEvents="none" />

        {/* Атрибуция OpenStreetMap */}
        <View style={styles.attribution} pointerEvents="none">
          <Text style={styles.attributionText}>© OpenStreetMap</Text>
        </View>

        <TouchableOpacity
          style={styles.closeButton}
          onPress={handleClose}
          activeOpacity={0.8}
        >
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>

        {/* Кнопки управления картой */}
        <View style={styles.mapControls}>
          <TouchableOpacity style={styles.mapControlButton} onPress={handleZoomIn}>
            <Text style={styles.mapControlText}>+</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.mapControlButton} onPress={handleZoomOut}>
            <Text style={styles.mapControlText}>−</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.mapControlButton} onPress={toggleMapType}>
            <Text style={styles.mapControlIcon}>
              {tileUrl === OSM_STANDARD ? '🛰️' : '🗺️'}
            </Text>
          </TouchableOpacity>
        </View>
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
  legalBlocker: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 20,
    backgroundColor: '#1a1a2e',
  },
  attribution: {
    position: 'absolute',
    bottom: 5,
    left: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  attributionText: {
    fontSize: 10,
    color: '#333',
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
  mapControls: {
    position: 'absolute',
    right: 20,
    top: 60,
    gap: 12,
  },
  mapControlButton: {
    backgroundColor: '#fff',
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
  mapControlText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a2e',
  },
  mapControlIcon: {
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