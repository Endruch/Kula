// ═══════════════════════════════════════════════════════
// CARD - УНИВЕРСАЛЬНЫЙ КОМПОНЕНТ КАРТОЧКИ
// ═══════════════════════════════════════════════════════
// Файл: /Users/a00/mysterymeet/mobile/src/components/UI/Card/Card.tsx
// 
// Использование:
// <Card variant="elevated" padding="medium">Content</Card>
// 
// Варианты:
// - variant: elevated, outlined, filled
// - padding: none, small, medium, large
// ═══════════════════════════════════════════════════════

import React from 'react';
import { View, Pressable, ViewStyle } from 'react-native';
import { useTheme } from '../../../theme/ThemeContext';

interface CardProps {
  variant?: 'elevated' | 'outlined' | 'filled';
  padding?: 'none' | 'small' | 'medium' | 'large';
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
}

export const Card: React.FC<CardProps> = ({
  variant = 'elevated',
  padding = 'medium',
  children,
  style,
  onPress,
}) => {
  const { theme } = useTheme();

  const getCardStyle = (): ViewStyle[] => {
    const baseStyle: ViewStyle = {
      borderRadius: theme.borderRadius.card,
    };

    const variantStyles: Record<string, ViewStyle> = {
      elevated: {
        backgroundColor: theme.colors.surface.primary,
        ...theme.shadows.medium,
      },
      outlined: {
        backgroundColor: theme.colors.surface.primary,
        borderWidth: 1,
        borderColor: theme.colors.border.light,
      },
      filled: {
        backgroundColor: theme.colors.surface.secondary,
      },
    };

    const paddingStyles: Record<string, ViewStyle> = {
      none: { padding: 0 },
      small: { padding: theme.spacing.sm },
      medium: { padding: theme.spacing.base },
      large: { padding: theme.spacing.lg },
    };

    return [
      baseStyle, 
      variantStyles[variant], 
      paddingStyles[padding]
    ];
  };

  // Если есть onPress, используем Pressable
  if (onPress) {
    return (
      <Pressable 
        style={({ pressed }) => [
          ...getCardStyle(),
          pressed && { opacity: 0.8 },
          style,
        ]}
        onPress={onPress}
      >
        {children}
      </Pressable>
    );
  }

  // Иначе обычный View
  return (
    <View style={[...getCardStyle(), style]}>
      {children}
    </View>
  );
};

export default Card;