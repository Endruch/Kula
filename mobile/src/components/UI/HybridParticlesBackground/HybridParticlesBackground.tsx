// src/components/backgrounds/HybridParticlesBackground.tsx

/**
 * HybridParticlesBackground - Анимированный фон с частицами и соединениями
 * 
 * Компонент создает красивый анимированный фон с движущимися частицами различных форм
 * (кристаллы, фракталы), которые соединяются линиями при приближении друг к другу.
 * Поддерживает интерактивное взаимодействие через касания.
 * 
 * @version 1.0.0
 * @author EndruCh
 * @created 2025
 */

import React, { useEffect, useState, useCallback } from 'react';
import { View, Dimensions, StyleSheet } from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';

// ==================== КОНСТАНТЫ ====================
const { width, height } = Dimensions.get('window');
const PARTICLE_COUNT = 60;
const CONNECTION_DISTANCE = 110;
const INTERACTION_RADIUS = 200;

// ==================== ТИПЫ ====================
interface HybridParticle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  baseSize: number;
  color: string;
  opacity: number;
  rotation: number;
  rotationSpeed: number;
  pulseSpeed: number;
  pulsePhase: number;
  shape: 'crystal' | 'mandelbrot' | 'koch' | 'julia';
  connections: string[];
}

interface Connection {
  start: HybridParticle;
  end: HybridParticle;
  opacity: number;
}

export interface HybridParticlesBackgroundProps {
  /** Количество частиц (по умолчанию 60) */
  particleCount?: number;
  /** Включить интерактивность (по умолчанию true) */
  interactionEnabled?: boolean;
  /** Цветовая палитра для частиц */
  colorPalette?: string[];
  /** Расстояние для соединения частиц (по умолчанию 110) */
  connectionDistance?: number;
  /** Радиус взаимодействия при касаниях (по умолчанию 200) */
  interactionRadius?: number;
}

// Правильный тип для события жеста
interface GestureEvent {
  nativeEvent: {
    state: number;
    x: number;
    y: number;
    [key: string]: any;
  };
}

// ==================== КОМПОНЕНТЫ ====================

/**
 * Компонент отдельной частицы
 */
const HybridParticleComponent = ({ particle }: { particle: HybridParticle }) => {
  const getParticleStyle = () => {
    switch (particle.shape) {
      case 'crystal':
        return {
          borderRadius: 4,
          transform: [
            { rotate: `${particle.rotation}deg` },
            { scale: 1 + Math.sin(particle.pulsePhase) * 0.3 }
          ],
        };
      case 'mandelbrot':
        return {
          borderRadius: particle.size / 4,
          borderWidth: 1,
          borderColor: particle.color,
        };
      case 'koch':
        return {
          borderRadius: 2,
          transform: [
            { rotate: `${particle.rotation}deg` },
            { scale: 1 + Math.sin(particle.pulsePhase) * 0.2 }
          ],
        };
      case 'julia':
        return {
          borderRadius: particle.size / 2,
          borderWidth: 2,
          borderColor: particle.color,
        };
      default:
        return {};
    }
  };

  return (
    <View 
      style={[
        styles.particle,
        {
          left: particle.x - particle.size / 2,
          top: particle.y - particle.size / 2,
          width: particle.size,
          height: particle.size,
          backgroundColor: particle.shape === 'mandelbrot' ? particle.color : 
                         particle.shape === 'crystal' ? particle.color : 'transparent',
          opacity: particle.opacity,
        },
        getParticleStyle()
      ]} 
    />
  );
};

/**
 * Компонент линии соединения между частицами
 */
const ConnectionLine = ({ start, end, opacity }: { 
  start: { x: number; y: number };
  end: { x: number; y: number };
  opacity: number;
}) => {
  const length = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2));
  const angle = Math.atan2(end.y - start.y, end.x - start.x) * (180 / Math.PI);
  
  return (
    <View
      style={[
        styles.connection,
        {
          left: start.x,
          top: start.y,
          width: length,
          opacity: opacity * 0.7,
          transform: [{ rotate: `${angle}deg` }],
        }
      ]}
    />
  );
};

// ==================== ГЛАВНЫЙ КОМПОНЕНТ ФОНА ====================

/**
 * HybridParticlesBackground - Основной компонент фона с частицами
 */
