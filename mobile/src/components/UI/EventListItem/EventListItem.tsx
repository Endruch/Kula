// ═══════════════════════════════════════════════════════
// EVENT LIST ITEM - КОМПАКТНАЯ КАРТОЧКА СОБЫТИЯ ДЛЯ СПИСКОВ
// ═══════════════════════════════════════════════════════
// Файл: /Users/a00/mysterymeet/mobile/src/components/UI/EventListItem/EventListItem.tsx
// 
// Варианты использования:
// 1. withActions - с кнопками редактирования/удаления (профиль)
// 2. viewOnly - только просмотр (карта, лента)
// 3. custom - кастомные действия
// ═══════════════════════════════════════════════════════

import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '../../../theme/ThemeContext';
import Card from '../Card';
import Button from '../Button'; 

export type EventListItemProps = {
  event: {
    id: string;
    title: string;
    location: string;
    dateTime: string;
    participants?: number;
    maxParticipants?: number;
  };
  variant?: 'withActions' | 'viewOnly' | 'custom';
  onEdit?: () => void;
  onDelete?: () => void;
  onPress?: () => void;
  actions?: Array<{
    icon: string;
    onPress: () => void;
    variant?: 'primary' | 'ghost' | 'secondary' | 'outline';
  }>;
  showParticipants?: boolean;
  showPreview?: boolean;
};

export const EventListItem: React.FC<EventListItemProps> = ({
  event,
  variant = 'viewOnly',
  onEdit,
  onDelete,
  onPress,
  actions = [],
  showParticipants = true,
  showPreview = true,
}) => {
  const { theme } = useTheme();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderActions = () => {
    switch (variant) {
      case 'withActions':
        return (
          <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
            <Button
              variant="ghost"
              size="small"
              title="✏️"
              onPress={onEdit || (() => {})}    
            />
            <Button
              variant="ghost"
              size="small"
              title="🗑️"
              onPress={onDelete || (() => {})}
            />
          </View>
        );
      
      case 'custom':
        if (actions.length === 0) return null;
        
        return (
          <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
            {actions.map((action, index) => (
              <Button
                key={index}
                variant={action.variant || 'ghost'}
                size="small"
                title={action.icon}
                onPress={action.onPress}
              />
            ))}
          </View>
        );
      
      case 'viewOnly':
      default:
        return null;
    }
  };

  return (
    <Card 
      variant="elevated" 
      padding="medium"
      onPress={variant === 'viewOnly' ? onPress : undefined}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {/* Превью видео */}
        {showPreview && (
          <View style={{
            width: 80,
            height: 80,
            backgroundColor: theme.colors.background.secondary,
            borderRadius: theme.borderRadius.md,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: theme.spacing.base,
          }}>
            <Text style={{ fontSize: 32, color: theme.colors.text.secondary }}>🎬</Text>
          </View>
        )}

        {/* Информация о событии */}
        <View style={{ flex: 1, marginRight: variant !== 'viewOnly' ? theme.spacing.sm : 0 }}>
          <Text style={{
            fontSize: theme.typography.bodyBold.fontSize,
            fontWeight: theme.typography.bodyBold.fontWeight,
            color: theme.colors.text.primary,
            marginBottom: theme.spacing.xs,
          }} numberOfLines={1}>
            {event.title}
          </Text>
          <Text style={{
            fontSize: theme.typography.caption.fontSize,
            color: theme.colors.text.secondary,
            marginBottom: 2,
          }} numberOfLines={1}>
            📍 {event.location}
          </Text>
          <Text style={{
            fontSize: theme.typography.caption.fontSize,
            color: theme.colors.text.secondary,
            marginBottom: 2,
          }}>
            📅 {formatDate(event.dateTime)}
          </Text>
          {showParticipants && event.participants !== undefined && (
            <Text style={{
              fontSize: theme.typography.caption.fontSize,
              color: theme.colors.primary[500],
              fontWeight: '600',
            }}>
              👥 {event.participants}/{event.maxParticipants || '∞'} участников
            </Text>
          )}
        </View>

        {/* Динамические действия */}
        {renderActions()}
      </View>
    </Card>
  );
};

export default EventListItem;