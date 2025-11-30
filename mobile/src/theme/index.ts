// ═══════════════════════════════════════════════════════
// THEME - ГЛАВНЫЙ ФАЙЛ ТЕМЫ ПРИЛОЖЕНИЯ
// ═══════════════════════════════════════════════════════
// Файл: /Users/a00/mysterymeet/mobile/src/theme/index.ts
// 
// Что здесь:
// 1. Theme interface - основной интерфейс темы
// 2. theme object - экспорт всей темы приложения
// 
// Структура темы:
// - colors: цветовая палитра (активная тема)
// - typography: система шрифтов и текстовых стилей
// - spacing: система отступов и размеров
// - borderRadius: радиусы скругления элементов
// - shadows: система теней
// - metrics: метрики устройства и компонентов
// ═══════════════════════════════════════════════════════

import { Colors } from './colors';
import { Typography } from './typography';
import { spacing, borderRadius, screen, button, icon, tabBar } from './spacing';
import { shadows } from './shadows';
import { device, video, components } from './metrics';

// ============================================
// THEME INTERFACE - ОСНОВНОЙ ИНТЕРФЕЙС ТЕМЫ
// ============================================

export interface Theme {
  colors: typeof Colors;
  typography: typeof Typography;
  spacing: typeof spacing;
  borderRadius: typeof borderRadius;
  shadows: typeof shadows;
  components: typeof components;
  metrics: {
    device: typeof device;
    video: typeof video;
    components: typeof components;
  };
}

// ============================================
// THEME OBJECT - ЭКСПОРТ ОСНОВНОЙ ТЕМЫ
// ============================================

export const theme: Theme = {
  colors: Colors,
  typography: Typography,
  spacing: spacing,
  borderRadius: borderRadius,
  shadows: shadows,
  components: components,
  metrics: {
    device,
    video,
    components,
  },
};

export default theme;