// src/screens/auth/WelcomeScreen.tsx
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert } from 'react-native';
import { api } from '../../services/api';

export default function WelcomeScreen({ navigation }: any) {
  const [backendStatus, setBackendStatus] = useState('Проверяем...');

  useEffect(() => {
    // Проверяем что backend работает
    api.healthCheck()
      .then(data => {
        setBackendStatus('✅ Backend подключён!');
        console.log('Backend response:', data);
      })
      .catch(err => {
        setBackendStatus('❌ Backend не подключён');
        console.error('Backend error:', err.message);
      });
  }, []);

  const testBackend = async () => {
    try {
      const data = await api.test();
      Alert.alert('Успех!', `Backend ответил: ${data.message}`);
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось подключиться к backend');
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