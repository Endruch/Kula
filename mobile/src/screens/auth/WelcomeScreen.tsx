// ═══════════════════════════════════════════════════════
// WELCOME SCREEN - ЭКРАН ПРИВЕТСТВИЯ
// ═══════════════════════════════════════════════════════
// Первый экран который видит незалогиненный пользователь
// Кнопки: Войти / Создать аккаунт / Тест Backend
// ═══════════════════════════════════════════════════════

import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert } from 'react-native';
import axios from 'axios';
import { API_URL } from '../../services/api';

export default function WelcomeScreen({ navigation }: any) {
  const [backendStatus, setBackendStatus] = useState('Проверяем...');

  useEffect(() => {
    console.log('👋 WelcomeScreen loaded');
    checkBackend();
  }, []);

  // Проверка подключения к backend
  const checkBackend = async () => {
    try {
      // Проверяем root endpoint
      const baseUrl = API_URL.replace('/api', '');
      const response = await axios.get(baseUrl, { timeout: 3000 });
      
      if (response.data?.message) {
        setBackendStatus('✅ Backend доступен');
        console.log('✅ Backend connected:', response.data.message);
      }
    } catch (error) {
      setBackendStatus('❌ Backend недоступен');
      console.log('❌ Backend not connected');
    }
  };

  // Тест подключения (кнопка)
  const testBackend = async () => {
    try {
      const baseUrl = API_URL.replace('/api', '');
      const response = await axios.get(baseUrl, { timeout: 3000 });
      
      Alert.alert(
        'Успех! 🎉', 
        `Backend ответил:\n${response.data?.message || 'OK'}`
      );
    } catch (error: any) {
      Alert.alert(
        'Ошибка', 
        `Не удалось подключиться к backend\n\nURL: ${API_URL}\n\nПроверь что backend запущен!`
      );
      console.error('Backend test failed:', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>✨ KULA</Text>
      <Text style={styles.subtitle}>
        FIND YOUR KULA{'\n'}
        через реальные события
      </Text>

      {/* Backend status */}
      <Text style={styles.status}>{backendStatus}</Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.loginButton}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.loginButtonText}>Войти</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.registerButton}
          onPress={() => navigation.navigate('Register')}
        >
          <Text style={styles.registerButtonText}>Создать аккаунт</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.testButton}
          onPress={testBackend}
        >
          <Text style={styles.testButtonText}>🧪 Тест Backend</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.footer}>
        🚀 Версия MVP 0.1.0
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 18,
    color: '#aaa',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 28,
  },
  status: {
    fontSize: 14,
    color: '#4ecca3',
    marginBottom: 40,
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 300,
  },
  loginButton: {
    backgroundColor: '#4ecca3',
    paddingVertical: 16,
    borderRadius: 30,
    marginBottom: 15,
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  registerButton: {
    backgroundColor: 'transparent',
    paddingVertical: 16,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#4ecca3',
    alignItems: 'center',
    marginBottom: 15,
  },
  registerButtonText: {
    color: '#4ecca3',
    fontSize: 18,
    fontWeight: 'bold',
  },
  testButton: {
    backgroundColor: '#555',
    paddingVertical: 12,
    borderRadius: 20,
    alignItems: 'center',
  },
  testButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    color: '#555',
    fontSize: 14,
  },
});