// ═══════════════════════════════════════════════════════
// INPUT - КОМПОНЕНТ ПОЛЯ ВВОДА
// ═══════════════════════════════════════════════════════
// Файл: /Users/a00/mysterymeet/mobile/src/components/UI/Input/Input.tsx
// 
// Использование:
// <Input variant="outlined" placeholder="Enter email" value={text} onChangeText={setText} />
// 
// Варианты:
// - variant: default, outlined
// - size: medium, large
// ═══════════════════════════════════════════════════════

import React from 'react';
import { TextInput, Text, View, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '../../../theme/ThemeContext';

interface InputProps {
  variant?: 'default' | 'outlined';
  size?: 'medium' | 'large';
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  label?: string;
  error?: string;
  secureTextEntry?: boolean;
  multiline?: boolean;
}

export const Input: React.FC<InputProps> = ({
  variant = 'default',
  size = 'medium',
  placeholder,
  value,
  onChangeText,
  label,
  error,
  secureTextEntry = false,
  multiline = false,
}) => {
  const { theme } = useTheme();

  const getContainerStyle = (): ViewStyle[] => {
    const baseStyle: ViewStyle = {
      borderRadius: theme.borderRadius.input,
    };

    const sizeStyles: Record<string, ViewStyle> = {
      medium: {
        height: theme.components.input.height,
      },
      large: {
        height: theme.components.input.multilineHeight,
      },
    };

    const variantStyles: Record<string, ViewStyle> = {
      default: {
        backgroundColor: theme.colors.surface.secondary,
      },
      outlined: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: error ? theme.colors.error : theme.colors.border.light,
      },
    };

    return [baseStyle, sizeStyles[size], variantStyles[variant]];
  };

  const getInputStyle = (): TextStyle[] => {
    const baseStyle: TextStyle = {
      flex: 1,
      paddingHorizontal: theme.components.input.paddingHorizontal,
      color: theme.colors.text.primary,
      fontSize: theme.typography.body.fontSize,
    };

    const sizeStyles: Record<string, TextStyle> = {
      medium: {
        height: theme.components.input.height,
      },
      large: {
        height: theme.components.input.multilineHeight,
        textAlignVertical: 'top',
      },
    };

    return [baseStyle, sizeStyles[size]];
  };

  return (
    <View style={{ marginBottom: 16 }}>
      {label && (
        <Text style={{ 
          fontSize: 14, 
          fontWeight: '600', 
          marginBottom: 8, 
          color: theme.colors.text.secondary 
        }}>
          {label}
        </Text>
      )}
      <View style={[...getContainerStyle()]}>
        <TextInput
          style={[...getInputStyle()]}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.text.tertiary}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          multiline={multiline}
        />
      </View>
      {error && (
        <Text style={{ 
          fontSize: 12, 
          marginTop: 4, 
          color: theme.colors.error 
        }}>
          {error}
        </Text>
      )}
    </View>
  );
};

export default Input;