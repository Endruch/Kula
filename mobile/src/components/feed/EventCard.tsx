// ═══════════════════════════════════════════════════════
// EVENT CARD - КАРТОЧКА СОБЫТИЯ (ОБНОВЛЁННАЯ)
// ═══════════════════════════════════════════════════════
// Добавлено:
// - Боковая панель с кнопками (лайк, комменты, карта)
// - Счётчики лайков и комментариев
// - Убран аватар создателя
// ═══════════════════════════════════════════════════════

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface Event {
  id: string;
  title: string;
  location: string;
  dateTime: string;
  participants: number;
  maxParticipants: number;
  likes: number;
  comments: number;
  isLiked: boolean; 
  creator: {
    id: string;
    name: string;
  };
}

interface EventCardProps {
  event: Event;
  onParticipate: () => void;
  onLike: () => void;
  onComment: () => void;
  onMapPress: () => void;
}

export default function EventCard({ 
  event, 
  onParticipate, 
  onLike,
  onComment,
  onMapPress,
}: EventCardProps) {
  return (
    <View style={styles.container}>
      {/* Боковая панель справа */}
      <View style={styles.sidePanel}>
        {/* Лайк */}
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={onLike}
          activeOpacity={0.7}
        >
          <Text style={styles.actionIcon}>
            {event.isLiked ? '❤️' : '🤍'}
          </Text>
          <Text style={styles.actionCount}>{event.likes}</Text>
        </TouchableOpacity>

        {/* Комментарии */}
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={onComment}
          activeOpacity={0.7}
        >
          <Text style={styles.actionIcon}>💬</Text>
          <Text style={styles.actionCount}>{event.comments}</Text>
        </TouchableOpacity>

        {/* Карта (переход к месту события) */}
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={onMapPress}
          activeOpacity={0.7}
        >
          <Text style={styles.actionIcon}>🗺️</Text>
        </TouchableOpacity>
      </View>

      {/* Информация о событии */}
      <View style={styles.infoContainer}>
        {/* Создатель */}
        <Text style={styles.creator}>@{event.creator.name}</Text>
        
        {/* Название */}
        <Text style={styles.title}>{event.title}</Text>
        
        {/* Место */}
        <View style={styles.row}>
          <Text style={styles.icon}>📍</Text>
          <Text style={styles.location}>{event.location}</Text>
        </View>
        
        {/* Дата и время */}
        <View style={styles.row}>
          <Text style={styles.icon}>📅</Text>
          <Text style={styles.dateTime}>
            {new Date(event.dateTime).toLocaleDateString('ru-RU', {
              day: 'numeric',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>
        
        {/* Участники */}
        <View style={styles.row}>
          <Text style={styles.icon}>👥</Text>
          <Text style={styles.participants}>
            {event.participants}/{event.maxParticipants} участников
          </Text>
        </View>
      </View>

      {/* Кнопка участия */}
      <TouchableOpacity 
        style={styles.participateButton}
        onPress={onParticipate}
        activeOpacity={0.8}
      >
        <Text style={styles.participateText}>Участвовать</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 40,
  },
  // Боковая панель
  sidePanel: {
    position: 'absolute',
    right: 20,
    bottom: 180,
    alignItems: 'center',
  },
  actionButton: {
    alignItems: 'center',
    marginBottom: 20,
  },
  actionIcon: {
    fontSize: 32,
    marginBottom: 4,
  },
  actionCount: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  // Информация о событии
  infoContainer: {
    marginBottom: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    padding: 16,
    borderRadius: 12,
    marginRight: 80, // Место для боковой панели
  },
  creator: {
    fontSize: 14,
    color: '#00D4AA',
    fontWeight: '700',
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  icon: {
    fontSize: 16,
    marginRight: 8,
  },
  location: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
  },
  dateTime: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
  },
  participants: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
  },
  participateButton: {
    backgroundColor: '#00D4AA',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 30,
    alignItems: 'center',
    marginRight: 80, // Место для боковой панели
  },
  participateText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});