export default function HybridParticlesBackground({ 
  particleCount = PARTICLE_COUNT,
  interactionEnabled = true,
  colorPalette = [
    '#6E47F5', '#8C8C8C', '#BDBDBD', '#666666', '#999999',
    '#7E57C2', '#5C6BC0', '#26A69A', '#66BB6A', '#FFA726'
  ],
  connectionDistance = CONNECTION_DISTANCE,
  interactionRadius = INTERACTION_RADIUS
}: HybridParticlesBackgroundProps) {
  const [particles, setParticles] = useState<HybridParticle[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);

  const shapes: Array<'crystal' | 'mandelbrot' | 'koch' | 'julia'> = [
    'crystal', 'mandelbrot', 'koch', 'julia'
  ];

  // Создание гибридных частиц
  const createHybridParticles = useCallback((): HybridParticle[] => {
    const newParticles: HybridParticle[] = [];
    
    for (let i = 0; i < particleCount; i++) {
      const shape = shapes[Math.floor(Math.random() * shapes.length)];
      
      // Разные размеры для разных форм
      let sizeRange = [6, 16];
      if (shape === 'crystal') sizeRange = [8, 14];
      if (shape === 'mandelbrot') sizeRange = [6, 12];
      if (shape === 'koch') sizeRange = [4, 10];
      if (shape === 'julia') sizeRange = [8, 16];
      
      newParticles.push({
        id: `hybrid-${i}`,
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.13,
        vy: (Math.random() - 0.5) * 0.13,
        size: sizeRange[0] + Math.random() * (sizeRange[1] - sizeRange[0]),
        baseSize: sizeRange[0] + Math.random() * (sizeRange[1] - sizeRange[0]),
        color: colorPalette[Math.floor(Math.random() * colorPalette.length)],
        opacity: 0.1,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.1) * 0.9,
        pulseSpeed: 0.003 + Math.random() * 0.003,
        pulsePhase: Math.random() * Math.PI * 2,
        shape: shape,
        connections: [],
      });
    }
    
    return newParticles;
  }, [width, height, particleCount, colorPalette]);

  // Создание соединений
  const updateConnections = useCallback((particlesList: HybridParticle[]) => {
    const newConnections: Connection[] = [];
    
    for (let i = 0; i < particlesList.length; i++) {
      for (let j = i + 1; j < particlesList.length; j++) {
        const p1 = particlesList[i];
        const p2 = particlesList[j];
        const distance = Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
        
        if (distance < connectionDistance) {
          const opacity = 1 - (distance / connectionDistance);
          newConnections.push({
            start: p1,
            end: p2,
            opacity: opacity * 0.5,
          });
        }
      }
    }
    
    setConnections(newConnections);
  }, [connectionDistance]);

  // Инициализация
  useEffect(() => {
    const newParticles = createHybridParticles();
    setParticles(newParticles);
    updateConnections(newParticles);
  }, [createHybridParticles, updateConnections]);

  // Основная анимация
  useEffect(() => {
    const animationFrame = setInterval(() => {
      setParticles(prev => {
        const newParticles = prev.map(particle => {
          let newX = particle.x + particle.vx;
          let newY = particle.y + particle.vy;
          
          // Отскок от границ
          if (newX < 0 || newX > width) particle.vx *= -1;
          if (newY < 0 || newY > height) particle.vy *= -1;
          
          // Замедление
          particle.vx *= 0.98;
          particle.vy *= 0.98;
          
          // Пульсация
          const newPulsePhase = particle.pulsePhase + particle.pulseSpeed;
          const pulseEffect = Math.sin(newPulsePhase) * 0.1;
          const newSize = particle.baseSize * (1 + pulseEffect);
          
          // Вращение
          const newRotation = particle.rotation + particle.rotationSpeed;
          
          // Случайное изменение направления
          if (Math.random() < 0.02) {
            particle.vx += (Math.random() - 0.5) * 0.4;
            particle.vy += (Math.random() - 0.5) * 0.2;
          }
          
          // Ограничение скорости
          const speed = Math.sqrt(particle.vx * particle.vx + particle.vy * particle.vy);
          if (speed > 5) {
            particle.vx = (particle.vx / speed) * 0.5;
            particle.vy = (particle.vy / speed) * 0.1;
          }
          
          return {
            ...particle,
            x: newX,
            y: newY,
            size: newSize,
            rotation: newRotation,
            pulsePhase: newPulsePhase,
            vx: particle.vx,
            vy: particle.vy,
          };
        });
        
        updateConnections(newParticles);
        return newParticles;
      });
    }, 16);
    
    return () => clearInterval(animationFrame);
  }, [width, height, updateConnections]);

  // Обработка касаний - упрощенная версия с правильной типизацией
  const onGestureEvent = useCallback((event: GestureEvent) => {
    if (!interactionEnabled) return;
    
    const { nativeEvent } = event;
    
    if (nativeEvent.state === State.ACTIVE) {
      const { x, y } = nativeEvent;
      
      setParticles(prev => prev.map(particle => {
        const dx = particle.x - x;
        const dy = particle.y - y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < interactionRadius) {
          const force = 300 / (distance + 1);
          const angle = Math.atan2(dy, dx);
          
          return {
            ...particle,
            vx: particle.vx + Math.cos(angle) * force,
            vy: particle.vy + Math.sin(angle) * force,
          };
        }
        
        return particle;
      }));
    }
  }, [interactionEnabled, interactionRadius]);

  // Альтернативная версия обработчика с использованием onHandlerStateChange
  const onHandlerStateChange = useCallback((event: GestureEvent) => {
    onGestureEvent(event);
  }, [onGestureEvent]);

  const Content = (
    <View style={styles.canvas}>
      {/* Соединения */}
      {connections.map((connection, index) => (
        <ConnectionLine
          key={`conn-${index}`}
          start={connection.start}
          end={connection.end}
          opacity={connection.opacity}
        />
      ))}
      
      {/* Гибридные частицы */}
      {particles.map(particle => (
        <HybridParticleComponent
          key={particle.id}
          particle={particle}
        />
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      {interactionEnabled ? (
        <PanGestureHandler
          onGestureEvent={onGestureEvent}
          onHandlerStateChange={onHandlerStateChange}
        >
          {Content}
        </PanGestureHandler>
      ) : (
        Content
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
  canvas: {
    ...StyleSheet.absoluteFillObject,
  },
  particle: {
    position: 'absolute',
  },
  connection: {
    position: 'absolute',
    height: 1,
    backgroundColor: '#6E47F5',
  },
});