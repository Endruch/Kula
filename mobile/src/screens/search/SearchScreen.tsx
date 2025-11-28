// ═══════════════════════════════════════════════════════
// SEARCH SCREEN - ПОИСК СОБЫТИЙ С ФИЛЬТРАМИ
// ═══════════════════════════════════════════════════════
// Поиск по названию, категории, дате, расстоянию
// ═══════════════════════════════════════════════════════

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { eventsAPI } from '../../services/api';

export default function SearchScreen() {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [events, setEvents] = useState<any[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Категории для быстрого фильтра
  const categories = [
    { id: 'all', name: 'Все', icon: '🌟' },
    { id: 'sports', name: 'Спорт', icon: '⚽' },
    { id: 'food', name: 'Еда', icon: '🍕' },
    { id: 'culture', name: 'Культура', icon: '🎭' },
    { id: 'games', name: 'Игры', icon: '🎮' },
    { id: 'travel', name: 'Путешествия', icon: '✈️' },
  ];

  useEffect(() => {
    loadEvents();
  }, []);

  useEffect(() => {
    filterEvents();
  }, [searchQuery, selectedCategory, events]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const data = await eventsAPI.getAll();
      setEvents(data);
      setFilteredEvents(data);
    } catch (error) {
      console.error('Ошибка загрузки событий:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterEvents = () => {
    let filtered = events;

    // Фильтр по поисковому запросу
    if (searchQuery.trim()) {
      filtered = filtered.filter((event) =>
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Фильтр по категории
    if (selectedCategory && selectedCategory !== 'all') {
      filtered = filtered.filter((event) => event.category === selectedCategory);
    }

    setFilteredEvents(filtered);
  };

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId === selectedCategory ? null : categoryId);
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
        <Text style={styles.headerTitle}>Поиск событий</Text>
      </View>

      {/* Поисковая строка */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Поиск по названию, месту..."
          placeholderTextColor="#666"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Text style={styles.clearIcon}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Категории */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
        contentContainerStyle={styles.categoriesContent}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryChip,
              (selectedCategory === category.id || 
               (category.id === 'all' && !selectedCategory)) && 
              styles.categoryChipActive,
            ]}
            onPress={() => handleCategorySelect(category.id)}
          >
            <Text style={styles.categoryIcon}>{category.icon}</Text>
            <Text
              style={[
                styles.categoryText,
                (selectedCategory === category.id || 
                 (category.id === 'all' && !selectedCategory)) && 
                styles.categoryTextActive,
              ]}
            >
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Результаты поиска */}
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsCount}>
          Найдено: {filteredEvents.length}
        </Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00D4AA" />
        </View>
      ) : filteredEvents.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🔍</Text>
          <Text style={styles.emptyText}>Ничего не найдено</Text>
          <Text style={styles.emptySubtext}>
            Попробуйте изменить параметры поиска
          </Text>
        </View>
      ) : (
        <ScrollView style={styles.resultsList} showsVerticalScrollIndicator={false}>
          {filteredEvents.map((event) => (
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

              {/* Категория */}
              <View style={styles.eventCategory}>
                <Text style={styles.eventCategoryText}>
                  {categories.find((c) => c.id === event.category)?.icon || '🌟'}
                </Text>
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
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2d2d44',
    marginHorizontal: 20,
    marginTop: 20,
    paddingHorizontal: 16,
    borderRadius: 12,
    height: 50,
  },
  searchIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#fff',
  },
  clearIcon: {
    fontSize: 20,
    color: '#666',
    padding: 4,
  },
  categoriesContainer: {
    marginTop: 20,
    maxHeight: 50,
  },
  categoriesContent: {
    paddingHorizontal: 20,
    gap: 10,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2d2d44',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  categoryChipActive: {
    backgroundColor: '#00D4AA',
  },
  categoryIcon: {
    fontSize: 16,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  categoryTextActive: {
    color: '#fff',
  },
  resultsHeader: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  resultsCount: {
    fontSize: 14,
    color: '#999',
    fontWeight: '600',
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
    fontSize: 80,
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  resultsList: {
    flex: 1,
    paddingHorizontal: 20,
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
  eventCategory: {
    width: 40,
    height: 40,
    backgroundColor: '#1a1a2e',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventCategoryText: {
    fontSize: 20,
  },
});