// ═══════════════════════════════════════════════════════
// BUTTON - УНИВЕРСАЛЬНЫЙ КОМПОНЕНТ КНОПКИ
// ═══════════════════════════════════════════════════════
// Файл: /Users/a00/mysterymeet/mobile/src/components/UI/Button/Button.tsx
// 
// Использование:
// <Button variant="primary" size="large" title="Submit" onPress={...} />
// 
// Варианты:
// - variant: primary, secondary, outline, ghost
// - size: small, medium, large
// ═══════════════════════════════════════════════════════

import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, ViewStyle, TextStyle} from 'react-native';
import { useTheme } from '../../../theme/ThemeContext';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  title,
  onPress,
  disabled = false,
  loading = false,
  style,
}) => {
  const { theme } = useTheme();

  const getButtonStyle = (): ViewStyle[] => {
    const baseStyle: ViewStyle = {
      borderRadius: theme.components.button.borderRadius,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
    };

    // Размеры
    const sizeStyles: Record<string, ViewStyle> = {
      small: {
        height: theme.components.button.small.height,
        paddingHorizontal: theme.components.button.small.paddingHorizontal,
      },
      medium: {
        height: theme.components.button.standard.height,
        paddingHorizontal: theme.components.button.standard.paddingHorizontal,
      },
      large: {
        height: theme.components.button.large.height,
        paddingHorizontal: theme.components.button.large.paddingHorizontal,
      },
    };

    // Варианты
    const variantStyles: Record<string, ViewStyle> = {
      primary: {
        backgroundColor: disabled ? theme.colors.text.tertiary : theme.colors.primary[500],
      },
      secondary: {
        backgroundColor: disabled ? theme.colors.text.tertiary : theme.colors.surface.secondary,
      },
      outline: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: disabled ? theme.colors.text.tertiary : theme.colors.primary[500],
      },
      ghost: {
        backgroundColor: 'transparent',
      },
    };

    return [baseStyle, sizeStyles[size], variantStyles[variant]];
  };

  const getTextStyle = (): TextStyle[] => {
    const baseStyle: TextStyle = {
      fontWeight: theme.typography.button.fontWeight as any,
    };

    const sizeStyles: Record<string, TextStyle> = {
      small: { fontSize: theme.typography.buttonSmall.fontSize },
      medium: { fontSize: theme.typography.button.fontSize },
      large: { fontSize: theme.typography.button.fontSize },
    };

    const variantStyles: Record<string, TextStyle> = {
      primary: { color: theme.colors.text.onAccent },
      secondary: { color: theme.colors.text.primary },
      outline: { color: disabled ? theme.colors.text.tertiary : theme.colors.primary[500] },
      ghost: { color: disabled ? theme.colors.text.tertiary : theme.colors.primary[500] },
    };

    return [baseStyle, sizeStyles[size], variantStyles[variant]];
  };

  return (
    <TouchableOpacity
      style={[...getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator 
          size="small" 
          color={
            variant === 'primary' ? theme.colors.text.onAccent : theme.colors.primary[500]
          } 
        />
      ) : (
        <Text style={getTextStyle()}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

// ═══════════════════════════════════════════════════════
// ЭКСПОРТ
// ═══════════════════════════════════════════════════════
export default Button;