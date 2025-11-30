// ═══════════════════════════════════════════════════════
// PROFILE SCREEN - ПРОФИЛЬ С СОБЫТИЯМИ
// ═══════════════════════════════════════════════════════
// Файл: /Users/a00/mysterymeet/mobile/src/screens/ProfileScreen.tsx
// 
// Использование наших UI компонентов:
// - Card для карточек событий и статистики
// - Button для кнопки выхода
// - Chip для тегов (если понадобятся)
// - Полная интеграция с темой
// ═══════════════════════════════════════════════════════

import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { eventsAPI } from '../../services/api';
import { useTheme } from '../../theme/ThemeContext';
import { Card } from '../../components/UI/Card/Card';
import { Button } from '../../components/UI/Button/Button';
import { EventListItem } from '../../components/UI/EventListItem/EventListItem';

export default function ProfileScreen() {
  const { userData, logout } = useAuth();
  const navigation = useNavigation();
  const { theme } = useTheme();
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
      const events = await eventsAPI.getMy();
      console.log('✅ Мои события загружены:', events.length);
      setMyEvents(events);
    } catch (error) {
      console.error('Ошибка загрузки событий:', error);
    } finally {
      setLoading(false);
    }
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
              await eventsAPI.delete(eventId);
              Alert.alert('Успех', 'Событие удалено');
              loadMyEvents();
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
    <ScrollView style={{ 
      flex: 1, 
      backgroundColor: theme.colors.background.primary,
      paddingTop: theme.metrics.device.statusBarHeight,
    }}>
      
      {/* Шапка профиля */}
      <View style={{
        alignItems: 'center',
        paddingTop: theme.spacing.xl,
        paddingBottom: theme.spacing.base,
      }}>
        <View style={{
          width: 100,
          height: 100,
          borderRadius: 50,
          backgroundColor: theme.colors.primary[500],
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: theme.spacing.base,
        }}>
          <Text style={{
            fontSize: 40,
            fontWeight: 'bold',
            color: theme.colors.text.onAccent,
          }}>
            {userData?.username?.charAt(0).toUpperCase() || '?'}
          </Text>
        </View>
        <Text style={{
          fontSize: theme.typography.h2.fontSize,
          fontWeight: theme.typography.h2.fontWeight,
          color: theme.colors.text.primary,
          marginBottom: theme.spacing.xs,
        }}>
          @{userData?.username}
        </Text>
        <Text style={{
          fontSize: theme.typography.caption.fontSize,
          color: theme.colors.text.secondary,
        }}>
          {userData?.email}
        </Text>
      </View>

      {/* Статистика */}
      <View style={{
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: theme.spacing.base,
        marginBottom: theme.spacing.xl,
        marginTop: theme.spacing.base,
      }}>
        <Card variant="filled" padding="medium" style={{
          width: '48%',
          alignItems: 'center',
          marginBottom: theme.spacing.sm,
          marginHorizontal: '1%',
        }}>
          <Text style={{ fontSize: 32, marginBottom: theme.spacing.sm }}>📅</Text>
          <Text style={{
            fontSize: 28,
            fontWeight: 'bold',
            color: theme.colors.primary[500],
            marginBottom: theme.spacing.xs,
          }}>
            {myEvents.length}
          </Text>
          <Text style={{
            fontSize: theme.typography.small.fontSize,
            color: theme.colors.text.tertiary,
            textAlign: 'center',
          }}>
            Создано
          </Text>
        </Card>

        <Card variant="filled" padding="medium" style={{
          width: '48%',
          alignItems: 'center',
          marginBottom: theme.spacing.sm,
          marginHorizontal: '1%',
        }}>
          <Text style={{ fontSize: 32, marginBottom: theme.spacing.sm }}>✅</Text>
          <Text style={{
            fontSize: 28,
            fontWeight: 'bold',
            color: theme.colors.primary[500],
            marginBottom: theme.spacing.xs,
          }}>
            0
          </Text>
          <Text style={{
            fontSize: theme.typography.small.fontSize,
            color: theme.colors.text.tertiary,
            textAlign: 'center',
          }}>
            Посещено
          </Text>
        </Card>

        <Card variant="filled" padding="medium" style={{
          width: '48%',
          alignItems: 'center',
          marginBottom: theme.spacing.sm,
          marginHorizontal: '1%',
        }}>
          <Text style={{ fontSize: 32, marginBottom: theme.spacing.sm }}>👥</Text>
          <Text style={{
            fontSize: 28,
            fontWeight: 'bold',
            color: theme.colors.primary[500],
            marginBottom: theme.spacing.xs,
          }}>
            0
          </Text>
          <Text style={{
            fontSize: theme.typography.small.fontSize,
            color: theme.colors.text.tertiary,
            textAlign: 'center',
          }}>
            Друзей
          </Text>
        </Card>

        <Card variant="filled" padding="medium" style={{
          width: '48%',
          alignItems: 'center',
          marginBottom: theme.spacing.sm,
          marginHorizontal: '1%',
        }}>
          <Text style={{ fontSize: 32, marginBottom: theme.spacing.sm }}>🤝</Text>
          <Text style={{
            fontSize: 28,
            fontWeight: 'bold',
            color: theme.colors.primary[500],
            marginBottom: theme.spacing.xs,
          }}>
            0
          </Text>
          <Text style={{
            fontSize: theme.typography.small.fontSize,
            color: theme.colors.text.tertiary,
            textAlign: 'center',
          }}>
            Встреч
          </Text>
        </Card>
      </View>

      {/* Раздел экспериментов */}
      <View style={{ paddingHorizontal: theme.spacing.base, marginBottom: theme.spacing.xl }}>
        <Text style={{
          fontSize: theme.typography.h3.fontSize,
          fontWeight: theme.typography.h3.fontWeight,
          color: theme.colors.text.primary,
          marginBottom: theme.spacing.base,
        }}>
          Эксперименты
        </Text>
        
        <Card 
          variant="elevated" 
          padding="medium"
          style={{ borderLeftWidth: 4, borderLeftColor: theme.colors.primary[500] }}
        >
          <Text style={{
            fontSize: theme.typography.bodyBold.fontSize,
            fontWeight: theme.typography.bodyBold.fontWeight,
            color: theme.colors.text.primary,
            marginBottom: theme.spacing.xs,
          }}>
            🎨 Logo Particles
          </Text>
          <Text style={{
            fontSize: theme.typography.small.fontSize,
            color: theme.colors.text.secondary,
          }}>
            Анимация частиц
          </Text>
        </Card>
      </View>

      {/* Мои события */}
      <View style={{ paddingHorizontal: theme.spacing.base, marginBottom: theme.spacing.xl }}>
        <Text style={{
          fontSize: theme.typography.h3.fontSize,
          fontWeight: theme.typography.h3.fontWeight,
          color: theme.colors.text.primary,
          marginBottom: theme.spacing.base,
        }}>
          Мои события
        </Text>
        
        {loading ? (
          <Card variant="filled" padding="large" style={{ alignItems: 'center' }}>
            <ActivityIndicator size="large" color={theme.colors.primary[500]} />
          </Card>
        ) : myEvents.length === 0 ? (
          <Card variant="filled" padding="large" style={{ alignItems: 'center' }}>
            <Text style={{ fontSize: 60, marginBottom: theme.spacing.base, color: theme.colors.text.secondary }}>
              📹
            </Text>
            <Text style={{
              fontSize: theme.typography.bodyBold.fontSize,
              fontWeight: theme.typography.bodyBold.fontWeight,
              color: theme.colors.text.primary,
              marginBottom: theme.spacing.sm,
            }}>
              Вы ещё не создали события
            </Text>
            <Text style={{
              fontSize: theme.typography.caption.fontSize,
              color: theme.colors.text.secondary,
              textAlign: 'center',
            }}>
              Перейдите на вкладку "Карта" для создания!
            </Text>
          </Card>
        ) : (
          <View style={{ gap: theme.spacing.sm }}>
            {myEvents.map((event) => (
  <EventListItem
    key={event.id}
    event={event}
    variant="withActions"
    onEdit={() => Alert.alert('Скоро', 'Редактирование в разработке')}
    onDelete={() => handleDeleteEvent(event.id, event.title)}
  />
))}

          </View>
        )}
      </View>

      {/* Кнопка выхода */}
      <View style={{ paddingHorizontal: theme.spacing.base, marginBottom: theme.spacing.base }}>
        <Button
          variant="primary"
          size="large"
          title="Выйти"
          onPress={handleLogout}
        />
      </View>

      <Text style={{
        textAlign: 'center',
        color: theme.colors.text.tertiary,
        fontSize: theme.typography.small.fontSize,
        marginBottom: theme.spacing.xl,
      }}>
        KULA MVP v1.0.0
      </Text>
    </ScrollView>
  );
}