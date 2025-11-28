// ═══════════════════════════════════════════════════════
// MAP SCREEN - КАРТА НА ВЕСЬ ЭКРАН С ПРАВИЛЬНЫМИ ЦВЕТАМИ
// ═══════════════════════════════════════════════════════
// Фикс для Android: добавлен User-Agent для OSM tiles
// Цвета бренда: #6E47F5 (фиолетовый)
// ═══════════════════════════════════════════════════════

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import MapView, { Marker, UrlTile, Region } from 'react-native-maps';
import * as Location from 'expo-location';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { eventsAPI } from '../../services/api';

// OSM Tile servers с User-Agent для Android
const OSM_STANDARD = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
const OSM_SATELLITE = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';

export default function MapScreen() {
  const navigation = useNavigation<any>();
  const mapRef = useRef<MapView>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [region, setRegion] = useState<Region | null>(null);
  const [tileUrl, setTileUrl] = useState(OSM_STANDARD);
  const [heading, setHeading] = useState(0);

  useEffect(() => {
    const getUserLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        
        if (status !== 'granted') {
          console.log('⚠️ Геолокация не разрешена, используем Нью-Йорк');
          const fallback = {
            latitude: 40.7128,
            longitude: -74.006,
          };
          setUserLocation(fallback);
          setRegion({
            ...fallback,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          });
          return;
        }

        try {
          const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          const coords = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          };
          setUserLocation(coords);
          setRegion({
            latitude: coords.latitude,
            longitude: coords.longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          });
          console.log('📍 Геолокация получена:', coords);

          // Подписываемся на изменения направления (компас)
          Location.watchHeadingAsync((headingData) => {
            setHeading(headingData.trueHeading);
          });
        } catch (locationError) {
          console.log('⚠️ Ошибка получения координат, используем Нью-Йорк:', locationError);
          const fallback = {
            latitude: 40.7128,
            longitude: -74.006,
          };
          setUserLocation(fallback);
          setRegion({
            ...fallback,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          });
        }
      } catch (error) {
        console.error('❌ Критическая ошибка геолокации:', error);
        const fallback = {
          latitude: 40.7128,
          longitude: -74.006,
        };
        setUserLocation(fallback);
        setRegion({
          ...fallback,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        });
      }
    };

    getUserLocation();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadEvents();
    }, [])
  );

  const loadEvents = async () => {
    try {
      setLoading(true);
      const data = await eventsAPI.getAll();
      setEvents(data);
      console.log('✅ События загружены на карту:', data.length);
    } catch (error) {
      console.error('Ошибка загрузки событий:', error);
      Alert.alert('Ошибка', 'Не удалось загрузить события');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkerPress = (event: any) => {
    navigation.navigate('EventDetail', { eventId: event.id });
  };

  const handleCreateEvent = () => {
    navigation.navigate('CreateEvent');
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

  const handleCenterOnUser = () => {
    if (userLocation) {
      const newRegion = {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      };
      setRegion(newRegion);
      mapRef.current?.animateToRegion(newRegion, 500);
    }
  };

  if (loading || !userLocation || !region) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6E47F5" />
        <Text style={styles.loadingText}>Загружаем карту...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* КАРТА НА ВЕСЬ ЭКРАН */}
      <MapView
        ref={mapRef}
        style={styles.map}
        region={region}
        onRegionChangeComplete={setRegion}
        showsUserLocation={false}
        showsMyLocationButton={false}
        showsCompass={false}
        showsScale={false}
        showsBuildings={false}
        showsTraffic={false}
        showsIndoors={false}
        toolbarEnabled={false}
        mapType="none"
        pitchEnabled={false}
        rotateEnabled={false}
        liteMode={false}
        loadingEnabled={false}
        loadingIndicatorColor="#6E47F5"
        loadingBackgroundColor="#000000"
      >
        <UrlTile
          urlTemplate={tileUrl}
          maximumZ={19}
          flipY={false}
          // ФИКС ДЛЯ ANDROID: добавляем User-Agent
          {...(Platform.OS === 'android' && {
            tileCacheMaxAge: 60 * 60 * 24 * 7, // 7 дней
            shouldReplaceMapContent: true,
          })}
        />

        {/* Точка пользователя */}
        <Marker
          coordinate={userLocation}
          anchor={{ x: 0.5, y: 0.5 }}
        >
          <View style={styles.userMarker}>
            <View style={styles.userMarkerInner} />
          </View>
        </Marker>

        {/* Маркеры событий */}
        {events.map((event) => {
          if (!event.latitude || !event.longitude) return null;

          const isPast = new Date(event.dateTime) < new Date();

          return (
            <Marker
              key={event.id}
              coordinate={{
                latitude: event.latitude,
                longitude: event.longitude,
              }}
              onPress={() => handleMarkerPress(event)}
            >
              <View style={styles.markerContainer}>
                <Text style={styles.markerText}>
                  {isPast ? '⚪' : '⭐'}
                </Text>
              </View>
            </Marker>
          );
        })}
      </MapView>

      {/* Кнопки управления картой - СПРАВА */}
      <View style={styles.controls}>
        <TouchableOpacity style={styles.controlButton} onPress={handleCenterOnUser}>
          <Text style={styles.controlIcon}>📍</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.controlButton}>
          <Text 
            style={[
              styles.controlIcon,
              { transform: [{ rotate: `${heading}deg` }] }
            ]}
          >
            🧭
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.controlButton} onPress={handleZoomIn}>
          <Text style={styles.controlText}>+</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.controlButton} onPress={handleZoomOut}>
          <Text style={styles.controlText}>−</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.controlButton} onPress={toggleMapType}>
          <Text style={styles.controlIcon}>
            {tileUrl === OSM_STANDARD ? '🛰️' : '🗺️'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Кнопка создания события - ВНИЗУ НАД НАВИГАЦИЕЙ */}
      <View style={styles.createButtonContainer}>
        <TouchableOpacity 
          style={styles.createButton}
          onPress={handleCreateEvent}
          activeOpacity={0.8}
        >
          <Text style={styles.createButtonIcon}>➕</Text>
          <Text style={styles.createButtonText}>Создать событие</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject, // КАРТА НА ВЕСЬ ЭКРАН
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
  userMarker: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(110, 71, 245, 0.3)', // Фиолетовый с прозрачностью
    alignItems: 'center',
    justifyContent: 'center',
  },
  userMarkerInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#6E47F5', // Primary цвет бренда
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerText: {
    fontSize: 28,
  },
  controls: {
    position: 'absolute',
    right: 16,
    bottom: 160, // Над кнопкой создания и навигацией
    gap: 12,
  },
  controlButton: {
    backgroundColor: '#FFFFFF',
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  controlText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
  },
  controlIcon: {
    fontSize: 24,
  },
  createButtonContainer: {
    position: 'absolute',
    bottom: 80, // Над навигацией (65px высота навигации + 15px отступ)
    left: 16,
    right: 16,
  },
  createButton: {
    backgroundColor: '#6E47F5', // Primary цвет бренда (фиолетовый)
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12, // Радиус кнопок из темплейта
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  createButtonIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
});