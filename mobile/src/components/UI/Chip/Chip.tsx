// ═══════════════════════════════════════════════════════
// CHIP - КОМПОНЕНТ ТЕГА/ЧИПСА
// ═══════════════════════════════════════════════════════
// Файл: /Users/a00/mysterymeet/mobile/src/components/UI/Chip/Chip.tsx
// 
// Использование:
// <Chip variant="filled" size="small" label="React Native" icon="⚡" />
// <Chip variant="outlined" selected={true} label="Selected" />
// 
// Варианты:
// - variant: filled, outlined
// - size: small, medium
// ═══════════════════════════════════════════════════════

import React from 'react';
import { TouchableOpacity, Text, View, ViewStyle } from 'react-native';
import { useTheme } from '../../../theme/ThemeContext'; 

interface ChipProps {
  variant?: 'filled' | 'outlined';
  size?: 'small' | 'medium';
  label: string;
  icon?: string;
  selected?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
}

export const Chip: React.FC<ChipProps> = ({
  variant = 'filled',
  size = 'medium',
  label,
  icon,
  selected = false,
  onPress,
  style,
}) => {
  const { theme } = useTheme();

  const getChipStyle = (): ViewStyle[] => {
    const baseStyle: ViewStyle = {
      borderRadius: theme.borderRadius.tag,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      gap: theme.spacing.xs,
    };

    const sizeStyles: Record<string, ViewStyle> = {
      small: {
        height: 24,
        paddingHorizontal: theme.spacing.sm,
      },
      medium: {
        height: 32,
        paddingHorizontal: theme.spacing.base,
      },
    };

    const variantStyles: Record<string, ViewStyle> = {
      filled: {
        backgroundColor: selected ? theme.colors.primary[500] : theme.colors.surface.secondary,
      },
      outlined: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: selected ? theme.colors.primary[500] : theme.colors.border.light,
      },
    };

    return [baseStyle, sizeStyles[size], variantStyles[variant]];
  };

  const getTextStyle = () => {
    const baseStyle = {
      fontWeight: '600' as const,
    };

    const sizeStyles = {
      small: {
        fontSize: theme.typography.small.fontSize,
        lineHeight: theme.typography.small.lineHeight,
      },
      medium: {
        fontSize: theme.typography.caption.fontSize,
        lineHeight: theme.typography.caption.lineHeight,
      },
    };

    const variantStyles = {
      filled: {
        color: selected ? theme.colors.text.onAccent : theme.colors.text.secondary,
      },
      outlined: {
        color: selected ? theme.colors.primary[500] : theme.colors.text.secondary,
      },
    };

    return [baseStyle, sizeStyles[size], variantStyles[variant]];
  };

  const getIconStyle = () => ({
    fontSize: size === 'small' ? theme.typography.small.fontSize : theme.typography.caption.fontSize,
  });

  const Component = onPress ? TouchableOpacity : View;

  return (
    <Component style={[...getChipStyle(), style]} onPress={onPress}>
      {icon && <Text style={getIconStyle()}>{icon}</Text>}
      <Text style={getTextStyle()}>{label}</Text>
    </Component>
  );
};

export default Chip;