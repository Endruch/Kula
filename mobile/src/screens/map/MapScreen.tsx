// ═══════════════════════════════════════════════════════
// MAP SCREEN - ЭКРАН КАРТЫ
// ═══════════════════════════════════════════════════════
// Показывает все события на карте
// Звёздочки: ⭐ активные, ⚪ завершённые
// ═══════════════════════════════════════════════════════

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import MapView, { Marker, Circle, PROVIDER_DEFAULT, MapType } from 'react-native-maps';
import * as Location from 'expo-location';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { eventsAPI } from '../../services/api';
import { getToken } from '../../services/auth';

interface Event {
  id: string;
  title: string;
  location: string;
  latitude: number;
  longitude: number;
  dateTime: string;
  endDate: string;
  category: string;
  creator: {
    name: string;
  };
}

export default function MapScreen({ route }: any) {
  const navigation = useNavigation<any>();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [mapType, setMapType] = useState<MapType>('standard');
  const [highlightedEventId, setHighlightedEventId] = useState<string | null>(
    route?.params?.eventId || null
  );
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    requestLocationPermission();
    loadEvents();
  }, []);

  // Фокусировка на выделенном событии
  useEffect(() => {
    if (highlightedEventId && events.length > 0) {
      const highlightedEvent = events.find(e => e.id === highlightedEventId);
      if (highlightedEvent) {
        mapRef.current?.animateToRegion({
          latitude: highlightedEvent.latitude,
          longitude: highlightedEvent.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }, 500);
      }
    }
  }, [highlightedEventId, events]);

  // Восстанавливаем выделение при возврате на экран
  useFocusEffect(
    React.useCallback(() => {
      if (route?.params?.eventId) {
        setHighlightedEventId(route.params.eventId);
      }
    }, [route?.params?.eventId])
  );

  // Запрос разрешения на геолокацию
  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Геолокация отключена',
          'Разрешите доступ к геолокации для отображения событий рядом с вами'
        );
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      console.log('📍 Геолокация получена:', location.coords.latitude, location.coords.longitude);
    } catch (error) {
      console.error('Ошибка получения геолокации:', error);
      Alert.alert('Ошибка', 'Не удалось получить вашу геолокацию');
    }
  };

  // Загрузка событий
  const loadEvents = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const data = await eventsAPI.getAll(token || undefined);
      
      // Фильтруем события с координатами
      const eventsWithCoords = data.filter(
        (event: any) => event.latitude && event.longitude
      );

      console.log('🗺️ События с координатами:', eventsWithCoords.length);
      console.log('📍 Координаты событий:', eventsWithCoords.map((e: any) => `${e.title}: ${e.latitude}, ${e.longitude}`));
      
      setEvents(eventsWithCoords);
    } catch (error) {
      console.error('Ошибка загрузки событий:', error);
      Alert.alert('Ошибка', 'Не удалось загрузить события');
    } finally {
      setLoading(false);
    }
  };

  // Проверка активно ли событие
  const isEventActive = (endDate: string) => {
    return new Date(endDate) > new Date();
  };

  // Обработка клика на метку
  const handleMarkerPress = (event: Event) => {
    const status = isEventActive(event.endDate) ? 'Активное' : 'Завершённое';
    Alert.alert(
      event.title,
      `${status}\n📍 ${event.location}\n👤 ${event.creator.name}`,
      [
        { text: 'Закрыть', style: 'cancel' },
        { text: 'Подробнее', onPress: () => console.log('Открыть событие:', event.id) },
      ]
    );
  };

  // Переключение типа карты
  const toggleMapType = () => {
    setMapType(prev => prev === 'standard' ? 'satellite' : 'standard');
  };

  // Увеличение масштаба
  const zoomIn = () => {
    mapRef.current?.getCamera().then(camera => {
      if (camera.zoom !== undefined) {
        mapRef.current?.animateCamera({
          zoom: camera.zoom + 1,
        }, { duration: 300 });
      }
    });
  };

  // Уменьшение масштаба
  const zoomOut = () => {
    mapRef.current?.getCamera().then(camera => {
      if (camera.zoom !== undefined) {
        mapRef.current?.animateCamera({
          zoom: camera.zoom - 1,
        }, { duration: 300 });
      }
    });
  };

  // Центрировать на пользователе
  const centerOnUser = () => {
    if (userLocation) {
      mapRef.current?.animateToRegion({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }, 500);
    }
  };

  // Закрыть карту и вернуться на рилс
  const closeMapAndGoBack = () => {
    setHighlightedEventId(null);
    
    // Возвращаемся на вкладку Feed с индексом видео
    navigation.navigate('FeedTab', {
      scrollToIndex: route?.params?.fromFeedIndex || 0
    });
  };

  // Начальный регион - геолокация пользователя
  const initialRegion = userLocation
    ? {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      }
    : {
        latitude: 40.7128,
        longitude: -74.0060,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00D4AA" />
        <Text style={styles.loadingText}>Загружаем карту...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_DEFAULT}
        initialRegion={initialRegion}
        mapType={mapType}
        showsUserLocation={true}
        showsMyLocationButton={false}
      >
        {/* Радиус 5км вокруг пользователя */}
        {userLocation && (
          <Circle
            center={userLocation}
            radius={5000}
            fillColor="rgba(0, 212, 170, 0.1)"
            strokeColor="rgba(0, 212, 170, 0.3)"
            strokeWidth={2}
          />
        )}

        {/* Метки событий */}
        {events
          .filter(event => !highlightedEventId || event.id === highlightedEventId)
          .map((event) => (
            <Marker
              key={event.id}
              coordinate={{
                latitude: event.latitude,
                longitude: event.longitude,
              }}
              onPress={() => handleMarkerPress(event)}
            >
              <View style={styles.markerContainer}>
                <Text style={[
                  styles.markerEmoji,
                  highlightedEventId === event.id && styles.markerHighlighted
                ]}>
                  {isEventActive(event.endDate) ? '⭐' : '⚪'}
                </Text>
              </View>
            </Marker>
          ))}
      </MapView>

      {/* Кнопка переключения типа карты */}
      <TouchableOpacity
        style={[styles.controlButton, { top: 60, right: 20 }]}
        onPress={toggleMapType}
        activeOpacity={0.8}
      >
        <Text style={styles.controlButtonText}>
          {mapType === 'standard' ? '🛰️' : '🗺️'}
        </Text>
      </TouchableOpacity>

      {/* Кнопка центрирования на пользователе */}
      <TouchableOpacity
        style={[styles.controlButton, { top: 120, right: 20 }]}
        onPress={centerOnUser}
        activeOpacity={0.8}
      >
        <Text style={styles.controlButtonText}>📍</Text>
      </TouchableOpacity>

      {/* Кнопки масштаба */}
      <View style={styles.zoomButtons}>
        <TouchableOpacity
          style={styles.zoomButton}
          onPress={zoomIn}
          activeOpacity={0.8}
        >
          <Text style={styles.zoomButtonText}>+</Text>
        </TouchableOpacity>
        
        <View style={styles.zoomDivider} />
        
        <TouchableOpacity
          style={styles.zoomButton}
          onPress={zoomOut}
          activeOpacity={0.8}
        >
          <Text style={styles.zoomButtonText}>−</Text>
        </TouchableOpacity>
      </View>

      {/* Кнопка "Закрыть" - только если есть выделение */}
      {highlightedEventId && (
        <TouchableOpacity
          style={styles.closeButton}
          onPress={closeMapAndGoBack}
          activeOpacity={0.8}
        >
          <Text style={styles.closeButtonText}>✕ Закрыть</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
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
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 50,
    height: 50,
  },
  markerEmoji: {
    fontSize: 32,
  },
  markerHighlighted: {
    fontSize: 40,
  },
  controlButton: {
    position: 'absolute',
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
  controlButtonText: {
    fontSize: 24,
  },
  zoomButtons: {
    position: 'absolute',
    bottom: 120,
    right: 20,
    backgroundColor: '#00D4AA',
    borderRadius: 25,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  zoomButton: {
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  zoomButtonText: {
    fontSize: 28,
    color: '#fff',
    fontWeight: 'bold',
  },
  zoomDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  closeButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    backgroundColor: '#FF4444',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});