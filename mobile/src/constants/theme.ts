// ═══════════════════════════════════════════════════════
// THEME CONSTANTS - ЦВЕТА И РАЗМЕРЫ ИЗ ДИЗАЙН-ТЕМПЛЕЙТА
// ═══════════════════════════════════════════════════════
// Все константы из основного шаблона проекта
// ═══════════════════════════════════════════════════════

// ============================================
// DARK THEME (Темная тема)
// ============================================

export const Colors = {
  // Фоновые цвета
  background: '#000000', // или #121212
  backgroundSecondary: '#1A1A1A',
  surface: '#1E1E1E',
  border: '#2A2A2A',
  
  // Текстовые цвета
  textPrimary: '#FFFFFF',
  textSecondary: '#BDBDBD',
  textTertiary: '#8D8D8D',
  textOnAccent: '#FFFFFF',
  
  // Иконки
  iconPrimary: '#EDEDED',
  iconSecondary: '#7A7A7A',
  
  // Акцентные элементы
  primary: '#6E47F5', // Цвет бренда (фиолетовый)
  primaryDark: '#5A3CDB', // Темнее для темной темы
  primaryPressed: '#2D225C', // При нажатии
  
  // Фидбек и системные состояния
  success: '#4CAF50',
  error: '#EF5350',
  warning: '#FBC02D',
  info: '#29B6F6',
  
  // Фон кнопок
  buttonPrimary: '#6E47F5',
  buttonSecondary: '#1E1E1E',
  buttonDisabled: '#2C2C2C',
};

// ============================================
// РАЗМЕРЫ (4px система)
// ============================================

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 40,
};

// ============================================
// РАДИУСЫ СКРУГЛЕНИЯ
// ============================================

export const Radius = {
  card: 12,
  button: 12,
  input: 10,
  tag: 8,
};

// ============================================
// ТИПОГРАФИКА
// ============================================

export const Typography = {
  h1: {
    fontSize: 28,
    fontWeight: '700' as const,
    lineHeight: 32,
  },
  h2: {
    fontSize: 22,
    fontWeight: '600' as const,
    lineHeight: 28,
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 20,
  },
  bodySecondary: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 18,
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
  },
};

// ============================================
// КНОПКИ
// ============================================

export const Button = {
  height: 48,
  radius: 12,
  paddingHorizontal: 16,
  fontSize: 16,
  fontWeight: '600' as const,
};

// ============================================
// ИКОНКИ
// ============================================

export const IconSize = {
  small: 20,
  standard: 24,
  large: 28,
  strokeWidth: 2,
};

// ============================================
// НАВИГАЦИЯ
// ============================================

export const TabBar = {
  height: {
    android: 64,
    ios: 83,
  },
  iconSize: 24,
  paddingVertical: 10,
};

// ============================================
// ВИДЕО
// ============================================

export const Video = {
  gradientOpacity: 0.7, // 70% для темной темы
};

// ============================================
// ОТСТУПЫ ЭКРАНОВ
// ============================================

export const Screen = {
  paddingHorizontal: 16,
  sectionSpacing: 24,
  itemSpacing: 12,
  statusBarPadding: 16,
};

// ============================================
// КАРТОЧКИ
// ============================================

export const Card = {
  radius: 12,
  padding: 16,
  spacing: 12,
};