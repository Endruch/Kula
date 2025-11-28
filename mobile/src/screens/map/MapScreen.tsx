// ═══════════════════════════════════════════════════════
// MAP SCREEN - OPENSTREETMAP БЕЗ GOOGLE
// ═══════════════════════════════════════════════════════
// Чистый OpenStreetMap через Leaflet.js в WebView
// Бесплатно и без API ключей
// ═══════════════════════════════════════════════════════

import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { WebView } from 'react-native-webview';
import * as Location from 'expo-location';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { eventsAPI } from '../../services/api';

export default function MapScreen() {
  const navigation = useNavigation<any>();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const webViewRef = React.useRef<WebView>(null);

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
          console.log('📍 Геолокация получена:', coords);
        } catch (locationError) {
          console.log('⚠️ Ошибка получения координат, используем Нью-Йорк');
          const fallback = {
            latitude: 40.7128,
            longitude: -74.006,
          };
          setUserLocation(fallback);
        }
      } catch (error) {
        console.error('❌ Критическая ошибка геолокации:', error);
        const fallback = {
          latitude: 40.7128,
          longitude: -74.006,
        };
        setUserLocation(fallback);
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

  const handleMarkerPress = (eventId: string) => {
    navigation.navigate('EventDetail', { eventId });
  };

  const handleCreateEvent = () => {
    navigation.navigate('CreateEvent');
  };

  // HTML для OpenStreetMap через Leaflet.js
  const getMapHTML = () => {
    if (!userLocation) return '';

    const eventsJS = JSON.stringify(events.filter(e => e.latitude && e.longitude));
    
    return `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    body { margin: 0; padding: 0; }
    #map { width: 100vw; height: 100vh; }
    .user-marker {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: rgba(110, 71, 245, 0.3);
      border: 3px solid #6E47F5;
      box-shadow: 0 0 10px rgba(110, 71, 245, 0.5);
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    // Инициализация карты
    const map = L.map('map', {
      zoomControl: false,
      attributionControl: true,
    }).setView([${userLocation.latitude}, ${userLocation.longitude}], 13);

    // OpenStreetMap тайлы
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Маркер пользователя
    const userIcon = L.divIcon({
      className: 'user-marker',
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });
    
    L.marker([${userLocation.latitude}, ${userLocation.longitude}], {
      icon: userIcon
    }).addTo(map);

    // События
    const events = ${eventsJS};
    
    events.forEach(event => {
      const isPast = new Date(event.dateTime) < new Date();
      const icon = isPast ? '⚪' : '⭐';
      
      const eventIcon = L.divIcon({
        html: '<div style="font-size: 28px;">' + icon + '</div>',
        className: 'event-marker',
        iconSize: [30, 30],
        iconAnchor: [15, 15],
      });
      
      const marker = L.marker([event.latitude, event.longitude], {
        icon: eventIcon
      }).addTo(map);
      
      marker.on('click', () => {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'markerPress',
          eventId: event.id
        }));
      });
      
      marker.bindPopup('<b>' + event.title + '</b>');
    });

    // Кнопка центрирования на пользователя
    const centerButton = L.control({position: 'topright'});
    centerButton.onAdd = function() {
      const div = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
      div.innerHTML = '<a href="#" style="font-size: 24px; width: 40px; height: 40px; line-height: 40px; text-align: center; display: block; text-decoration: none;">📍</a>';
      div.onclick = () => {
        map.setView([${userLocation.latitude}, ${userLocation.longitude}], 13);
        return false;
      };
      return div;
    };
    centerButton.addTo(map);
  </script>
</body>
</html>
    `;
  };

  const handleWebViewMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'markerPress') {
        handleMarkerPress(data.eventId);
      }
    } catch (error) {
      console.error('Ошибка обработки сообщения:', error);
    }
  };

  if (loading || !userLocation) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6E47F5" />
        <Text style={styles.loadingText}>Загружаем карту...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* КАРТА */}
      <WebView
        ref={webViewRef}
        source={{ html: getMapHTML() }}
        style={styles.map}
        onMessage={handleWebViewMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        renderLoading={() => (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#6E47F5" />
          </View>
        )}
      />

      {/* Кнопка создания события */}
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
    flex: 1,
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
  createButtonContainer: {
    position: 'absolute',
    bottom: 80,
    left: 16,
    right: 16,
  },
  createButton: {
    backgroundColor: '#6E47F5',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
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